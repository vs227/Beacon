"""
Document CRUD service — handles file storage in Supabase Storage
and metadata persistence in the documents table.
"""
import uuid
from fastapi import HTTPException, status, UploadFile
from postgrest.exceptions import APIError as PostgrestAPIError
from app.core.database import supabase
from app.services.project_service import get_project_by_id

STORAGE_BUCKET = "documents"
ALLOWED_EXTENSIONS = {"pdf", "txt", "md", "docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _get_extension(filename: str) -> str:
    """Extract lowercase file extension."""
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


async def upload_document(
    organization_id: str,
    project_id: str,
    owner_id: str,
    file: UploadFile,
) -> dict:
    """Upload a document to Supabase Storage and create a metadata row."""

    # Verify project ownership
    get_project_by_id(project_id, owner_id)

    # Validate file
    ext = _get_extension(file.filename or "")
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: .{ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB.",
        )

    # Build unique storage path
    file_id = str(uuid.uuid4())
    storage_path = f"{organization_id}/{project_id}/{file_id}.{ext}"

    # Upload to Supabase Storage
    try:
        supabase.storage.from_(STORAGE_BUCKET).upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": file.content_type or "application/octet-stream"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file to storage: {str(e)}",
        )

    # Insert metadata row
    payload = {
        "id": file_id,
        "project_id": project_id,
        "organization_id": organization_id,
        "file_name": file.filename,
        "file_type": ext,
        "file_size_bytes": len(file_bytes),
        "storage_path": storage_path,
        "status": "pending",
        "uploaded_by": owner_id,
    }

    try:
        result = supabase.table("documents").insert(payload).execute()
    except PostgrestAPIError as e:
        # Cleanup storage if DB insert fails
        try:
            supabase.storage.from_(STORAGE_BUCKET).remove([storage_path])
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}",
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create document record",
        )

    return result.data[0]


def get_documents(project_id: str, owner_id: str) -> list[dict]:
    """List all documents for a project."""
    try:
        result = (
            supabase.table("documents")
            .select("*")
            .eq("project_id", project_id)
            .order("created_at", desc=True)
            .execute()
        )
    except PostgrestAPIError as e:
        if e.code == "22P02":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid UUID format for project_id: '{project_id}'",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}",
        )
    return result.data or []


def get_document(document_id: str, owner_id: str) -> dict:
    """Get a single document by ID."""
    try:
        result = supabase.table("documents").select("*").eq("id", document_id).execute()
    except PostgrestAPIError as e:
        if e.code == "22P02":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid UUID format for document_id: '{document_id}'",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}",
        )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return result.data[0]


def delete_document(document_id: str, owner_id: str) -> dict:
    """Delete a document from storage and database (chunks cascade)."""
    doc = get_document(document_id, owner_id)

    # Remove from Supabase Storage
    try:
        supabase.storage.from_(STORAGE_BUCKET).remove([doc["storage_path"]])
    except Exception:
        pass  # Don't fail if storage cleanup errors

    # Delete DB row (cascades to chunks)
    try:
        supabase.table("documents").delete().eq("id", document_id).execute()
    except PostgrestAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}",
        )

    return {"message": "Document deleted successfully", "id": document_id}


def get_file_bytes(storage_path: str) -> bytes:
    """Download raw file bytes from Supabase Storage."""
    try:
        data = supabase.storage.from_(STORAGE_BUCKET).download(storage_path)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download file from storage: {str(e)}",
        )
