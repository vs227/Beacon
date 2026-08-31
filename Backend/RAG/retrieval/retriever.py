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

        # 4. Filter by score threshold
        filtered = [c for c in retrieved_chunks if c["similarity_score"] >= min_score]
        candidate_chunks = filtered[:k] if filtered else retrieved_chunks[:k]

        if not candidate_chunks:
            return []

        # 5. Hyper-Efficient Adaptive Pruning for Groq: If top chunk is relevant (>= 0.50),
        # keep top 2 chunks max to cut token consumption by 50% (allowing 14+ queries/min on Groq free tier)
        top_score = candidate_chunks[0]["similarity_score"]
        if top_score >= 0.50 and len(candidate_chunks) > 2:
            return candidate_chunks[:2]

        return candidate_chunks[:3]

    def format_context_for_prompt(self, chunks: List[Dict[str, Any]]) -> str:
        """
        Format retrieved chunks into a compact, deduplicated context string.
        Deduplicates exact line matches from chunk overlaps to conserve prompt tokens.
        """
        if not chunks:
            return ""

        seen_lines = set()
        unique_blocks = []

        for chunk in chunks:
            raw_text = chunk.get("content", "").strip()
            if not raw_text:
                continue

            lines = raw_text.splitlines()
            block_lines = []
            for line in lines:
                clean_line = line.strip()
                # Skip duplicate lines from chunk overlap windows
                if clean_line and clean_line in seen_lines:
                    continue
                if clean_line:
                    seen_lines.add(clean_line)
                    block_lines.append(line)

            if block_lines:
                unique_blocks.append("\n".join(block_lines))

        return "\n\n".join(unique_blocks)
