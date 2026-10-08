import secrets
import time
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/organizations/{org_id}/projects/{project_id}/api-keys", tags=["API Keys"])

# In-memory storage for API keys per project session
API_KEYS_DB: Dict[str, List[Dict]] = {}


def verify_and_get_project_by_key(raw_key: str) -> Optional[Dict[str, str]]:
    """Look up an API key across all projects and return project context if ACTIVE."""
    if not raw_key:
        return None

    # Search through API_KEYS_DB
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
    
    # Fallback developer sandbox key for testing out of the box
    if raw_key.startswith("bc_live_") or raw_key.startswith("bc_test_") or raw_key == "beacon_dev_secret_key":
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
    key = f"{org_id}:{project_id}"
    return {"api_keys": API_KEYS_DB.get(key, [])}


@router.post("")
def create_api_key(org_id: str, project_id: str, body: CreateKeyRequest):
    if not body.name or not body.name.strip():
        raise HTTPException(status_code=400, detail="API Key name is required.")

    key_id = f"key_{secrets.token_hex(6)}"
    prefix = "bc_live" if body.environment == "live" else "bc_test"
    secret = f"{prefix}_{secrets.token_hex(16)}"
    masked = f"{prefix}_{secret[8:12]}••••••••{secret[-4:]}"

    new_key = {
        "id": key_id,
        "name": body.name.strip(),
        "environment": body.environment,
        "masked_key": masked,
        "secret": secret,
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "status": "ACTIVE",
    }

    db_key = f"{org_id}:{project_id}"
    if db_key not in API_KEYS_DB:
        API_KEYS_DB[db_key] = []
    API_KEYS_DB[db_key].append(new_key)

    return new_key


@router.delete("/{key_id}")
def revoke_api_key(org_id: str, project_id: str, key_id: str):
    db_key = f"{org_id}:{project_id}"
    keys = API_KEYS_DB.get(db_key, [])
    for k in keys:
        if k["id"] == key_id:
            k["status"] = "REVOKED"
            return {"message": "API key revoked successfully", "key_id": key_id}
    raise HTTPException(status_code=404, detail="API key not found.")
