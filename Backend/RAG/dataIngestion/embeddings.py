import os
import gc
from typing import List
import numpy as np
import httpx

# Force single-threaded execution for PyTorch/BLAS to minimize RAM overhead on 512MB servers
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

_model = None
_model_failed = False


def _fallback_embedding(text: str, dim: int = 384) -> np.ndarray:
    """Ultra-lightweight 384-dim hash-based feature vector fallback for 512MB RAM environments (~2MB footprint)."""
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


def _hf_api_embedding(texts: List[str]) -> np.ndarray | None:
    """Generate embeddings via Hugging Face Free Inference API if token is provided."""
    hf_token = os.environ.get("HUGGINGFACE_API_KEY") or os.environ.get("HF_TOKEN")
    if not hf_token:
        return None
    try:
        url = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"
        headers = {"Authorization": f"Bearer {hf_token}"}
        res = httpx.post(url, json={"inputs": texts}, headers=headers, timeout=10.0)
        if res.status_code == 200:
            data = res.json()
            vecs = np.array(data, dtype=np.float32)
            if len(vecs.shape) == 3:
                vecs = np.mean(vecs, axis=1)
            norms = np.linalg.norm(vecs, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            return vecs / norms
    except Exception as e:
        print(f"HuggingFace API embedding failed: {e}")
    return None


def get_embedding_model():
    """Lazy load sentence-transformer with memory check & fallback."""
    global _model, _model_failed

    # If LOW_RAM_MODE is explicitly enabled or PyTorch load failed earlier, use fallback
    if _model_failed or os.environ.get("LOW_RAM_MODE", "false").lower() == "true":
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
            print(f"Warning: SentenceTransformer disabled ({e}). Using lightweight vectors to preserve RAM.")
            _model_failed = True
            return None
    return _model


def generate_embeddings(texts: List[str], batch_size: int = 16) -> np.ndarray:
    """Generate 384-dimensional vector embeddings safely without exceeding 512MB RAM."""
    if not texts:
        return np.array([])

    # 1. Try HF Remote API if token configured (0 MB local RAM usage)
    remote_vecs = _hf_api_embedding(texts)
    if remote_vecs is not None:
        return remote_vecs

    # 2. Try Local SentenceTransformer model if memory permits
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
        except (MemoryError, Exception) as e:
            print(f"Embedding encoding memory exception ({e}). Falling back to ultra-lightweight vectors.")
            gc.collect()

    # 3. Fallback for 512MB ultra-low RAM environments
    fallback_vecs = [_fallback_embedding(t) for t in texts]
    return np.array(fallback_vecs, dtype=np.float32)

