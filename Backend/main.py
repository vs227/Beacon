import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.auth import router as auth_router
from app.api.organizations import router as organizations_router
from app.api.workspaces import router as workspaces_router
from app.api.knowledge_bases import router as kb_router
from app.api.api_keys import router as api_keys_router

app = FastAPI(
    title="Beacon API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(organizations_router)
app.include_router(workspaces_router)
app.include_router(kb_router)
app.include_router(api_keys_router)

# Mount Frontend directory for easy local testing
frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Frontend"))
if os.path.exists(frontend_path):
    app.mount("/frontend", StaticFiles(directory=frontend_path, html=True), name="frontend")


@app.get("/")
def home():
    return {
        "message": "Welcome to Beacon API",
        "docs": "http://localhost:8000/docs",
        "frontend": "http://localhost:8000/frontend/"
    }