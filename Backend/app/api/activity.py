import time
from typing import Dict, List
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/organizations/{org_id}/projects/{project_id}/activity", tags=["Activity"])

ACTIVITY_DB: Dict[str, List[Dict]] = {}

class LogActivityRequest(BaseModel):
    event: str
    details: str
    latency: str = "12ms"
    status: str = "200 OK"
    status_color: str = "#4ade80"

@router.get("")
def get_activity_logs(org_id: str, project_id: str):
    key = f"{org_id}:{project_id}"
    logs = ACTIVITY_DB.get(key, [])
    return {"activity_logs": logs}

@router.post("")
def log_activity(org_id: str, project_id: str, body: LogActivityRequest):
    key = f"{org_id}:{project_id}"
    if key not in ACTIVITY_DB:
        ACTIVITY_DB[key] = []
    
    new_entry = {
        "event": body.event,
        "details": body.details,
        "latency": body.latency,
        "status": body.status,
        "statusColor": body.status_color,
        "time": time.strftime("%H:%M:%S")
    }
    ACTIVITY_DB[key].insert(0, new_entry)
    # Keep last 100 entries
    ACTIVITY_DB[key] = ACTIVITY_DB[key][:100]
    return new_entry
