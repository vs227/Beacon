import re
import unicodedata
from fastapi import HTTPException, status
from postgrest.exceptions import APIError as PostgrestAPIError
from app.core.database import supabase
from app.schemas.organization import OrganizationCreate, OrganizationUpdate


def generate_slug(name: str) -> str:
    """Generate a clean URL-friendly slug from a string."""
    slug = name.strip().lower()
    slug = unicodedata.normalize('NFKD', slug).encode('ascii', 'ignore').decode('utf-8')
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug or "org"


def generate_unique_slug(name: str, exclude_id: str | None = None) -> str:
    """Generate a unique slug, appending incrementing numbers if a collision occurs."""
    base_slug = generate_slug(name)
    candidate_slug = base_slug
    counter = 1

    while True:
        try:
            query = supabase.table("organizations").select("id").eq("slug", candidate_slug)
            if exclude_id:
                query = query.neq("id", exclude_id)
            result = query.execute()
            if not result.data:
                return candidate_slug
            candidate_slug = f"{base_slug}-{counter}"
            counter += 1
        except PostgrestAPIError as e:
            # If query fails, fallback to timestamp/counter suffix
            return f"{base_slug}-{counter}"


def create_organization(org_data: OrganizationCreate, owner_id: str) -> dict:
    slug = generate_unique_slug(org_data.name)
    payload = {
        "name": org_data.name,
        "slug": slug,
        "owner_id": owner_id,
    }
    if org_data.description:
        payload["description"] = org_data.description

    try:
        result = (
            supabase
            .table("organizations")
            .insert(payload)
            .execute()
        )
    except PostgrestAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}"
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create organization"
        )

    return result.data[0]


def get_user_organizations(owner_id: str) -> list[dict]:
    try:
        result = (
            supabase
            .table("organizations")
            .select("*")
            .eq("owner_id", owner_id)
            .execute()
        )
    except PostgrestAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}"
        )

    return result.data or []


def get_organization_by_id(organization_id: str, owner_id: str) -> dict:
    try:
        result = (
            supabase
            .table("organizations")
            .select("*")
            .eq("id", organization_id)
            .execute()
        )
    except PostgrestAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}"
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )

    org = result.data[0]
    if str(org.get("owner_id")) != str(owner_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this organization"
        )

    return org


def update_organization(organization_id: str, org_data: OrganizationUpdate, owner_id: str) -> dict:
    org = get_organization_by_id(organization_id, owner_id)

    update_payload = {}
    if org_data.name is not None and org_data.name != org.get("name"):
        update_payload["name"] = org_data.name
        update_payload["slug"] = generate_unique_slug(org_data.name, exclude_id=organization_id)

    if not update_payload:
        return org

    try:
        result = (
            supabase
            .table("organizations")
            .update(update_payload)
            .eq("id", organization_id)
            .execute()
        )
    except PostgrestAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}"
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update organization"
        )

    return result.data[0]


def delete_organization(organization_id: str, owner_id: str) -> dict:
    # Ensure organization exists and caller is owner
    get_organization_by_id(organization_id, owner_id)

    try:
        supabase.table("organizations").delete().eq("id", organization_id).execute()
    except PostgrestAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}"
        )

    return {"message": "Organization deleted successfully", "id": organization_id}
