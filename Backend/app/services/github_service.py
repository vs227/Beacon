import re
import tempfile
import logging
from pathlib import Path
from typing import List, Dict, Any, Tuple
import httpx

from app.core.database import supabase
from RAG.dataIngestion.loader import load_file
from RAG.dataIngestion.chunker import split_documents
from RAG.dataIngestion.embeddings import generate_embeddings

logger = logging.getLogger(__name__)

SUPPORTED_EXTENSIONS = {
    ".md", ".pdf", ".txt", ".docx", ".csv", ".json",
    ".py", ".js", ".ts", ".jsx", ".tsx", ".html", ".css",
    ".yaml", ".yml", ".go", ".rs", ".java", ".cpp", ".c", ".h"
}


def parse_github_url(url: str) -> Tuple[str, str]:
    """Extract (owner, repo) from various GitHub URL formats."""
    cleaned = url.strip().rstrip("/")
    if cleaned.endswith(".git"):
        cleaned = cleaned[:-4]

    match = re.search(r"github\.com/([^/]+)/([^/]+)", cleaned)
    if match:
        return match.group(1), match.group(2)

    parts = cleaned.split("/")
    if len(parts) == 2 and not cleaned.startswith("http"):
        return parts[0], parts[1]

    raise ValueError(f"Invalid GitHub repository URL: {url}")


def get_default_branch(owner: str, repo: str) -> str:
    """Fetch default branch (main/master) for a GitHub repository."""
    headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "Beacon-App"}
    api_url = f"https://api.github.com/repos/{owner}/{repo}"

    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(api_url, headers=headers)
            if resp.status_code == 200:
                return resp.json().get("default_branch", "main")
    except Exception as e:
        logger.warning(f"Failed to fetch default branch for {owner}/{repo}: {e}")

    return "main"


def get_latest_commit_sha(owner: str, repo: str, branch: str = "main") -> str:
    """Fetch latest commit SHA for update detection."""
    headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "Beacon-App"}
    api_url = f"https://api.github.com/repos/{owner}/{repo}/commits/{branch}"

    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(api_url, headers=headers)
            if resp.status_code == 200:
                return resp.json().get("sha", "")[:7]
    except Exception as e:
        logger.warning(f"Failed to fetch commit SHA for {owner}/{repo}: {e}")

    return "latest"


def scan_github_repository(repo_url: str) -> Dict[str, Any]:
    """
    Scan GitHub repository tree using GitHub REST API.
    Returns list of supported files with path, size, and extension.
    """
    owner, repo = parse_github_url(repo_url)
    branch = get_default_branch(owner, repo)
    commit_sha = get_latest_commit_sha(owner, repo, branch)

    headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "Beacon-App"}
    tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"

    with httpx.Client(timeout=15.0) as client:
        resp = client.get(tree_url, headers=headers)
        if resp.status_code != 200:
            if branch == "main":
                branch = "master"
                tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
                resp = client.get(tree_url, headers=headers)

            if resp.status_code != 200:
                raise ValueError(f"GitHub API Error ({resp.status_code}): Could not access repository {owner}/{repo}")

    tree_data = resp.json().get("tree", [])

    supported_files = []
    for item in tree_data:
        if item.get("type") == "blob":
            path = item.get("path", "")
            ext = Path(path).suffix.lower()

            if ext in SUPPORTED_EXTENSIONS:
                file_size = item.get("size", 0)
                file_category = "doc" if ext in {".md", ".pdf", ".txt", ".docx", ".csv", ".json"} else "code"

                supported_files.append({
                    "path": path,
                    "name": Path(path).name,
                    "size_bytes": file_size,
                    "extension": ext.replace(".", ""),
                    "category": file_category,
                    "raw_url": f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}"
                })

    return {
        "owner": owner,
        "repo": repo,
        "branch": branch,
        "commit_sha": commit_sha,
        "repo_url": f"https://github.com/{owner}/{repo}",
        "total_detected": len(supported_files),
        "files": supported_files,
    }


