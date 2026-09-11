import gc
import tempfile
import logging
from pathlib import Path
from typing import List, Dict, Any

from app.core.database import supabase
from app.services.document_service import get_file_bytes
from RAG.dataIngestion.loader import load_file
from RAG.dataIngestion.chunker import split_documents
from RAG.dataIngestion.embeddings import generate_embeddings

logger = logging.getLogger(__name__)


def run_ingestion(document_id: str) -> None:
    """
    Full pipeline: download file from storage → save temp file → load via RAG loader →
    chunk → generate 384D embeddings in micro-batches → store in Supabase document_chunks.
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

        # Guard: GitHub documents use a separate ingestion pipeline (ingest_github_selected_files).
        if doc.get("file_type") == "github":
            logger.warning(f"Document {document_id} is a GitHub document — use GitHub import pipeline instead.")
            supabase.table("documents").update({
                "status": "failed",
                "error_message": "GitHub documents must be ingested via the GitHub import flow, not the file upload pipeline.",
            }).eq("id", document_id).execute()
            return

        # Download raw file bytes
        file_bytes = get_file_bytes(doc["storage_path"])

        # Save to temp file to leverage loader file extension detection
        file_ext = doc["file_type"]
        if not file_ext.startswith("."):
            file_ext = f".{file_ext}"

        with tempfile.NamedTemporaryFile(suffix=file_ext, delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = Path(tmp.name)

        # Free raw bytes reference immediately
        del file_bytes
        gc.collect()

        try:
            # 1. Load document via RAG loader
            documents = load_file(tmp_path)
            for d in documents:
                d.metadata["source_file"] = doc["file_name"]
                d.metadata["document_id"] = document_id
        finally:
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
        del documents
        gc.collect()

        if not chunks:
            supabase.table("documents").update({
                "status": "failed",
                "error_message": "Document produced no usable text chunks."
            }).eq("id", document_id).execute()
            return

        # Purge any existing chunks for this document before inserting fresh ones
        if supabase:
            try:
                supabase.table("document_chunks").delete().eq("document_id", document_id).execute()
            except Exception as purge_err:
                logger.warning(f"Could not purge old chunks for document {document_id}: {purge_err}")

        # 3. Micro-batched Embedding & Database Insertion (25 chunks per batch to cap RAM usage)
        micro_batch_size = 25
        total_chunks = len(chunks)

        for i in range(0, total_chunks, micro_batch_size):
            batch_chunks = chunks[i : i + micro_batch_size]
            batch_texts = [c.page_content for c in batch_chunks]

            embeddings = generate_embeddings(batch_texts, batch_size=16)

            chunk_rows = []
            for idx, (chunk, embedding) in enumerate(zip(batch_chunks, embeddings)):
                meta = chunk.metadata.copy()
                meta["file_name"] = doc["file_name"]
                meta["file_type"] = doc["file_type"]

                chunk_rows.append({
                    "document_id": document_id,
                    "project_id": doc["project_id"],
                    "organization_id": doc["organization_id"],
                    "chunk_index": i + idx,
                    "content": chunk.page_content,
                    "token_count": len(chunk.page_content.split()),
                    "embedding": embedding.tolist(),
                    "metadata": meta,
                })

            if supabase and chunk_rows:
                supabase.table("document_chunks").insert(chunk_rows).execute()

            # Clear intermediate batch objects immediately
            del batch_chunks, batch_texts, embeddings, chunk_rows
            gc.collect()

        # Mark as completed
        supabase.table("documents").update({
            "status": "completed",
            "chunk_count": total_chunks,
        }).eq("id", document_id).execute()

        logger.info(f"Document {document_id}: successfully ingested ({total_chunks} chunks)")

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
    try:
        embeddings = generate_embeddings([query], batch_size=1)
        if len(embeddings) == 0:
            return []
        query_embedding = embeddings[0].tolist()
    except Exception as err:
        logger.error(f"Failed to generate query embedding: {err}")
        return []

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

