"""Endpoints de autenticación (login JWT + registro de usuario)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ...core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from ...db.models import User
from ...db.session import get_db
from ...schemas.auth import Token, UserInfo, UserRegisterRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserInfo, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)) -> UserInfo:
    """Crea un usuario nuevo. Devuelve la info del usuario creado.

    Para esta demo el `tier` lo elige el cliente. En producción
    `tier=premium` requeriría una verificación de pago.
    """
    user = User(
        username=payload.username,
        hashed_password=hash_password(payload.password),
        tier=payload.tier,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El usuario {payload.username!r} ya existe",
        )
    db.refresh(user)
    return UserInfo(username=user.username, tier=user.tier)


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    """Login con username + password. Devuelve JWT.

    **Usuarios demo (sembrados al iniciar el backend)**:
    - `free_user` / `free123`  → tier free
    - `premium_user` / `premium123`  → tier premium
    """
    user = db.scalar(select(User).where(User.username == form_data.username))
    if user is None or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        subject=user.username,
        extra_claims={"tier": user.tier},
    )
    return Token(access_token=token, tier=user.tier)


@router.get("/me", response_model=UserInfo)
def me(current: dict = Depends(get_current_user)) -> UserInfo:
    """Devuelve la info del usuario autenticado (a partir del JWT)."""
    return UserInfo(username=current["username"], tier=current["tier"])
