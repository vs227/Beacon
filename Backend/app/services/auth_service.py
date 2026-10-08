"""
Authentication Service — Encapsulates database interactions, user registration,
password verification, user profile fetching, and GitHub OAuth state updates.
"""
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from postgrest.exceptions import APIError as PostgrestAPIError

from app.core.database import supabase
from app.core.auth import hash_password, verify_password, create_token


def register_user(username: str, email: str, password: str) -> Dict[str, Any]:
    """Register a new email/password user in Supabase."""
    hashed = hash_password(password)
    try:
        result = (
            supabase.table("users")
            .insert({
                "username": username,
                "email": email,
                "password_hash": hashed,
                "auth_provider": "email",
            })
            .execute()
        )
    except PostgrestAPIError as e:
        if e.code == "23505":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}",
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user",
        )

    return result.data[0]


def authenticate_user(email: str, password: str) -> Dict[str, Any]:
    """Authenticate an email/password user and return user data with access token."""
    try:
        result = (
            supabase.table("users")
            .select("*")
            .eq("email", email)
            .execute()
        )
    except PostgrestAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}",
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    db_user = result.data[0]

    if db_user.get("auth_provider") == "github" and not db_user.get("password_hash"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account was created with GitHub. Please log in using GitHub.",
        )

    if not db_user.get("password_hash") or not verify_password(password, db_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_token({
        "user_id": db_user["id"],
        "email": db_user["email"],
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user["id"],
            "username": db_user.get("username", db_user["email"].split("@")[0]),
            "email": db_user["email"],
        },
    }


def get_user_profile(user_id: str) -> Dict[str, Any]:
    """Fetch user profile metadata by user ID."""
    try:
        result = (
            supabase.table("users")
            .select("id, username, email, auth_provider, github_username")
            .eq("id", user_id)
            .execute()
        )
    except PostgrestAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}",
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    db_user = result.data[0]
    return {
        "user_id": db_user["id"],
        "username": db_user.get("username", db_user["email"].split("@")[0]),
        "email": db_user["email"],
        "auth_provider": db_user.get("auth_provider", "email"),
        "github_username": db_user.get("github_username", ""),
    }


def get_github_access_token(user_id: str) -> str:
    """Retrieve stored GitHub OAuth access token for a user."""
    try:
        result = (
            supabase.table("users")
            .select("github_access_token, auth_provider")
            .eq("id", user_id)
            .execute()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user_data = result.data[0]
    token = user_data.get("github_access_token", "")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No GitHub token found. Please log in with GitHub to access your repositories.",
        )
    return token


def handle_github_oauth_user(email: str, username: str, access_token: str) -> Dict[str, Any]:
    """Find or create a user upon successful GitHub OAuth callback."""
    try:
        existing = (
            supabase.table("users")
            .select("*")
            .eq("email", email)
            .execute()
        )
    except PostgrestAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}",
        )

    if existing.data:
        db_user = existing.data[0]
        try:
            supabase.table("users").update({
                "github_access_token": access_token,
                "github_username": username,
            }).eq("id", db_user["id"]).execute()
        except Exception:
            pass
    else:
        try:
            insert_res = (
                supabase.table("users")
                .insert({
                    "username": username,
                    "email": email,
                    "password_hash": "",
                    "auth_provider": "github",
                    "github_access_token": access_token,
                    "github_username": username,
                })
                .execute()
            )
            db_user = insert_res.data[0]
        except PostgrestAPIError as e:
            if e.code == "23505":
                lookup = (
                    supabase.table("users")
                    .select("*")
                    .eq("email", email)
                    .execute()
                )
                if lookup.data:
                    db_user = lookup.data[0]
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Email already exists under another provider",
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Database error: {e.message}",
                )

    jwt_token = create_token({
        "user_id": db_user["id"],
        "email": db_user["email"],
    })

    return {
        "jwt_token": jwt_token,
        "email": email,
        "username": username,
        "user_id": db_user["id"],
    }
