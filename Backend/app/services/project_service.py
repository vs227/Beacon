import re
import uuid
import unicodedata
from fastapi import HTTPException, status
from postgrest.exceptions import APIError as PostgrestAPIError
from app.core.database import supabase
from app.schemas.project import ProjectCreate, ProjectUpdate


def _generate_slug(name: str) -> str:
    """Generate a clean URL-friendly slug from a project name."""
    slug = name.strip().lower()
    slug = unicodedata.normalize('NFKD', slug).encode('ascii', 'ignore').decode('utf-8')
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug or "project"


def _generate_unique_slug(name: str, organization_id: str, exclude_id: str | None = None) -> str:
    """Generate a slug unique within an organization."""
    base_slug = _generate_slug(name)
    candidate = base_slug
    counter = 1

    while True:
        try:
            query = (
                supabase.table("projects")
                .select("id")
                .eq("organization_id", organization_id)
                .eq("slug", candidate)
            )
            if exclude_id:
                query = query.neq("id", exclude_id)
            result = query.execute()
            if not result.data:
                return candidate
            candidate = f"{base_slug}-{counter}"
            counter += 1
        except PostgrestAPIError:
            return f"{base_slug}-{counter}"


def _verify_org_ownership(organization_id: str, owner_id: str) -> str:
    """Verify caller owns the organization by UUID or slug. Returns the organization's UUID id."""
    try:
        is_uuid = False
        try:
            uuid.UUID(organization_id)
            is_uuid = True
        except ValueError:
            is_uuid = False

        query = supabase.table("organizations").select("id, owner_id")
        if is_uuid:
            query = query.eq("id", organization_id)
        else:
            query = query.eq("slug", organization_id)

        result = query.eq("owner_id", owner_id).execute()
    except PostgrestAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}"
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organization not found or not authorized"
        )

    return result.data[0]["id"]


def create_project(organization_id: str, project_data: ProjectCreate, owner_id: str) -> dict:
    real_org_id = _verify_org_ownership(organization_id, owner_id)

    slug = _generate_unique_slug(project_data.name, real_org_id)
    payload = {
        "organization_id": real_org_id,
        "name": project_data.name,
        "slug": slug,
        "project_type": project_data.project_type or "Customer Support",
        "environment": project_data.environment or "Development",
    }
    if project_data.description:
        payload["description"] = project_data.description

    try:
        result = supabase.table("projects").insert(payload).execute()
    except PostgrestAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}"
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create project"
        )

    return result.data[0]


def get_projects(organization_id: str, owner_id: str) -> list[dict]:
    real_org_id = _verify_org_ownership(organization_id, owner_id)

    try:
        result = (
            supabase.table("projects")
            .select("*")
            .eq("organization_id", real_org_id)
            .order("created_at", desc=False)
            .execute()
        )
    except PostgrestAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}"
        )

    return result.data or []


def get_project_by_id(project_id: str, owner_id: str) -> dict:
    try:
        is_uuid = False
        try:
            uuid.UUID(project_id)
            is_uuid = True
        except ValueError:
            is_uuid = False

        query = supabase.table("projects").select("*")
        if is_uuid:
            query = query.eq("id", project_id)
        else:
            query = query.eq("slug", project_id)

        result = query.execute()
    except PostgrestAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}"
        )

    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    project = result.data[0]
    _verify_org_ownership(project["organization_id"], owner_id)
    return project


def update_project(project_id: str, project_data: ProjectUpdate, owner_id: str) -> dict:
    project = get_project_by_id(project_id, owner_id)
    real_project_id = project["id"]

    update_payload = {}
    if project_data.name is not None and project_data.name != project.get("name"):
        update_payload["name"] = project_data.name
        update_payload["slug"] = _generate_unique_slug(
            project_data.name, project["organization_id"], exclude_id=real_project_id
        )
    if project_data.description is not None and project_data.description != project.get("description"):
        update_payload["description"] = project_data.description
    if project_data.project_type is not None and project_data.project_type != project.get("project_type"):
        update_payload["project_type"] = project_data.project_type
    if project_data.environment is not None and project_data.environment != project.get("environment"):
        update_payload["environment"] = project_data.environment

    if not update_payload:
        return project

    try:
        result = supabase.table("projects").update(update_payload).eq("id", real_project_id).execute()
    except PostgrestAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}"
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update project"
        )

    return result.data[0]


def delete_project(project_id: str, owner_id: str) -> dict:
    project = get_project_by_id(project_id, owner_id)
    real_project_id = project["id"]

    try:
        supabase.table("projects").delete().eq("id", real_project_id).execute()
    except PostgrestAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}"
        )

    return {"message": "Project deleted successfully", "id": real_project_id}
