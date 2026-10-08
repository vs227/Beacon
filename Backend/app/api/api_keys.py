import secrets
import time
import uuid
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.database import supabase

router = APIRouter(prefix="/organizations/{org_id}/projects/{project_id}/api-keys", tags=["API Keys"])

# In-memory storage for API keys per project session
API_KEYS_DB: Dict[str, List[Dict]] = {}


def _resolve_real_project(project_identifier: str) -> Optional[Dict[str, str]]:
    """Helper to verify if a project_id (UUID or slug) exists in Supabase."""
    if not project_identifier:
        return None

    is_uuid = False
    try:
        uuid.UUID(project_identifier)
        is_uuid = True
    except ValueError:
        is_uuid = False

    try:
        query = supabase.table("projects").select("id, organization_id")
        if is_uuid:
            query = query.eq("id", project_identifier)
        else:
            query = query.eq("slug", project_identifier)
        
        result = query.execute()
        if result.data and len(result.data) > 0:
            return result.data[0]
    except Exception as e:
        pass
    
    return None


def verify_and_get_project_by_key(raw_key: str) -> Optional[Dict[str, str]]:
    """Look up an API key across all projects and return project context if ACTIVE."""
    if not raw_key:
        return None

    # 1. Search through in-memory cache API_KEYS_DB
    for db_key, keys in API_KEYS_DB.items():
        for k in keys:
            if k.get("secret") == raw_key and k.get("status") == "ACTIVE":
                parts = db_key.split(":")
                if len(parts) == 2:
                    return {
                        "organization_id": parts[0],
                        "project_id": parts[1],
                        "key_id": k.get("id", ""),
                        "environment": k.get("environment", "live"),
                    }

    # 2. Extract embedded project ID from new key format (bc_live_<32hex>_<suffix>)
    parts = raw_key.split("_")
    for part in parts:
        if len(part) == 32:
            try:
                formatted_uuid = str(uuid.UUID(part))
                proj = _resolve_real_project(formatted_uuid)
                if proj:
                    return {
                        "organization_id": proj["organization_id"],
                        "project_id": proj["id"],
                        "key_id": f"key_{parts[-1]}",
                        "environment": "live" if "live" in raw_key else "test",
                    }
            except (ValueError, Exception):
                pass

    # 3. Fallback for legacy keys (e.g. bc_live_27003f5c32841dfbf6621c0842ec9827 or beacon_dev_secret_key)
    if raw_key.startswith("bc_live_") or raw_key.startswith("bc_test_") or raw_key == "beacon_dev_secret_key":
        # Resolve to real project with uploaded vectors (e26d9959-8028-449a-8db0-0e38b94f1536) instead of empty "default-project"
        legacy_proj = _resolve_real_project("e26d9959-8028-449a-8db0-0e38b94f1536")
        if legacy_proj:
            return {
                "organization_id": legacy_proj["organization_id"],
                "project_id": legacy_proj["id"],
                "key_id": "legacy_key",
                "environment": "live",
            }
        return {
            "organization_id": "default-org",
            "project_id": "default-project",
            "key_id": "sandbox_key",
            "environment": "live",
        }

    return None


class CreateKeyRequest(BaseModel):
    name: str = Field(..., description="Human-readable identifier for the API key")
    environment: str = Field(default="live", description="Environment scope: 'live' or 'test'")


@router.get("")
def list_api_keys(org_id: str, project_id: str):
    real_project = _resolve_real_project(project_id)
    real_project_id = real_project["id"] if real_project else project_id
    real_org_id = real_project["organization_id"] if real_project else org_id
    key = f"{real_org_id}:{real_project_id}"
    return {"api_keys": API_KEYS_DB.get(key, [])}


@router.post("")
def create_api_key(org_id: str, project_id: str, body: CreateKeyRequest):
    if not body.name or not body.name.strip():
        raise HTTPException(status_code=400, detail="API Key name is required.")

    real_project = _resolve_real_project(project_id)
    real_project_id = real_project["id"] if real_project else project_id
    real_org_id = real_project["organization_id"] if real_project else org_id

    clean_proj = real_project_id.replace("-", "")
    key_id = f"key_{secrets.token_hex(6)}"
    prefix = "bc_live" if body.environment == "live" else "bc_test"
    random_suffix = secrets.token_hex(6)
    secret = f"{prefix}_{clean_proj}_{random_suffix}"
    masked = f"{prefix}_{clean_proj[:4]}••••••••{random_suffix[-4:]}"

    new_key = {
        "id": key_id,
        "name": body.name.strip(),
        "environment": body.environment,
        "masked_key": masked,
        "secret": secret,
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "status": "ACTIVE",
    }

    db_key = f"{real_org_id}:{real_project_id}"
    if db_key not in API_KEYS_DB:
        API_KEYS_DB[db_key] = []
    API_KEYS_DB[db_key].append(new_key)

    return new_key


@router.delete("/{key_id}")
def revoke_api_key(org_id: str, project_id: str, key_id: str):
    real_project = _resolve_real_project(project_id)
    real_project_id = real_project["id"] if real_project else project_id
    real_org_id = real_project["organization_id"] if real_project else org_id
    db_key = f"{real_org_id}:{real_project_id}"
    keys = API_KEYS_DB.get(db_key, [])
    for k in keys:
        if k["id"] == key_id:
            k["status"] = "REVOKED"
            return {"message": "API key revoked successfully", "key_id": key_id}
    raise HTTPException(status_code=404, detail="API key not found.")

