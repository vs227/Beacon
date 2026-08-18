from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str


class RAGQueryRequest(BaseModel):
    query: str = Field(..., description="User search query or question")
    top_k: int = Field(default=4, ge=1, le=10, description="Top K vector chunks to retrieve")
    min_score: float = Field(default=0.20, ge=0.0, le=1.0, description="Minimum similarity score threshold")

    # Chat history for follow-up question condensation (sliding window of 6)
    history: Optional[List[ChatMessage]] = Field(default=None, description="Chat history for multi-turn conversations")

    # Provider & BYOK settings
    llm_provider: Optional[str] = Field(default="groq", description="LLM Provider: 'groq', 'openai', 'gemini', 'anthropic', or 'custom'")
    model_name: Optional[str] = Field(default=None, description="Specific model name (e.g. llama-3.1-8b-instant, gpt-4o-mini)")
    custom_api_key: Optional[str] = Field(default=None, description="Bring Your Own Key (BYOK) - overrides system default key")
    custom_endpoint: Optional[str] = Field(default=None, description="Custom OpenAI-compatible API base URL (for Ollama/vLLM)")
    temperature: float = Field(default=0.2, ge=0.0, le=1.0, description="Generation temperature")


class SourceCitation(BaseModel):
    id: str
    file_name: str
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    similarity_score: float
    rank: int
    content_preview: str
    metadata: Dict[str, Any] = {}


class TokenUsage(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


class RAGQueryResponse(BaseModel):
    query: str
    answer: str
    sources: List[SourceCitation]
    confidence_score: float
    provider_used: str
    model_used: str
    token_usage: TokenUsage
    execution_time_ms: float
