from pathlib import Path
from typing import List, Dict, Any
from app.core.database import supabase
from RAG.dataIngestion.loader import process_all_files, load_file
from RAG.dataIngestion.chunker import split_documents
from RAG.dataIngestion.embeddings import generate_embeddings


def store_embeddings_batch(rows: List[Dict[str, Any]]) -> None:
    """Batch insert vector rows into Supabase document_chunks table."""
    if not rows:
        return

    batch_size = 100
    for i in range(0, len(rows), batch_size):
        batch = rows[i : i + batch_size]
        supabase.table("document_chunks").insert(batch).execute()


def ingest_files(directory: str | Path, project_id: str, organization_id: str) -> List[Dict[str, Any]]:
    """
    Complete ingestion pipeline for a directory of files:
    1. Load multi-format files
    2. Split into chunks
    3. Generate 384D embeddings
    4. Store in Supabase pgvector database
    """
    # 1. Load files
    documents = process_all_files(directory)
    if not documents:
        print("No valid documents found for ingestion.")
        return []

    # 2. Split into chunks
    chunks = split_documents(documents)

    # 3. Generate embeddings
    texts = [chunk.page_content for chunk in chunks]
    embeddings = generate_embeddings(texts, batch_size=32)

    print(f"Embedding shape: {embeddings.shape}")

    # 4. Prepare rows & store in Supabase
    chunk_rows = []
    for chunk, embedding in zip(chunks, embeddings):
        chunk_rows.append({
            "project_id": project_id,
            "document_id": chunk.metadata.get("document_id"),  # optional
            "chunk_index": chunk.metadata.get("chunk_index", 0),
            "content": chunk.page_content,
            "token_count": len(chunk.page_content.split()),
            "embedding": embedding.tolist(),
            "metadata": chunk.metadata,
        })

    if supabase:
        store_embeddings_batch(chunk_rows)
        print(f"Successfully stored {len(chunk_rows)} vectors in Supabase.")

    print("Ingestion completed!")
    return chunk_rows


def ingest_single_file(file_path: str | Path, project_id: str, organization_id: str, document_id: str = None) -> List[Dict[str, Any]]:
    """Ingest a single uploaded file directly into the project's vector store."""
    documents = load_file(file_path)
    if not documents:
        return []

    chunks = split_documents(documents)
    texts = [chunk.page_content for chunk in chunks]
    embeddings = generate_embeddings(texts, batch_size=32)

    chunk_rows = []
    for chunk, embedding in zip(chunks, embeddings):
        meta = chunk.metadata.copy()
        if document_id:
            meta["document_id"] = document_id
        chunk_rows.append({
            "project_id": project_id,
            "document_id": document_id,
            "chunk_index": chunk.metadata.get("chunk_index", 0),
            "content": chunk.page_content,
            "token_count": len(chunk.page_content.split()),
            "embedding": embedding.tolist(),
            "metadata": meta,
        })

    if supabase:
        store_embeddings_batch(chunk_rows)

    return chunk_rows