def fetch_raw_file(owner: str, repo: str, branch: str, path: str) -> bytes:
    """Fetch raw file content directly from GitHub in-memory."""
    raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}"
    headers = {"User-Agent": "Beacon-App"}

    with httpx.Client(timeout=20.0, follow_redirects=True) as client:
        resp = client.get(raw_url, headers=headers)
        if resp.status_code != 200:
            raise ValueError(f"Failed to fetch {path} from GitHub (HTTP {resp.status_code})")
        return resp.content


def create_or_get_github_document(
    project_id: str,
    organization_id: str,
    repo_url: str,
    owner_id: str,
) -> Dict[str, Any]:
    """Create or update parent document entry synchronously for status tracking."""
    owner, repo = parse_github_url(repo_url)
    repo_name_str = f"GitHub Repo: {owner}/{repo}"

    if not supabase:
        return {}

    existing = supabase.table("documents") \
        .select("*") \
        .eq("project_id", project_id) \
        .eq("file_name", repo_name_str) \
        .execute()

    if existing.data:
        doc_id = existing.data[0]["id"]
        res = supabase.table("documents").update({
            "status": "processing",
            "error_message": None,
        }).eq("id", doc_id).execute()
        return res.data[0] if res.data else existing.data[0]
    else:
        ins = supabase.table("documents").insert({
            "project_id": project_id,
            "organization_id": organization_id,
            "file_name": repo_name_str,
            "file_type": "github",
            "file_size_bytes": 0,
            "storage_path": f"https://github.com/{owner}/{repo}",
            "status": "processing",
            "chunk_count": 0,
            "uploaded_by": owner_id,
        }).execute()
        return ins.data[0] if ins.data else {}


def ingest_github_selected_files(
    project_id: str,
    organization_id: str,
    repo_url: str,
    selected_file_paths: List[str],
    owner_id: str,
) -> Dict[str, Any]:
    """
    In-memory stream ingestion:
    1. Parse owner/repo and fetch latest commit_sha.
    2. Get or create parent document entry in `documents`.
    3. Purge existing vector chunks for this document_id.
    4. Stream selected files in-memory, chunk, embed, and store in document_chunks.
    """
    owner, repo = parse_github_url(repo_url)
    branch = get_default_branch(owner, repo)
    commit_sha = get_latest_commit_sha(owner, repo, branch)

    # 1. Get or create parent Document entry
    doc = create_or_get_github_document(project_id, organization_id, repo_url, owner_id)
    doc_id = doc.get("id")

    # 2. Purge old chunks for this document_id
    if supabase and doc_id:
        try:
            supabase.table("document_chunks") \
                .delete() \
                .eq("document_id", doc_id) \
                .execute()
        except Exception as e:
            logger.warning(f"Could not purge old chunks for doc_id {doc_id}: {e}")

    total_chunks_created = 0
    all_chunk_rows = []

    # 3. Stream & process each file in-memory
    for file_path in selected_file_paths:
        try:
            file_bytes = fetch_raw_file(owner, repo, branch, file_path)
            file_ext = Path(file_path).suffix.lower()
            if not file_ext:
                file_ext = ".txt"

            # Use temp file for loader file-type handling
            with tempfile.NamedTemporaryFile(suffix=file_ext, delete=False) as tmp:
                tmp.write(file_bytes)
                tmp_path = Path(tmp.name)

            try:
                documents = load_file(tmp_path)
                for d in documents:
                    d.metadata["source_repo"] = f"https://github.com/{owner}/{repo}"
                    d.metadata["source_file"] = file_path
                    d.metadata["commit_sha"] = commit_sha
                    d.metadata["github_url"] = f"https://github.com/{owner}/{repo}/blob/{branch}/{file_path}"
                    if doc_id:
                        d.metadata["document_id"] = doc_id
            finally:
                if tmp_path.exists():
                    tmp_path.unlink()

            if not documents:
                continue

            # Split into chunks
            chunks = split_documents(documents, chunk_size=1000, chunk_overlap=200)
            if not chunks:
                continue

            # Generate embeddings
            texts = [c.page_content for c in chunks]
            embeddings = generate_embeddings(texts, batch_size=32)

            for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                meta = chunk.metadata.copy()
                meta["file_name"] = Path(file_path).name
                meta["file_path"] = file_path
                meta["file_type"] = file_ext.replace(".", "")
                meta["source_repo"] = f"https://github.com/{owner}/{repo}"
                meta["commit_sha"] = commit_sha

                row = {
                    "project_id": project_id,
                    "chunk_index": total_chunks_created + idx,
                    "content": chunk.page_content,
                    "token_count": len(chunk.page_content.split()),
                    "embedding": embedding.tolist(),
                    "metadata": meta,
                }
                if doc_id:
                    row["document_id"] = doc_id

                all_chunk_rows.append(row)

            total_chunks_created += len(chunks)

        except Exception as err:
            logger.error(f"Error processing GitHub file {file_path}: {err}")

    # 4. Batch insert chunk rows to Supabase
    if supabase and all_chunk_rows:
        try:
            batch_size = 100
            for i in range(0, len(all_chunk_rows), batch_size):
                batch = all_chunk_rows[i : i + batch_size]
                supabase.table("document_chunks").insert(batch).execute()
        except Exception as e:
            logger.error(f"Failed to insert document chunks for doc {doc_id}: {e}")
            if doc_id:
                supabase.table("documents").update({
                    "status": "failed",
                    "error_message": f"Ingestion error: {str(e)}",
                }).eq("id", doc_id).execute()
            return {
                "status": "failed",
                "error": str(e),
            }

    # 5. Update GitHub Document Entry status to completed
    if supabase and doc_id:
        supabase.table("documents").update({
            "status": "completed",
            "chunk_count": total_chunks_created,
            "error_message": f"Synced SHA {commit_sha} ({len(selected_file_paths)} files)",
        }).eq("id", doc_id).execute()

    return {
        "status": "success",
        "repo_url": f"https://github.com/{owner}/{repo}",
        "commit_sha": commit_sha,
        "files_indexed": len(selected_file_paths),
        "total_chunks": total_chunks_created,
    }


