from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class DocumentResponse(BaseModel):
    id: str
    project_id: str
    organization_id: str
    file_name: str
    file_type: str
    file_size_bytes: int = 0
    storage_path: str
    status: str = "pending"
    error_message: Optional[str] = None
    chunk_count: int = 0
    uploaded_by: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChunkResponse(BaseModel):
    id: str
    document_id: str
    project_id: str
    chunk_index: int
    content: str
    token_count: int = 0
    metadata: Optional[dict] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    top_k: int = Field(5, ge=1, le=50)


class SearchResult(BaseModel):
    chunk_id: str
    document_id: str
    document_name: str
    content: str
    chunk_index: int
    similarity: float
    metadata: Optional[dict] = None


class GitHubScanRequest(BaseModel):
    repo_url: str = Field(..., description="GitHub repository URL or owner/repo format")


class GitHubImportRequest(BaseModel):
    repo_url: str = Field(..., description="GitHub repository URL")
    selected_files: List[str] = Field(..., description="List of file paths to ingest")


class GitHubSyncRequest(BaseModel):
    repo_url: str = Field(..., description="GitHub repository URL to sync")
    selected_files: Optional[List[str]] = Field(None, description="Optional updated file paths")
