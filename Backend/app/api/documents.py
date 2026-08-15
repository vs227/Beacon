from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException, status
from app.core.auth import get_current_user
from app.schemas.document import (
    DocumentResponse,
    GitHubScanRequest,
    GitHubImportRequest,
    GitHubSyncRequest,
)
from app.services import document_service
from app.services.ingestion_service import run_ingestion
from app.services.github_service import (
    scan_github_repository,
    create_or_get_github_document,
    ingest_github_selected_files,
    check_and_auto_sync_github_repo,
    list_user_github_repos,
)

router = APIRouter(
    prefix="/organizations/{organization_id}/projects/{project_id}/documents",
    tags=["Documents"],
)


@router.post(
    "",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    organization_id: str,
    project_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload a document and trigger the ingestion pipeline."""
    doc = await document_service.upload_document(
        organization_id=organization_id,
        project_id=project_id,
        owner_id=current_user["user_id"],
        file=file,
    )
    # Trigger background ingestion
    background_tasks.add_task(run_ingestion, doc["id"])
    return doc


@router.get("/github-repos")
def list_github_repos(
    organization_id: str,
    project_id: str,
    current_user: dict = Depends(get_current_user),
):
    """List the authenticated user's GitHub repositories (requires GitHub OAuth login)."""
    from app.core.database import supabase as db

    # Fetch user's stored GitHub access token
    try:
        user_row = db.table("users").select("github_access_token, auth_provider").eq("id", current_user["user_id"]).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    if not user_row.data:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_row.data[0]
    gh_token = user_data.get("github_access_token", "")

    if not gh_token:
        raise HTTPException(
            status_code=400,
            detail="No GitHub token found. Please log in with GitHub to access your repositories."
        )

    try:
        repos = list_user_github_repos(gh_token)
        return {"repos": repos, "count": len(repos)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch repositories: {str(e)}")


@router.post("/github-scan")
def scan_github_repo(
    organization_id: str,
    project_id: str,
    body: GitHubScanRequest,
    current_user: dict = Depends(get_current_user),
):
    """Scan a public GitHub repository and return detected supported files."""
    try:
        return scan_github_repository(body.repo_url)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/github-import")
def import_github_files(
    organization_id: str,
    project_id: str,
    body: GitHubImportRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
):
    """Stream selected GitHub files in-memory, chunk, embed, and index into Supabase."""
    if not body.selected_files:
        raise HTTPException(status_code=400, detail="No files selected for import.")

    # Create document status record synchronously so the UI tracks processing status
    doc = create_or_get_github_document(
        project_id=project_id,
        organization_id=organization_id,
        repo_url=body.repo_url,
        owner_id=current_user["user_id"],
    )

    # Trigger in-memory ingestion background task
    background_tasks.add_task(
        ingest_github_selected_files,
        project_id=project_id,
        organization_id=organization_id,
        repo_url=body.repo_url,
        selected_file_paths=body.selected_files,
        owner_id=current_user["user_id"],
    )

    return {
        "status": "processing",
        "message": f"Queued {len(body.selected_files)} GitHub files for vector indexing.",
        "repo_url": body.repo_url,
        "document": doc,
    }



@router.post("/github-sync")
def sync_github_repo(
    organization_id: str,
    project_id: str,
    body: GitHubSyncRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
):
    """Check latest commit SHA for a connected GitHub repository, purge stale chunks, and re-index."""
    try:
        scan_res = scan_github_repository(body.repo_url)
        files_to_sync = body.selected_files or [f["path"] for f in scan_res["files"]]

        background_tasks.add_task(
            ingest_github_selected_files,
            project_id=project_id,
            organization_id=organization_id,
            repo_url=body.repo_url,
            selected_file_paths=files_to_sync,
            owner_id=current_user["user_id"],
        )

        return {
            "status": "syncing",
            "message": f"Syncing {len(files_to_sync)} files from {body.repo_url} (SHA {scan_res['commit_sha']})",
            "commit_sha": scan_res["commit_sha"],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Sync failed: {str(e)}")


@router.get(
    "",
    response_model=list[DocumentResponse],
)
def list_documents(
    organization_id: str,
    project_id: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
):
    """List all documents for a project and auto-detect GitHub commit updates (Vercel-style)."""
    docs = document_service.get_documents(
        project_id=project_id,
        owner_id=current_user["user_id"],
    )

    # Vercel-style auto-detection for connected GitHub repositories
    for doc in docs:
        if doc.get("file_type") == "github" and doc.get("status") == "completed":
            check_and_auto_sync_github_repo(doc, background_tasks)

    return docs


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def get_document(
    organization_id: str,
    project_id: str,
    document_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a single document's metadata."""
    return document_service.get_document(
        document_id=document_id,
        owner_id=current_user["user_id"],
    )


@router.delete("/{document_id}")
def delete_document(
    organization_id: str,
    project_id: str,
    document_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a document (cascades to chunks)."""
    return document_service.delete_document(
        document_id=document_id,
        owner_id=current_user["user_id"],
    )
