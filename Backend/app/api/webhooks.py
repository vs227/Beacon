import logging
from typing import Dict, Any, List
from fastapi import APIRouter, BackgroundTasks, Request, HTTPException
from app.core.database import supabase
from app.services.github_service import (
    parse_github_url,
    scan_github_repository,
    ingest_github_selected_files,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/webhooks",
    tags=["Webhooks"],
)


def _background_reindex_repository(
    canonical_repo_url: str,
    commit_sha: str,
    doc_entries: List[Dict[str, Any]],
):
    """
    Background worker that scans the repo tree and re-indexes
    all matching connected projects without blocking HTTP responses.
    """
    try:
        scan_res = scan_github_repository(canonical_repo_url)
        md_files = [f["path"] for f in scan_res["files"] if f["extension"] == "md"]
        files_to_index = md_files if md_files else [f["path"] for f in scan_res["files"]]

        for doc in doc_entries:
            proj_id = doc["project_id"]
            org_id = doc["organization_id"]
            owner_id = doc.get("uploaded_by", "")

            logger.info(f"Webhook background re-indexing project {proj_id} for repo {canonical_repo_url}")
            ingest_github_selected_files(
                project_id=proj_id,
                organization_id=org_id,
                repo_url=canonical_repo_url,
                selected_file_paths=files_to_index,
                owner_id=owner_id,
            )
    except Exception as e:
        logger.error(f"Background webhook re-indexing failed for {canonical_repo_url}: {e}")


@router.post("/github")
async def github_webhook_handler(
    request: Request,
    background_tasks: BackgroundTasks,
):
    """
    Automated GitHub Push Webhook Handler:
    1. Listens for GitHub 'push' events.
    2. Responds to GitHub instantly (<100ms) with 200 OK.
    3. Triggers background purging of old chunks & automated re-indexing of latest commit files.
    """
    event_type = request.headers.get("X-GitHub-Event", "push")

    if event_type not in ["push", "ping"]:
        return {"status": "ignored", "reason": f"Event type '{event_type}' not processed."}

    payload: Dict[str, Any] = await request.json()

    if event_type == "ping":
        return {"status": "pong", "zen": payload.get("zen", "")}

    # Extract repository details
    repo_data = payload.get("repository", {})
    repo_html_url = repo_data.get("html_url", "")
    commit_sha = payload.get("after", "")[:7] if payload.get("after") else "latest"

    if not repo_html_url:
        raise HTTPException(status_code=400, detail="Missing repository html_url in payload.")

    try:
        owner, repo = parse_github_url(repo_html_url)
        canonical_repo_url = f"https://github.com/{owner}/{repo}"
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid GitHub URL in webhook: {e}")

    logger.info(f"GitHub Webhook received: Push to {canonical_repo_url} (commit {commit_sha})")

    # Find connected project documents in database
    if not supabase:
        return {"status": "error", "reason": "Database client unavailable."}

    matched_docs = supabase.table("documents") \
        .select("*") \
        .eq("file_type", "github") \
        .ilike("storage_path", f"%{owner}/{repo}%") \
        .execute()

    docs = matched_docs.data or []
    if not docs:
        logger.info(f"No connected Beacon projects found for GitHub repo {canonical_repo_url}")
        return {
            "status": "ignored",
            "message": f"No active Beacon projects connected to repository {owner}/{repo}",
        }

    # Dispatch non-blocking background re-indexing task
    background_tasks.add_task(
        _background_reindex_repository,
        canonical_repo_url=canonical_repo_url,
        commit_sha=commit_sha,
        doc_entries=docs,
    )

    return {
        "status": "queued",
        "message": f"Automated re-indexing queued for commit {commit_sha}",
        "repo_url": canonical_repo_url,
        "affected_projects_count": len(docs),
    }
