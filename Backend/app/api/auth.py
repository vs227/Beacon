from urllib.parse import urlencode, urlparse
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse
import httpx

from app.core.config import settings
from app.core.auth import get_current_user
from app.schemas.auth import RegisterUser, LoginUser
from app.core.limiter import limiter
from app.services import auth_service

router = APIRouter(tags=["Authentication"])

GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAILS_URL = "https://api.github.com/user/emails"


def _get_frontend_url(state: str | None = None) -> str:
    """Return configured frontend URL, ensuring trailing slash for path joins."""
    if state and state.startswith("http"):
        url = state
    elif settings.FRONTEND_URL and "localhost" not in settings.FRONTEND_URL:
        url = settings.FRONTEND_URL
    elif "onrender.com" in (settings.BACKEND_URL or ""):
        url = settings.FRONTEND_URL if settings.FRONTEND_URL and "localhost" not in settings.FRONTEND_URL else "https://beacon-seven-iota.vercel.app"
    else:
        url = settings.FRONTEND_URL or "http://localhost:5173"
    return url if url.endswith('/') else f"{url}/"


def _build_github_oauth_callback_url(request: Request | None = None) -> str:
    """Build the callback URL configured in the GitHub OAuth app."""
    if settings.BACKEND_URL and "localhost" not in settings.BACKEND_URL:
        backend_base = settings.BACKEND_URL.rstrip('/')
    elif request:
        backend_base = str(request.base_url).rstrip('/')
    else:
        backend_base = (settings.BACKEND_URL or "http://localhost:8000").rstrip('/')
    return f"{backend_base}/auth/github/callback"


@router.post("/register")
@limiter.limit("3/minute")
def register(request: Request, user: RegisterUser):
    registered_user = auth_service.register_user(
        username=user.username,
        email=user.email,
        password=user.password,
    )
    return {
        "message": "User registered successfully",
        "user": registered_user,
    }


@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, user: LoginUser):
    auth_result = auth_service.authenticate_user(
        email=user.email,
        password=user.password,
    )
    return {
        "message": "Login successful",
        "access_token": auth_result["access_token"],
        "token_type": auth_result["token_type"],
        "user": auth_result["user"],
    }


@router.get("/me")
def get_profile(current_user: dict = Depends(get_current_user)):
    profile = auth_service.get_user_profile(user_id=current_user["user_id"])
    return {
        "message": "Authenticated",
        "user": profile,
    }


@router.api_route("/auth/github", methods=["GET", "HEAD"])
def github_login(request: Request, redirect_origin: str | None = None):
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="GitHub OAuth is not configured (missing GITHUB_CLIENT_ID)",
        )

    origin = redirect_origin or request.headers.get("referer") or ""
    if origin and "http" in origin:
        parsed = urlparse(origin)
        origin = f"{parsed.scheme}://{parsed.netloc}"
    else:
        origin = ""

    callback = _build_github_oauth_callback_url(request)
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": callback,
        "scope": "read:user user:email",
    }
    if origin:
        params["state"] = origin

    return RedirectResponse(url=f"{GITHUB_AUTH_URL}?{urlencode(params)}")


@router.get("/auth/github/callback")
async def github_callback(code: str | None = None, error: str | None = None, state: str | None = None):
    if error or not code:
        raise HTTPException(
            status_code=400,
            detail=f"GitHub OAuth error: {error or 'No code provided'}",
        )

    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="GitHub OAuth is not configured",
        )

    token_payload = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "client_secret": settings.GITHUB_CLIENT_SECRET,
        "code": code,
    }

    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            GITHUB_TOKEN_URL,
            json=token_payload,
            headers={"Accept": "application/json"},
        )
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to get GitHub access token: {token_data}",
            )

        auth_headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
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

    gh_res = auth_service.handle_github_oauth_user(
        email=email,
        username=username,
        access_token=access_token,
    )

    query = urlencode({
        "auth": "github",
        "token": gh_res["jwt_token"],
        "email": email,
        "username": username,
    })
    frontend_url = _get_frontend_url(state)
    sep = "&" if "?" in frontend_url else "?"
    redirect_to = f"{frontend_url}{sep}{query}"
    return RedirectResponse(url=redirect_to)
