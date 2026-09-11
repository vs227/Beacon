import gc
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

    batch_size = 50
    for i in range(0, len(rows), batch_size):
        batch = rows[i : i + batch_size]
        supabase.table("document_chunks").insert(batch).execute()


def ingest_files(directory: str | Path, project_id: str, organization_id: str) -> List[Dict[str, Any]]:
    """
    Complete ingestion pipeline for a directory of files:
    1. Load multi-format files
    2. Split into chunks
    3. Generate 384D embeddings in micro-batches
    4. Store in Supabase pgvector database
    """
    # 1. Load files
    documents = process_all_files(directory)
    if not documents:
        print("No valid documents found for ingestion.")
        return []

    # 2. Split into chunks
    chunks = split_documents(documents)
    del documents
    gc.collect()

    # 3. Generate embeddings & insert in micro-batches
    all_chunk_rows = []
    micro_batch_size = 25

    for i in range(0, len(chunks), micro_batch_size):
        batch_chunks = chunks[i : i + micro_batch_size]
        batch_texts = [c.page_content for c in batch_chunks]

        embeddings = generate_embeddings(batch_texts, batch_size=16)

        batch_rows = []
        for idx, (chunk, embedding) in enumerate(zip(batch_chunks, embeddings)):
            row = {
                "project_id": project_id,
                "organization_id": organization_id,
                "document_id": chunk.metadata.get("document_id"),
                "chunk_index": i + idx,
                "content": chunk.page_content,
                "token_count": len(chunk.page_content.split()),
                "embedding": embedding.tolist(),
                "metadata": chunk.metadata,
            }
            batch_rows.append(row)

        if supabase and batch_rows:
            store_embeddings_batch(batch_rows)

        all_chunk_rows.extend(batch_rows)
        del batch_chunks, batch_texts, embeddings, batch_rows
        gc.collect()

    print(f"Ingestion completed! Stored {len(all_chunk_rows)} chunks.")
    return all_chunk_rows


def ingest_single_file(file_path: str | Path, project_id: str, organization_id: str, document_id: str = None) -> List[Dict[str, Any]]:
    """Ingest a single uploaded file directly into the project's vector store."""
    documents = load_file(file_path)
    if not documents:
        return []

    chunks = split_documents(documents)
    del documents
    gc.collect()

    all_chunk_rows = []
    micro_batch_size = 25

    for i in range(0, len(chunks), micro_batch_size):
        batch_chunks = chunks[i : i + micro_batch_size]
        batch_texts = [c.page_content for c in batch_chunks]

        embeddings = generate_embeddings(batch_texts, batch_size=16)

        batch_rows = []
        for idx, (chunk, embedding) in enumerate(zip(batch_chunks, embeddings)):
            meta = chunk.metadata.copy()
            if document_id:
                meta["document_id"] = document_id
            row = {
                "project_id": project_id,
                "organization_id": organization_id,
                "document_id": document_id,
                "chunk_index": i + idx,
                "content": chunk.page_content,
                "token_count": len(chunk.page_content.split()),
                "embedding": embedding.tolist(),
                "metadata": meta,
            }
            batch_rows.append(row)

        if supabase and batch_rows:
            store_embeddings_batch(batch_rows)

        all_chunk_rows.extend(batch_rows)
        del batch_chunks, batch_texts, embeddings, batch_rows
        gc.collect()

    return all_chunk_rows

