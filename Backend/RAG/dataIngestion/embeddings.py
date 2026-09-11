from typing import List
import numpy as np
from sentence_transformers import SentenceTransformer

_model = None


def get_embedding_model() -> SentenceTransformer:
    """Load and pre-warm the sentence-transformer model in RAM."""
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        # Pre-warm model tensors so 1st query runs instantly without cold start latency
        _model.encode(["warmup"], show_progress_bar=False, normalize_embeddings=True)
    return _model


def generate_embeddings(texts: List[str], batch_size: int = 32) -> np.ndarray:
    """Generate 384-dimensional vector embeddings for a list of text strings."""
    if not texts:
        return np.array([])

    model = get_embedding_model()
    embeddings = model.encode(
        texts,
        batch_size=batch_size,
        show_progress_bar=False,
        normalize_embeddings=True
    )
    return embeddings
