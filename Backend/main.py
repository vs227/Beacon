import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.auth import router as auth_router
from app.api.organizations import router as organizations_router
from app.api.workspaces import router as workspaces_router
from app.api.knowledge_bases import router as kb_router
from app.api.api_keys import router as api_keys_router
from app.api.projects import router as projects_router
from app.api.documents import router as documents_router
from app.api.search import router as search_router
from app.api.webhooks import router as webhooks_router

app = FastAPI(
    title="Beacon API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(organizations_router)
app.include_router(workspaces_router)
app.include_router(kb_router)
app.include_router(api_keys_router)
app.include_router(projects_router)
app.include_router(documents_router)
app.include_router(search_router)
app.include_router(webhooks_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to Beacon API",
        "status": "online",
        "docs": "/docs"
    }