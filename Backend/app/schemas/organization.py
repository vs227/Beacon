from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class OrganizationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)


class OrganizationResponse(BaseModel):
    id: str
    name: str
    slug: str
    owner_id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
