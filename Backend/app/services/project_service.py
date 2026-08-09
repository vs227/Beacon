import re
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


def _verify_org_ownership(organization_id: str, owner_id: str) -> None:
    """Verify that the caller owns the organization."""
    try:
        result = (
            supabase.table("organizations")
            .select("id")
            .eq("id", organization_id)
            .eq("owner_id", owner_id)
            .execute()
        )
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


def create_project(organization_id: str, project_data: ProjectCreate, owner_id: str) -> dict:
    _verify_org_ownership(organization_id, owner_id)

    slug = _generate_unique_slug(project_data.name, organization_id)
    payload = {
        "organization_id": organization_id,
        "name": project_data.name,
        "slug": slug,
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
    _verify_org_ownership(organization_id, owner_id)

    try:
        result = (
            supabase.table("projects")
            .select("*")
            .eq("organization_id", organization_id)
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
        result = supabase.table("projects").select("*").eq("id", project_id).execute()
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

    update_payload = {}
    if project_data.name is not None and project_data.name != project.get("name"):
        update_payload["name"] = project_data.name
        update_payload["slug"] = _generate_unique_slug(
            project_data.name, project["organization_id"], exclude_id=project_id
        )
    if project_data.description is not None and project_data.description != project.get("description"):
        update_payload["description"] = project_data.description

    if not update_payload:
        return project

    try:
        result = supabase.table("projects").update(update_payload).eq("id", project_id).execute()
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
    get_project_by_id(project_id, owner_id)

    try:
        supabase.table("projects").delete().eq("id", project_id).execute()
    except PostgrestAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}"
        )

    return {"message": "Project deleted successfully", "id": project_id}
