"""Endpoint de historial de enfrentamientos (head-to-head)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from ...schemas.predict import HeadToHeadEntry
from ...services.feature_builder import FeatureBuilder, get_feature_builder

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/{team1}/vs/{team2}", response_model=list[HeadToHeadEntry])
def head_to_head(
    team1: str,
    team2: str,
    limit: int = Query(10, ge=1, le=50),
    fb: FeatureBuilder = Depends(get_feature_builder),
) -> list[HeadToHeadEntry]:
    """Últimos N enfrentamientos directos entre dos selecciones."""
    matches, _ = fb.head_to_head(team1, team2, window=limit)
    return [HeadToHeadEntry(**m) for m in matches]
