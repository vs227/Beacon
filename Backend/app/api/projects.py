from fastapi import APIRouter, Depends, status
from app.core.auth import get_current_user
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services import project_service

router = APIRouter(prefix="/organizations/{organization_id}/projects", tags=["Projects"])


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED
)
def create_project(
    organization_id: str,
    project_data: ProjectCreate,
    current_user: dict = Depends(get_current_user)
):
    return project_service.create_project(
        organization_id=organization_id,
        project_data=project_data,
        owner_id=current_user["user_id"]
    )


@router.get(
    "",
    response_model=list[ProjectResponse]
)
def get_projects(
    organization_id: str,
    current_user: dict = Depends(get_current_user)
):
    return project_service.get_projects(
        organization_id=organization_id,
        owner_id=current_user["user_id"]
    )


@router.get(
    "/{project_id}",
    response_model=ProjectResponse
)
def get_project(
    organization_id: str,
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    return project_service.get_project_by_id(
        project_id=project_id,
        owner_id=current_user["user_id"]
    )


@router.put(
    "/{project_id}",
    response_model=ProjectResponse
)
def update_project(
    organization_id: str,
    project_id: str,
    project_data: ProjectUpdate,
    current_user: dict = Depends(get_current_user)
):
    return project_service.update_project(
        project_id=project_id,
        project_data=project_data,
        owner_id=current_user["user_id"]
    )


@router.delete("/{project_id}")
def delete_project(
    organization_id: str,
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    return project_service.delete_project(
        project_id=project_id,
        owner_id=current_user["user_id"]
    )
