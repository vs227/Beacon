from fastapi import APIRouter, Depends, status
from app.core.auth import get_current_user
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse
)
from app.services import organization_service

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.post(
    "",
    response_model=OrganizationResponse,
    status_code=status.HTTP_201_CREATED
)
def create_organization(
    org_data: OrganizationCreate,
    current_user: dict = Depends(get_current_user)
):
    return organization_service.create_organization(
        org_data=org_data,
        owner_id=current_user["user_id"]
    )


@router.get(
    "",
    response_model=list[OrganizationResponse]
)
def get_user_organizations(
    current_user: dict = Depends(get_current_user)
):
    return organization_service.get_user_organizations(
        owner_id=current_user["user_id"]
    )


@router.get(
    "/{organization_id}",
    response_model=OrganizationResponse
)
def get_organization_by_id(
    organization_id: str,
    current_user: dict = Depends(get_current_user)
):
    return organization_service.get_organization_by_id(
        organization_id=organization_id,
        owner_id=current_user["user_id"]
    )


@router.put(
    "/{organization_id}",
    response_model=OrganizationResponse
)
def update_organization(
    organization_id: str,
    org_data: OrganizationUpdate,
    current_user: dict = Depends(get_current_user)
):
    return organization_service.update_organization(
        organization_id=organization_id,
        org_data=org_data,
        owner_id=current_user["user_id"]
    )


@router.delete(
    "/{organization_id}"
)
def delete_organization(
    organization_id: str,
    current_user: dict = Depends(get_current_user)
):
    return organization_service.delete_organization(
        organization_id=organization_id,
        owner_id=current_user["user_id"]
    )
