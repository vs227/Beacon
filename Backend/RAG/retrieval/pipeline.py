import time
import logging
from typing import Dict, Any, List, Optional

from RAG.retrieval.retriever import RAGRetriever
from RAG.retrieval.llm_client import MultiProviderLLMClient, DEFAULT_MODELS

logger = logging.getLogger(__name__)

# Global singleton instances (cached, never re-instantiated)
retriever = RAGRetriever(top_k=4, min_score=0.20)
llm_client = MultiProviderLLMClient()

SYSTEM_PROMPT = """
You are Beacon, an enterprise AI assistant designed to answer user queries using the provided project documentation and context.

CORE INSTRUCTIONS:

1. ACCURACY & CONTEXT GROUNDING:
   - Answer queries using ONLY facts present in the CONTEXT. Do not invent external details.
   - If no relevant details exist, state: "I could not find relevant information in the documentation to answer your request."

2. STRUCTURED FORMATTING & VISUAL LINE BREAKS:
   - Present answers in clean, structured bullet points (•) or distinct short paragraphs.
   - Put EACH key point on a NEW LINE so the output is cleanly formatted and easy to read.
   - Do NOT run all information together in a single unbroken block of text.

3. STRICT LENGTH LIMIT & TOKEN CONSERVATION:
   - Limit your response to a MAXIMUM OF 12 LINES in total.
   - Be extremely concise, direct, and token-efficient.
   - Exclude conversational preambles, greetings, intros ("Based on the context..."), and closing fluff ("Please let me know if...").

CONTEXT:
{context}

USER QUESTION:
{question}
"""


