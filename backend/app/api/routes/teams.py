"""Endpoints relacionados con las selecciones nacionales."""

from __future__ import annotations

import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query

from ...schemas.teams import Team, TeamProfile, TeamsListResponse
from ...services.feature_builder import FeatureBuilder, get_feature_builder
from ...services.prediction_service import PredictionService, get_prediction_service

router = APIRouter(prefix="/teams", tags=["teams"])


def _team_from_row(row: pd.Series) -> Team:
    def _safe(val):
        return None if pd.isna(val) else val

    return Team(
        name=row["team"],
        cluster=int(row["cluster"]) if not pd.isna(row.get("cluster")) else None,
        cluster_label=_safe(row.get("cluster_label")),
        win_rate=_safe(row.get("win_rate")),
        avg_goals_for=_safe(row.get("avg_gf")),
        avg_goals_against=_safe(row.get("avg_ga")),
        n_recent_matches=int(row["n_matches"]) if not pd.isna(row.get("n_matches")) else None,
    )


@router.get("", response_model=TeamsListResponse)
def list_teams(
    q: str | None = Query(None, description="Filtro por nombre (case-insensitive)"),
    min_matches: int = Query(0, ge=0, description="Filtrar por mínimo de partidos recientes"),
    service: PredictionService = Depends(get_prediction_service),
) -> TeamsListResponse:
    """Lista todas las selecciones perfiladas con su cluster y stats."""
    df = service.team_profiles.copy()
    if q:
        df = df[df["team"].str.contains(q, case=False, na=False)]
    if min_matches > 0 and "n_matches" in df.columns:
        df = df[df["n_matches"] >= min_matches]

    teams = [_team_from_row(r) for _, r in df.sort_values("team").iterrows()]
    return TeamsListResponse(total=len(teams), teams=teams)


@router.get("/{team_name}", response_model=TeamProfile)
def get_team_profile(
    team_name: str,
    service: PredictionService = Depends(get_prediction_service),
    fb: FeatureBuilder = Depends(get_feature_builder),
) -> TeamProfile:
    """Perfil detallado de una selección, incluye stats avanzadas WC2022 si están."""
    df = service.team_profiles
    matches = df[df["team"].str.casefold() == team_name.casefold()]
    if matches.empty:
        if not fb.has_team(team_name):
            raise HTTPException(status_code=404, detail=f"Selección no encontrada: {team_name}")
        # El equipo existe en match_features pero no en team_profiles.csv
        return TeamProfile(name=team_name)

    row = matches.iloc[0]

    def _safe(col: str):
        v = row.get(col)
        return None if (v is None or pd.isna(v)) else float(v)

    return TeamProfile(
        name=row["team"],
        cluster=int(row["cluster"]) if not pd.isna(row.get("cluster")) else None,
        cluster_label=None if pd.isna(row.get("cluster_label")) else row.get("cluster_label"),
        win_rate=_safe("win_rate"),
        avg_goals_for=_safe("avg_gf"),
        avg_goals_against=_safe("avg_ga"),
        n_recent_matches=int(row["n_matches"]) if not pd.isna(row.get("n_matches")) else None,
        avg_possession=_safe("possession"),
        avg_corners=_safe("corners"),
        avg_fouls=_safe("fouls"),
        avg_attempts=_safe("attempts"),
    )
