"""Endpoints de autenticación (login JWT)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from ...core.config import get_settings
from ...core.security import create_access_token, get_current_user, verify_password
from ...schemas.auth import Token, UserInfo

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Token:
    """Login con username + password. Devuelve JWT.

    **Usuarios demo**:
    - `free_user` / `free123`  → tier free
    - `premium_user` / `premium123`  → tier premium
    """
    settings = get_settings()
    user = settings.demo_users.get(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        subject=user["username"],
        extra_claims={"tier": user["tier"]},
    )
    return Token(access_token=token, tier=user["tier"])


@router.get("/me", response_model=UserInfo)
def me(user: dict = Depends(get_current_user)) -> UserInfo:
    """Devuelve la info del usuario autenticado (a partir del JWT)."""
    return UserInfo(username=user["username"], tier=user["tier"])
