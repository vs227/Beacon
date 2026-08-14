import logging
from typing import List, Dict, Any
import numpy as np

from app.core.database import supabase
from RAG.dataIngestion.embeddings import generate_embeddings

logger = logging.getLogger(__name__)


class RAGRetriever:
    """
    Semantic vector retriever optimized for low-token RAG.
    Uses top_k=4 retrieval (matching reference pipeline) with score thresholding.
    """

    def __init__(self, top_k: int = 4, min_score: float = 0.20):
        self.default_top_k = top_k
        self.default_min_score = min_score

    def retrieve(
        self,
        query: str,
        project_id: str,
        top_k: int = None,
        score_threshold: float = None,
    ) -> List[Dict[str, Any]]:
        """Retrieve relevant vector chunks for a query inside a specific project."""
        k = top_k if top_k is not None else self.default_top_k
        min_score = score_threshold if score_threshold is not None else self.default_min_score

        if not query.strip() or not project_id:
            return []

        # 1. Generate normalized 384D query embedding
        try:
            embeddings = generate_embeddings([query], batch_size=1)
            if len(embeddings) == 0:
                return []
            query_embedding = embeddings[0].tolist()
        except Exception as err:
            logger.error(f"Failed to generate query embedding: {err}")
            return []

        retrieved_chunks = []

        # 2. Try Supabase match_document_chunks RPC
        if supabase:
            try:
                rpc_res = supabase.rpc(
                    "match_document_chunks",
                    {
                        "query_embedding": query_embedding,
                        "match_project_id": project_id,
                        "match_count": k,
                    },
                ).execute()

                if rpc_res.data:
                    for idx, item in enumerate(rpc_res.data):
                        score = item.get("similarity", item.get("similarity_score", 0.0))
                        meta = item.get("metadata") or {}

                        retrieved_chunks.append({
                            "id": str(item.get("id", f"chunk_{idx}")),
                            "content": item.get("content", ""),
                            "similarity_score": round(float(score), 4),
                            "metadata": meta,
                            "rank": idx + 1,
                        })
            except Exception as rpc_err:
                logger.warning(f"RPC match_document_chunks failed, falling back: {rpc_err}")

        # 3. Fallback: direct cosine similarity on fetched chunks
        if not retrieved_chunks and supabase:
            try:
                table_res = supabase.table("document_chunks") \
                    .select("*") \
                    .eq("project_id", project_id) \
                    .limit(50) \
                    .execute()

                if table_res.data:
                    q_vec = np.array(query_embedding, dtype=np.float32)
                    scored = []
                    for row in table_res.data:
                        c_vec = np.array(row.get("embedding", []), dtype=np.float32)
                        if c_vec.size == q_vec.size and np.linalg.norm(c_vec) > 0:
                            sim = float(np.dot(q_vec, c_vec) / (np.linalg.norm(q_vec) * np.linalg.norm(c_vec)))
                            scored.append((sim, row))

                    scored.sort(key=lambda x: x[0], reverse=True)
                    for rank, (score, row) in enumerate(scored[:k], start=1):
                        retrieved_chunks.append({
                            "id": str(row.get("id", "")),
                            "content": row.get("content", ""),
                            "similarity_score": round(score, 4),
                            "metadata": row.get("metadata", {}),
                            "rank": rank,
                        })
            except Exception as fallback_err:
                logger.error(f"Fallback direct chunk search failed: {fallback_err}")

        # 4. Filter by score threshold & slice to top_k
        filtered = [c for c in retrieved_chunks if c["similarity_score"] >= min_score]
        return filtered[:k] if filtered else retrieved_chunks[:k]

    def format_context_for_prompt(self, chunks: List[Dict[str, Any]]) -> str:
        """
        Format retrieved chunks into a compact context string.
        Mirrors the reference pipeline: join page_content blocks with double newlines.
        """
        if not chunks:
            return ""

        blocks = []
        for chunk in chunks:
            blocks.append(chunk["content"].strip())

        return "\n\n".join(blocks)
