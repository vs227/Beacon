from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
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
from app.models.models import (
    RegisterUser,
    LoginUser
)

app = FastAPI(
    title="Beacon API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAILS_URL = "https://api.github.com/user/emails"
FRONTEND_REDIRECT = "http://localhost:8000/docs"  


@app.get("/")
def home():
    return {
        "message": "Welcome to Beacon API"
    }

@app.post("/register")
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

@app.post("/login")
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
        "token_type": "bearer"
    }

@app.get("/me")
def get_profile(
    current_user=Depends(get_current_user)
):
    return {
        "message": "Authenticated",
        "user": current_user
    }

@app.get("/auth/github")
def github_login():
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="GitHub OAuth is not configured (missing GITHUB_CLIENT_ID)"
        )
    callback = "http://localhost:8000/auth/github/callback"
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": callback,
        "scope": "read:user user:email"
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(url=f"{GITHUB_AUTH_URL}?{query}")

@app.get("/auth/github/callback")
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

    result = {
        "message": "GitHub login successful",
        "access_token": jwt_token,
        "token_type": "bearer",
        "user": {"id": db_user["id"], "email": db_user["email"], "username": db_user.get("username")}
    }
    return JSONResponse(content=result)