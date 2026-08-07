from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class RegisterUser(BaseModel):
    username: str = Field(
        ...,
        min_length=3,
        max_length=30
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8
    )

class LoginUser(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    message: str
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    auth_provider: Optional[str] = "email"