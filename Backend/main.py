from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.core.limiter import limiter


def _custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Return a clear, human-friendly 429 response."""
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Too many attempts. Please wait a minute and try again.",
            "retry_after": "60 seconds",
        },
        headers={"Retry-After": "60"},
    )

from app.api.auth import router as auth_router
from app.api.organizations import router as organizations_router
from app.api.workspaces import router as workspaces_router
from app.api.knowledge_bases import router as kb_router
from app.api.api_keys import router as api_keys_router
from app.api.activity import router as activity_router
from app.api.projects import router as projects_router
from app.api.documents import router as documents_router
from app.api.search import router as search_router
from app.api.webhooks import router as webhooks_router
from app.api.query import router as query_router



app = FastAPI(title="Beacon API", version="1.0.0")

@app.on_event("startup")
async def prewarm_rag_model():
    """Pre-warm embedding model at server startup to eliminate 1st query cold start latency."""
    try:
        from RAG.dataIngestion.embeddings import get_embedding_model
        get_embedding_model()
    except Exception as e:
        print(f"RAG model prewarm status: {e}")

# ── Fix 1: Rate limiting ──────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _custom_rate_limit_handler)
app.add_middleware(SlowAPIMiddleware)

# ── Fix 2: Body size limit (via middleware callback, no body buffering) ────────
@app.middleware("http")
async def limit_body_size(request: Request, call_next):
    max_bytes = 10 * 1024 * 1024  # 10 MB
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > max_bytes:
        return JSONResponse(
            status_code=413,
            content={"detail": "Request body too large. Maximum allowed size is 10 MB."},
        )
    return await call_next(request)

# ── Fix 3: Hide Server header ─────────────────────────────────────────────────
@app.middleware("http")
async def hide_server_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["Server"] = "Beacon"
    return response

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(organizations_router)
app.include_router(workspaces_router)
app.include_router(kb_router)
app.include_router(api_keys_router)
app.include_router(activity_router)
app.include_router(projects_router)
app.include_router(documents_router)
app.include_router(search_router)
app.include_router(webhooks_router)
app.include_router(query_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to Beacon API",
        "status": "online",
        "docs": "/docs"
    }