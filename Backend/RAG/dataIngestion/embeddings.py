import os
import gc
from typing import List
import numpy as np
import httpx

# Force single-threaded execution for PyTorch/BLAS to minimize RAM overhead
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

_model = None
_model_failed = False


def _fallback_embedding(text: str, dim: int = 384) -> np.ndarray:
    """Ultra-lightweight 384-dim hash-based feature vector for 512MB RAM cloud environments (~2MB footprint, <1ms execution)."""
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
    """Generate 384D embeddings via Hugging Face Free Inference API if token is provided."""
    hf_token = (
        os.environ.get("HUGGINGFACE_API_KEY")
        or os.environ.get("HF_TOKEN")
        or os.environ.get("HUGGING_FACE_HUB_TOKEN")
        or os.environ.get("HUGGINGFACE_TOKEN")
    )
    if not hf_token:
        return None

    clean_token = hf_token.strip()
    headers = {"Authorization": f"Bearer {clean_token}"}

    # Strategy A: New Hugging Face Embeddings Router Endpoint
    try:
        url = "https://router.huggingface.co/hf-inference/v1/embeddings"
        payload = {"model": "sentence-transformers/all-MiniLM-L6-v2", "input": texts}
        res = httpx.post(url, json=payload, headers=headers, timeout=6.0)
        if res.status_code == 200:
            data = res.json()
            if "data" in data and isinstance(data["data"], list):
                vecs = [item["embedding"] for item in data["data"]]
                arr = np.array(vecs, dtype=np.float32)
                norms = np.linalg.norm(arr, axis=1, keepdims=True)
                norms[norms == 0] = 1.0
                return arr / norms
    except Exception as e:
        print(f"HF Router embedding failed: {e}")

    # Strategy B: Standard Feature Extraction Endpoint
    try:
        url = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
        res = httpx.post(url, json={"inputs": texts}, headers=headers, timeout=6.0)
        if res.status_code == 200:
            data = res.json()
            if isinstance(data, list):
                vecs = np.array(data, dtype=np.float32)
                if len(vecs.shape) == 3:
                    vecs = np.mean(vecs, axis=1)
                norms = np.linalg.norm(vecs, axis=1, keepdims=True)
                norms[norms == 0] = 1.0
                return vecs / norms
    except Exception as e:
        print(f"HF direct embedding failed: {e}")

    return None


def get_embedding_model():
    """Lazy load local sentence-transformer only in local development, never in cloud/Render."""
    global _model, _model_failed

    # Auto-detect if running on Render / cloud environment / low-RAM server
    is_cloud_env = bool(os.environ.get("RENDER") or os.environ.get("PORT") or os.environ.get("LOW_RAM_MODE"))
    low_ram_setting = os.environ.get("LOW_RAM_MODE", "true" if is_cloud_env else "false").lower() == "true"

    if _model_failed or low_ram_setting or is_cloud_env:
        # Bypasses local PyTorch download completely on cloud to keep RAM < 50MB and prevent OOM
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

    # 1. Try Hugging Face Remote API if token configured (0 MB local RAM usage)
    remote_vecs = _hf_api_embedding(texts)
    if remote_vecs is not None:
        return remote_vecs

    # 2. Try Local SentenceTransformer model if running locally (not on cloud)
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

    # 3. Fast fallback for 512MB cloud environments (< 1ms execution, 0MB PyTorch RAM)
    fallback_vecs = [_fallback_embedding(t) for t in texts]
    return np.array(fallback_vecs, dtype=np.float32)


