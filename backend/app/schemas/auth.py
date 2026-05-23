"""Schemas para autenticación."""

from __future__ import annotations

from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    tier: str


class UserInfo(BaseModel):
    username: str
    tier: str
