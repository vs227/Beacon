import os
import gc
from typing import List
import numpy as np

# Force single-threaded execution for PyTorch/BLAS to minimize RAM overhead on 512MB servers
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

_model = None
_model_failed = False


def _fallback_embedding(text: str, dim: int = 384) -> np.ndarray:
    """Lightweight 384-dim hash-based feature vector fallback for low-RAM environments."""
    vec = np.zeros(dim, dtype=np.float32)
    words = text.lower().split()
    if not words:
        return vec
    for word in words:
        h = hash(word)
        idx = abs(h) % dim
        val = 1.0 if h > 0 else -1.0
        vec[idx] += val
    norm = np.linalg.norm(vec)
    return vec / norm if norm > 0 else vec


def get_embedding_model():
    """Lazy load the sentence-transformer model in RAM with PyTorch memory optimizations."""
    global _model, _model_failed
    if _model_failed:
        return None

    if _model is None:
        try:
            import torch
            torch.set_num_threads(1)
            try:
                torch.set_num_interop_threads(1)
            except Exception:
                pass

            with torch.no_grad():
                from sentence_transformers import SentenceTransformer
                _model = SentenceTransformer("all-MiniLM-L6-v2")
                _model.encode(["warmup"], show_progress_bar=False, normalize_embeddings=True)
        except Exception as e:
            print(f"Warning: Could not load SentenceTransformer in memory ({e}). Using lightweight vector fallback.")
            _model_failed = True
            return None
    return _model


def generate_embeddings(texts: List[str], batch_size: int = 16) -> np.ndarray:
    """Generate 384-dimensional vector embeddings with OOM safety and fallback."""
    if not texts:
        return np.array([])

    model = get_embedding_model()
    if model is not None:
        try:
            import torch
            with torch.no_grad():
                embeddings = model.encode(
                    texts,
                    batch_size=batch_size,
                    show_progress_bar=False,
                    normalize_embeddings=True
                )
                gc.collect()
                return embeddings
        except Exception as e:
            print(f"Embedding encoding failed ({e}). Falling back to lightweight vectors.")

    # Fallback for ultra low RAM environments
    fallback_vecs = [_fallback_embedding(t) for t in texts]
    return np.array(fallback_vecs, dtype=np.float32)