def run_rag_pipeline(
    query: str,
    project_id: str,
    top_k: int = 4,
    min_score: float = 0.20,
    llm_provider: str = "groq",
    model_name: Optional[str] = None,
    custom_api_key: Optional[str] = None,
    custom_endpoint: Optional[str] = None,
    temperature: float = 0.2,
    chat_history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    """
    RAG Retrieval & Generation Pipeline:
    1. Greeting check for fresh chats.
    2. Context-aware follow-up rephrasing.
    3. High-precision document retrieval.
    4. Document-grounded LLM synthesis.
    """
    start_time = time.time()

    # ── 1. Fast greeting check (ONLY on fresh chat / no history) ──
    clean_q = query.strip().lower()
    GREETINGS = {"hi", "hii", "hello", "hey", "good morning", "good evening"}
    if (not chat_history or len(chat_history) == 0) and clean_q in GREETINGS:
        execution_time_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "query": query,
            "answer": "Hello! How can I assist you with your project documentation or queries today?",
            "sources": [],
            "confidence_score": 1.0,
            "provider_used": llm_provider,
            "model_used": model_name or DEFAULT_MODELS.get(llm_provider, "default"),
            "token_usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
            "execution_time_ms": execution_time_ms,
        }

    # ── 2. Smart Condensation using Chat History ──
    standalone_query = query
    if chat_history and len(chat_history) > 0:
        words = clean_q.split()
        referential_keywords = {
            "it", "this", "that", "its", "they", "them", "these", "those", "above", 
            "previous", "him", "his", "her", "he", "she", "so"
        }
        has_reference = any(w.strip("?,.!") in referential_keywords for w in words)
        is_ultra_short = len(words) <= 2

        if has_reference or is_ultra_short:
            history_text = "\n".join(
                f"{msg['role'].capitalize()}: {msg['content']}" for msg in chat_history[-6:]
            )
            condense_prompt = (
                f"Given this conversation history between User and Assistant:\n{history_text}\n\n"
                f"Follow-up question: {query}\n\n"
                "Rephrase this follow-up question into a complete, self-contained standalone search query that retains all context (e.g., replacing pronouns like 'it', 'this', 'that', 'him', 'them', 'so', 'why' with the explicit subject or topic from history). Respond ONLY with the rephrased standalone query."
            )
            try:
                condense_res = llm_client.generate(
                    prompt=condense_prompt,
                    system_prompt="You rephrase follow-up questions into complete standalone search queries based on chat history. Output ONLY the standalone query.",
                    provider=llm_provider,
                    model_name=model_name,
                    custom_api_key=custom_api_key,
                    custom_endpoint=custom_endpoint,
                    temperature=0.0,
                )
                standalone_query = condense_res["answer"].strip() or query
                logger.info(f"Rephrased query '{query}' -> '{standalone_query}'")
            except Exception as e:
                logger.warning(f"Condensation failed: {e}")
                standalone_query = query

    # ── 2. Retrieve relevant document chunks ──
    chunks = retriever.retrieve(
        query=standalone_query,
        project_id=project_id,
        top_k=top_k,
        score_threshold=min_score,
    )

    if not chunks:
        execution_time_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "query": query,
            "answer": "No relevant details were found in the uploaded documentation for your query.",
            "sources": [],
            "confidence_score": 0.0,
            "provider_used": llm_provider,
            "model_used": model_name or DEFAULT_MODELS.get(llm_provider, "default"),
            "token_usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
            "execution_time_ms": execution_time_ms,
        }

    # ── 3. Confidence score ──
    confidence_score = max(c["similarity_score"] for c in chunks)

    # ── 4. Format compact context (raw content, no headers — saves tokens) ──
    context_str = retriever.format_context_for_prompt(chunks)

    # ── 5. Construct user prompt with last 3 turns of chat history + retrieved context ──
    history_str = ""
    if chat_history and len(chat_history) > 0:
        recent_turns = chat_history[-6:]
        history_str = "RECENT CHAT HISTORY:\n" + "\n".join(
            f"{m['role'].capitalize()}: {m['content']}" for m in recent_turns
        ) + "\n\n"

    user_prompt = f"{history_str}CONTEXT:\n{context_str}\n\nQuestion: {query}"

    # ── 6. Invoke LLM ──
    try:
        llm_res = llm_client.generate(
            prompt=user_prompt,
            system_prompt=SYSTEM_PROMPT,
            provider=llm_provider,
            model_name=model_name,
            custom_api_key=custom_api_key,
            custom_endpoint=custom_endpoint,
            temperature=temperature,
        )
        answer = llm_res["answer"]
        # Enforce strict 12-line maximum output limit and remove conversational fluff
        if answer:
            raw_lines = [l.strip() for l in answer.splitlines() if l.strip()]
            filtered = [
                l for l in raw_lines 
                if not l.lower().startswith("based on the provided context")
                and not l.lower().startswith("please let me know")
                and not l.lower().startswith("let me know if")
            ]
            final_lines = filtered if filtered else raw_lines
            answer = "\n".join(final_lines[:12])

        provider_used = llm_res["provider"]
        model_used = llm_res["model"]
        token_usage = llm_res["token_usage"]
    except Exception as llm_err:
        logger.error(f"LLM generation failed: {llm_err}")
        answer = f"Retrieved {len(chunks)} relevant chunks, but LLM generation failed: {str(llm_err)}"
        provider_used = llm_provider
        model_used = model_name or "error"
        token_usage = {"prompt_tokens": len(user_prompt.split()), "completion_tokens": 0, "total_tokens": len(user_prompt.split())}

    # ── 7. Format source citations ──
    sources = []
    for c in chunks:
        meta = c.get("metadata") or {}
        file_name = meta.get("file_name") or meta.get("source_file") or "Document"
        sources.append({
            "id": c["id"],
            "file_name": file_name,
            "file_path": meta.get("file_path") or meta.get("source_repo"),
            "file_type": meta.get("file_type"),
            "similarity_score": c["similarity_score"],
            "rank": c["rank"],
            "content_preview": c["content"][:150] + "..." if len(c["content"]) > 150 else c["content"],
            "metadata": meta,
        })

    execution_time_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "query": query,
        "answer": answer,
        "sources": sources,
        "confidence_score": confidence_score,
        "provider_used": provider_used,
        "model_used": model_used,
        "token_usage": token_usage,
        "execution_time_ms": execution_time_ms,
    }
