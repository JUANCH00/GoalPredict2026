"""Schemas para el endpoint /teams."""

from __future__ import annotations

from pydantic import BaseModel


class Team(BaseModel):
    name: str
    cluster: int | None = None
    cluster_label: str | None = None
    win_rate: float | None = None
    avg_goals_for: float | None = None
    avg_goals_against: float | None = None
    n_recent_matches: int | None = None


class TeamProfile(Team):
    """Perfil detallado de una selección, incluye stats avanzadas si están disponibles."""
    avg_possession: float | None = None
    avg_corners: float | None = None
    avg_fouls: float | None = None
    avg_attempts: float | None = None


class TeamsListResponse(BaseModel):
    total: int
    teams: list[Team]