def check_and_auto_sync_github_repo(doc: Dict[str, Any], background_tasks: Any) -> bool:
    """
    Vercel-style Auto-Detector:
    1. Parse owner/repo from storage_path or metadata.
    2. Check latest commit SHA from GitHub API.
    3. If new commit SHA detected vs stored SHA, automatically trigger re-indexing!
    """
    repo_url = doc.get("storage_path", "")
    if not repo_url or not repo_url.startswith("http"):
        return False

    try:
        owner, repo = parse_github_url(repo_url)
        branch = get_default_branch(owner, repo)
        latest_sha = get_latest_commit_sha(owner, repo, branch)

        stored_msg = doc.get("error_message") or ""
        if f"SHA {latest_sha}" in stored_msg or latest_sha == "latest":
            return False  # Up to date!

        logger.info(f"Vercel-style Auto-Sync: detected new commit {latest_sha} for {owner}/{repo}. Auto-updating vectors...")

        if supabase:
            supabase.table("documents").update({
                "status": "processing",
                "error_message": f"Auto-syncing commit {latest_sha}...",
            }).eq("id", doc["id"]).execute()

        scan_res = scan_github_repository(repo_url)
        md_files = [f["path"] for f in scan_res["files"] if f["extension"] == "md"]
        files_to_sync = md_files if md_files else [f["path"] for f in scan_res["files"]]

        background_tasks.add_task(
            ingest_github_selected_files,
            project_id=doc["project_id"],
            organization_id=doc["organization_id"],
            repo_url=repo_url,
            selected_file_paths=files_to_sync,
            owner_id=doc.get("uploaded_by", ""),
        )
        return True
    except Exception as e:
        logger.warning(f"Auto-sync commit check failed for {repo_url}: {e}")
        return False

