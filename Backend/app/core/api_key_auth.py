"""
API Key Security Dependency — Authenticates external SDK requests using X-Beacon-Key
or Authorization: Bearer bc_live_... headers and resolves the project context.
"""
from typing import Dict, Any, Optional
from fastapi import Request, HTTPException, Security, status
from fastapi.security import APIKeyHeader

from app.api.api_keys import verify_and_get_project_by_key

api_key_header_scheme = APIKeyHeader(name="X-Beacon-Key", auto_error=False)


async def get_api_key_project(
    request: Request,
    api_key_header: Optional[str] = Security(api_key_header_scheme),
) -> Dict[str, str]:
    """Validate API key from X-Beacon-Key header or Authorization Bearer header."""
    raw_key = api_key_header

    # Fallback to Authorization header if X-Beacon-Key header is absent
    if not raw_key:
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            raw_key = auth_header.replace("Bearer ", "").strip()
        elif auth_header.startswith("Key "):
            raw_key = auth_header.replace("Key ", "").strip()

    if not raw_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API Key. Pass 'X-Beacon-Key' header or 'Authorization: Bearer bc_live_...'",
        )

    project_context = verify_and_get_project_by_key(raw_key)

    if not project_context:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API Key.",
        )

    return project_context
