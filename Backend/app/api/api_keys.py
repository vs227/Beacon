import secrets
import time
from typing import Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/organizations/{org_id}/projects/{project_id}/api-keys", tags=["API Keys"])

# In-memory storage for API keys per project session
API_KEYS_DB: Dict[str, List[Dict]] = {}

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
        "status": "ACTIVE"
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
