import logging
from typing import Dict, Any, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# Default model per provider — use smaller/faster models for lower token cost
DEFAULT_MODELS = {
    "groq": "openai/gpt-oss-120b",
    "openai": "gpt-4o-mini",
    "gemini": "gemini-2.0-flash",
    "anthropic": "claude-3-5-sonnet-20241022",
    "custom": "default",
}


class MultiProviderLLMClient:
    """
    Multi-provider LLM Client supporting Groq, OpenAI, Google Gemini, Anthropic,
    and Custom OpenAI-compatible endpoints. Supports system default keys + BYOK.
    """

    def resolve_api_key(self, provider: str, custom_key: Optional[str] = None) -> str:
        """Resolve API Key: BYOK takes precedence, then system .env key."""
        if custom_key and custom_key.strip():
            return custom_key.strip()

        provider = provider.lower()
        if provider == "claude":
            provider = "anthropic"

        key_map = {
            "groq": settings.GROQ_API_KEY,
            "openai": settings.OPENAI_API_KEY,
            "gemini": settings.GEMINI_API_KEY,
            "anthropic": settings.ANTHROPIC_API_KEY,
        }
        return key_map.get(provider, "") or settings.GROQ_API_KEY or settings.OPENAI_API_KEY

    def generate(
        self,
        prompt: str,
        system_prompt: str,
        provider: str = "groq",
        model_name: Optional[str] = None,
        custom_api_key: Optional[str] = None,
        custom_endpoint: Optional[str] = None,
        temperature: float = 0.2,
    ) -> Dict[str, Any]:
        """Generate chat completion using the requested provider and model."""
        provider = provider.lower()
        if provider == "claude":
            provider = "anthropic"
        elif provider == "local":
            provider = "custom"
        elif provider == "qwen":
            provider = "groq"
            if not model_name:
                model_name = "qwen/qwen3.8-27b"

        api_key = self.resolve_api_key(provider, custom_api_key)

        # Normalize legacy/decommissioned Groq model names
        if provider == "groq" and model_name and any(x in model_name.lower() for x in ["llama", "8192"]):
            model_name = "openai/gpt-oss-120b"

        model = model_name or DEFAULT_MODELS.get(provider, "openai/gpt-oss-120b")

        if provider in ("groq", "openai", "custom"):
            base_urls = {
                "groq": "https://api.groq.com/openai/v1/chat/completions",
                "openai": "https://api.openai.com/v1/chat/completions",
            }
            if provider == "custom":
                base_url = custom_endpoint or "http://localhost:11434/v1/chat/completions"
                if not base_url.endswith("/chat/completions"):
                    base_url = base_url.rstrip("/") + "/chat/completions"
            else:
                base_url = base_urls[provider]

            return self._call_openai_compatible(
                base_url=base_url,
                api_key=api_key or "custom",
                model=model,
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=temperature,
                provider_name=provider,
            )
        elif provider == "gemini":
            return self._call_gemini(api_key, model, prompt, system_prompt, temperature)
        elif provider == "anthropic":
            return self._call_anthropic(api_key, model, prompt, system_prompt, temperature)
        else:
            # Fallback to Groq
            return self._call_openai_compatible(
                base_url="https://api.groq.com/openai/v1/chat/completions",
                api_key=api_key,
                model="openai/gpt-oss-120b",
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=temperature,
                provider_name="groq",
            )

    def _call_openai_compatible(
        self, base_url, api_key, model, prompt, system_prompt, temperature, provider_name
    ) -> Dict[str, Any]:
        if not api_key:
            raise ValueError(
                f"No API Key for {provider_name}. Set {provider_name.upper()}_API_KEY in .env or pass custom_api_key (BYOK)."
            )

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        }
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
            "max_tokens": 4096,

        with httpx.Client(timeout=30.0) as client:
            resp = client.post(base_url, headers=headers, json=payload)
            
            # Auto-retry once on 429 Rate Limit (e.g. Groq 6000 TPM limit)
            if resp.status_code == 429:
                import time
                time.sleep(4.0)  # Wait 4 seconds for TPM window to clear
                resp = client.post(base_url, headers=headers, json=payload)

            # Auto-fallback if model is decommissioned or not found
            if resp.status_code in (400, 404) and provider_name == "groq" and model != "openai/gpt-oss-120b":
                err_text = resp.text.lower()
                if "decommissioned" in err_text or "not exist" in err_text or "not_found" in err_text:
                    logger.warning(f"Groq model {model} unavailable, falling back to openai/gpt-oss-120b")
                    payload["model"] = "openai/gpt-oss-120b"
                    model = "openai/gpt-oss-120b"
                    resp = client.post(base_url, headers=headers, json=payload)

            if resp.status_code == 429:
                raise ValueError("Groq rate limit reached (6,000 Tokens/Min limit on free tier). Please wait 5 seconds before asking your next question, or select Gemini in settings.")

            if resp.status_code != 200:
                raise ValueError(f"{provider_name} API Error ({resp.status_code}): {resp.text[:300]}")

            data = resp.json()
            answer = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            usage = data.get("usage", {})

            return {
                "answer": answer.strip(),
                "provider": provider_name,
                "model": model,
                "token_usage": {
                    "prompt_tokens": usage.get("prompt_tokens", len(prompt.split())),
                    "completion_tokens": usage.get("completion_tokens", len(answer.split())),
                    "total_tokens": usage.get("total_tokens", len(prompt.split()) + len(answer.split())),
                },
            }

    def _call_gemini(self, api_key, model, prompt, system_prompt, temperature) -> Dict[str, Any]:
        if not api_key:
            raise ValueError("No Gemini API Key. Set GEMINI_API_KEY in .env or pass custom_api_key (BYOK).")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={api_key}"

        payload = {
            "contents": [{"parts": [{"text": f"System Instructions: {system_prompt}\n\nUser Question: {prompt}"}]}],
            "generationConfig": {"temperature": temperature, "maxOutputTokens": 4096},
        }

            resp = client.post(url, json=payload)
            if resp.status_code != 200:
                raise ValueError(f"Gemini API Error ({resp.status_code}): {resp.text[:300]}")

            data = resp.json()
            try:
                answer = data["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError):
                answer = "No response generated by Gemini."

            return {
                "answer": answer.strip(),
                "provider": "gemini",
                "model": gemini_model,
                "token_usage": {
                    "prompt_tokens": len(prompt.split()),
                    "completion_tokens": len(answer.split()),
                    "total_tokens": len(prompt.split()) + len(answer.split()),
                },
            }

    def _call_anthropic(self, api_key, model, prompt, system_prompt, temperature) -> Dict[str, Any]:
        if not api_key:
            raise ValueError("No Anthropic API Key. Set ANTHROPIC_API_KEY in .env or pass custom_api_key (BYOK).")

        headers = {
            "x-api-key": api_key,
            "content-type": "application/json",
        }
        payload = {
            "model": model if "claude" in model else "claude-3-5-sonnet-20241022",
            "system": system_prompt,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 4096,
            "temperature": temperature,
        }

        with httpx.Client(timeout=30.0) as client:
            if resp.status_code != 200:
                raise ValueError(f"Anthropic API Error ({resp.status_code}): {resp.text[:300]}")

            data = resp.json()
            answer = data.get("content", [{}])[0].get("text", "")
            usage = data.get("usage", {})

            return {
                "answer": answer.strip(),
                "provider": "anthropic",
                "model": model,
                "token_usage": {
                    "prompt_tokens": usage.get("input_tokens", len(prompt.split())),
                    "completion_tokens": usage.get("output_tokens", len(answer.split())),
                    "total_tokens": usage.get("input_tokens", 0) + usage.get("output_tokens", 0) or len(prompt.split()) + len(answer.split()),
                },
            }
