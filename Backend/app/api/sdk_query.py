import json
import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.core.api_key_auth import get_api_key_project
from app.schemas.rag import RAGQueryRequest, RAGQueryResponse
from RAG.retrieval.pipeline import run_rag_pipeline

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["Beacon Public SDK API"])


@router.post(
    "/query",
    response_model=RAGQueryResponse,
    status_code=status.HTTP_200_OK,
)
def public_sdk_query_endpoint(
    body: RAGQueryRequest,
    project_ctx: Dict[str, str] = Depends(get_api_key_project),
):
    """
    Public RAG Query API for SDKs & Third-Party Applications:
    - Authenticated via X-Beacon-Key: bc_live_... or Authorization: Bearer bc_live_...
    - Vector Semantic Search against project document vector embeddings.
    - Grounded LLM response generation with document citations.
    """
    if not body.query.strip():
        raise HTTPException(status_code=400, detail="Query string cannot be empty.")

    chat_history = None
    if body.history:
        chat_history = [{"role": msg.role, "content": msg.content} for msg in body.history[-6:]]

    try:
        res = run_rag_pipeline(
            query=body.query,
            project_id=project_ctx["project_id"],
            top_k=body.top_k,
            min_score=body.min_score,
            llm_provider=body.llm_provider,
            model_name=body.model_name,
            custom_api_key=body.custom_api_key,
            custom_endpoint=body.custom_endpoint,
            temperature=body.temperature,
            chat_history=chat_history,
        )
        return res
    except Exception as e:
        logger.error(f"SDK RAG query execution failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"SDK RAG query error: {str(e)}",
        )


@router.post("/query/stream")
def public_sdk_stream_endpoint(
    body: RAGQueryRequest,
    project_ctx: Dict[str, str] = Depends(get_api_key_project),
):
    """Public Server-Sent Events (SSE) RAG Stream Endpoint for SDKs."""
    if not body.query.strip():
        raise HTTPException(status_code=400, detail="Query string cannot be empty.")

    chat_history = None
    if body.history:
        chat_history = [{"role": msg.role, "content": msg.content} for msg in body.history[-6:]]

    def event_stream():
        try:
            res = run_rag_pipeline(
                query=body.query,
                project_id=project_ctx["project_id"],
                top_k=body.top_k,
                min_score=body.min_score,
                llm_provider=body.llm_provider,
                model_name=body.model_name,
                custom_api_key=body.custom_api_key,
                custom_endpoint=body.custom_endpoint,
                temperature=body.temperature,
                chat_history=chat_history,
            )

            meta_chunk = {
                "type": "metadata",
                "sources": res["sources"],
                "confidence_score": res["confidence_score"],
                "provider_used": res["provider_used"],
                "model_used": res["model_used"],
                "execution_time_ms": res["execution_time_ms"],
            }
            yield f"data: {json.dumps(meta_chunk)}\n\n"

            words = res["answer"].split(" ")
            for i in range(0, len(words), 3):
                text_piece = " ".join(words[i : i + 3]) + " "
                yield f"data: {json.dumps({'type': 'content', 'delta': text_piece})}\n\n"

            yield f"data: {json.dumps({'type': 'done', 'token_usage': res['token_usage']})}\n\n"

        except Exception as err:
            yield f"data: {json.dumps({'type': 'error', 'error': str(err)})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
