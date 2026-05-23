"""Schemas para autenticación."""

from __future__ import annotations

from pydantic import BaseModel, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    tier: str


class UserInfo(BaseModel):
    username: str
    tier: str


class UserRegisterRequest(BaseModel):
    """Payload para crear un usuario nuevo via /auth/register.

    El `tier` por defecto es 'free'. La capa premium en una versión real
    se desbloquearía con un pago; aquí lo dejamos editable solo para que
    sea trivial probarla en la demo.
    """
    username: str = Field(..., min_length=3, max_length=64, pattern=r"^[A-Za-z0-9_.-]+$")
    password: str = Field(..., min_length=6, max_length=128)
    tier: str = Field(default="free", pattern=r"^(free|premium)$")
