from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse, JSONResponse
import httpx
from postgrest.exceptions import APIError as PostgrestAPIError
from app.core.database import supabase
from app.core.config import settings
from app.core.auth import (
    hash_password,
    verify_password,
    create_token,
    get_current_user
)
from app.schemas.auth import (
    RegisterUser,
    LoginUser
)

router = APIRouter(tags=["Authentication"])

GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAILS_URL = "https://api.github.com/user/emails"

# Where GitHub OAuth should redirect the user on success.
# Dev: Vite runs on port 5173.
# Production: replace with your hosted frontend URL, e.g. "https://beacon.app".
FRONTEND_AFTER_AUTH = "http://localhost:5173/"


def _build_github_oauth_callback_url() -> str:
    """Build the callback URL that GitHub should redirect back to.

    Matches the Authorization callback URL configured in the GitHub OAuth app.
    """
    return "http://localhost:8000/auth/github/callback"


@router.post("/register")
def register(user: RegisterUser):
    hashed_password = hash_password(user.password)
    try:
        result = (
            supabase
            .table("users")
            .insert({
                "username": user.username,
                "email": user.email,
                "password_hash": hashed_password,
                "auth_provider": "email"
            })
            .execute()
        )
    except PostgrestAPIError as e:
        if e.code == "23505":
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {e.message}"
        )

    return {
        "message": "User registered successfully",
        "user": result.data[0]
    }


@router.post("/login")
def login(user: LoginUser):
    try:
        result = (
            supabase
            .table("users")
            .select("*")
            .eq("email", user.email)
            .execute()
        )
    except PostgrestAPIError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {e.message}"
        )
    if not result.data:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    db_user = result.data[0]

    if db_user.get("auth_provider") == "github" and not db_user.get("password_hash"):
        raise HTTPException(
            status_code=401,
            detail="This account was created with GitHub. Please log in using GitHub."
        )

    if not db_user.get("password_hash") or not verify_password(
        user.password,
        db_user["password_hash"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_token({
        "user_id": db_user["id"],
        "email": db_user["email"]
    })

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user["id"],
            "username": db_user.get("username", db_user["email"].split("@")[0]),
            "email": db_user["email"]
        }
    }


@router.get("/me")
def get_profile(
    current_user=Depends(get_current_user)
):
    return {
        "message": "Authenticated",
        "user": current_user
    }


@router.get("/auth/github")
def github_login():
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="GitHub OAuth is not configured (missing GITHUB_CLIENT_ID)"
        )
    callback = _build_github_oauth_callback_url()
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": callback,
        "scope": "read:user user:email"
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(url=f"{GITHUB_AUTH_URL}?{query}")


@router.get("/auth/github/callback")
async def github_callback(code: str | None = None, error: str | None = None):
    if error or not code:
        raise HTTPException(
            status_code=400,
            detail=f"GitHub OAuth error: {error or 'No code provided'}"
        )

    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="GitHub OAuth is not configured"
        )

    token_payload = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "client_secret": settings.GITHUB_CLIENT_SECRET,
        "code": code
    }

    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            GITHUB_TOKEN_URL,
            json=token_payload,
            headers={"Accept": "application/json"}
        )
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to get GitHub access token: {token_data}"
            )

        auth_headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json"
        }

        user_res = await client.get(GITHUB_USER_URL, headers=auth_headers)
        gh_user = user_res.json()
        gh_id = str(gh_user.get("id"))
        username = gh_user.get("login", f"github_{gh_id}")
        email = gh_user.get("email")

        if not email:
            emails_res = await client.get(GITHUB_EMAILS_URL, headers=auth_headers)
            emails = emails_res.json()
            primary = next((e for e in emails if e.get("primary") and e.get("verified")), None)
            if not primary and emails:
                primary = emails[0]
            email = primary["email"] if primary else f"{gh_id}@github.local"

    try:
        existing = (
            supabase
            .table("users")
            .select("*")
            .eq("email", email)
            .execute()
        )
    except PostgrestAPIError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {e.message}"
        )

    if existing.data:
        db_user = existing.data[0]
    else:
        try:
            insert_res = (
                supabase
                .table("users")
                .insert({
                    "username": username,
                    "email": email,
                    "password_hash": "",
                    "auth_provider": "github"
                })
                .execute()
            )
            db_user = insert_res.data[0]
        except PostgrestAPIError as e:
            if e.code == "23505":
                lookup = (
                    supabase
                    .table("users")
                    .select("*")
                    .eq("email", email)
                    .execute()
                )
                if lookup.data:
                    db_user = lookup.data[0]
                else:
                    raise HTTPException(
                        status_code=400,
                        detail="Email already exists under another provider"
                    )
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Database error: {e.message}"
                )

    jwt_token = create_token({
        "user_id": db_user["id"],
        "email": db_user["email"]
    })

    # Redirect the user back to the frontend with the JWT in the query string.
    # The React app picks this up on mount, stores it in localStorage, and
    # clears it from the URL so the token doesn't linger in history.
    from urllib.parse import urlencode
    query = urlencode({
        "auth": "github",
        "token": jwt_token,
        "email": email,
        "username": username,
    })
    sep = "&" if "?" in FRONTEND_AFTER_AUTH else "?"
    redirect_to = f"{FRONTEND_AFTER_AUTH}{sep}{query}"
    return RedirectResponse(url=redirect_to)
