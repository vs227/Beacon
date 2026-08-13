from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.schemas.document import SearchRequest, SearchResult
from app.services.ingestion_service import semantic_search

router = APIRouter(
    prefix="/organizations/{organization_id}/projects/{project_id}/search",
    tags=["Search"],
)


@router.post(
    "",
    response_model=list[SearchResult],
)
def search_documents(
    organization_id: str,
    project_id: str,
    body: SearchRequest,
    current_user: dict = Depends(get_current_user),
):
    """Semantic search across indexed document chunks for a project."""
    return semantic_search(
        project_id=project_id,
        query=body.query,
        top_k=body.top_k,
    )
