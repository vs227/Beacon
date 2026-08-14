"""
Ingestion Service Bridge

Connects FastAPI backend background tasks and semantic search endpoints
to the RAG/dataIngestion pipeline.
"""
import tempfile
import logging
from pathlib import Path
from typing import List, Dict, Any

from app.core.database import supabase
from app.services.document_service import get_file_bytes
from RAG.dataIngestion.loader import load_file
from RAG.dataIngestion.chunker import split_documents
from RAG.dataIngestion.embeddings import generate_embeddings, get_embedding_model

logger = logging.getLogger(__name__)


def run_ingestion(document_id: str) -> None:
    """
    Full pipeline: download file from storage → save temp file → load via RAG loader →
    chunk → generate 384D embeddings → store in Supabase document_chunks.
    """
    try:
        # Mark status as processing
        supabase.table("documents").update({"status": "processing"}).eq("id", document_id).execute()

        # Fetch document metadata
        result = supabase.table("documents").select("*").eq("id", document_id).execute()
        if not result.data:
            logger.error(f"Document {document_id} not found")
            return
        doc = result.data[0]

        # Download raw file bytes
        file_bytes = get_file_bytes(doc["storage_path"])

        # Save to temp file to leverage loader file extension detection
        file_ext = doc["file_type"]
        if not file_ext.startswith("."):
            file_ext = f".{file_ext}"

        with tempfile.NamedTemporaryFile(suffix=file_ext, delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = Path(tmp.name)

        try:
            # 1. Load document via RAG loader
            documents = load_file(tmp_path)
            # Override metadata to reflect actual file name
            for d in documents:
                d.metadata["source_file"] = doc["file_name"]
                d.metadata["document_id"] = document_id
        finally:
            # Delete temp file
            if tmp_path.exists():
                tmp_path.unlink()

        if not documents:
            supabase.table("documents").update({
                "status": "failed",
                "error_message": "No text content could be extracted from the document."
            }).eq("id", document_id).execute()
            return

        # 2. Chunk documents
        chunks = split_documents(documents, chunk_size=1000, chunk_overlap=200)
        if not chunks:
            supabase.table("documents").update({
                "status": "failed",
                "error_message": "Document produced no usable text chunks."
            }).eq("id", document_id).execute()
            return

        # 3. Generate embeddings
        texts = [c.page_content for c in chunks]
        embeddings = generate_embeddings(texts, batch_size=32)

        # 4. Prepare batch rows for Supabase insertion
        chunk_rows = []
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            meta = chunk.metadata.copy()
            meta["file_name"] = doc["file_name"]
            meta["file_type"] = doc["file_type"]

            chunk_rows.append({
                "document_id": document_id,
                "project_id": doc["project_id"],
                "organization_id": doc["organization_id"],
                "chunk_index": idx,
                "content": chunk.page_content,
                "token_count": len(chunk.page_content.split()),
                "embedding": embedding.tolist(),
                "metadata": meta,
            })

        # Batch insert to document_chunks
        batch_size = 100
        for i in range(0, len(chunk_rows), batch_size):
            batch = chunk_rows[i : i + batch_size]
            supabase.table("document_chunks").insert(batch).execute()

        # Mark as completed
        supabase.table("documents").update({
            "status": "completed",
            "chunk_count": len(chunks),
        }).eq("id", document_id).execute()

        logger.info(f"Document {document_id}: successfully ingested ({len(chunks)} chunks)")

    except Exception as e:
        logger.exception(f"Ingestion failed for document {document_id}")
        try:
            supabase.table("documents").update({
                "status": "failed",
                "error_message": str(e)[:500],
            }).eq("id", document_id).execute()
        except Exception:
            pass


def semantic_search(
    project_id: str,
    query: str,
    top_k: int = 5,
) -> List[Dict[str, Any]]:
    """
    Embed the search query, then run cosine similarity search against document_chunks
    using Supabase RPC match_document_chunks.
    """
    model = get_embedding_model()
    query_embedding = model.encode([query], normalize_embeddings=True)[0].tolist()

    try:
        result = supabase.rpc(
            "match_document_chunks",
            {
                "query_embedding": query_embedding,
                "match_project_id": project_id,
                "match_count": top_k,
            },
        ).execute()
    except Exception as e:
        logger.error(f"Semantic search failed: {e}")
        return []

    return result.data or []
