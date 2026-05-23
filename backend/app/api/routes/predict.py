"""Endpoints de predicción (capa free + premium)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from ...core.security import get_current_user, require_premium
from ...schemas.predict import FreePrediction, MatchRequest, PremiumPrediction
from ...services.prediction_service import PredictionService, get_prediction_service

router = APIRouter(prefix="/predict", tags=["predict"])


@router.post("/result", response_model=FreePrediction)
def predict_result(
    req: MatchRequest,
    service: PredictionService = Depends(get_prediction_service),
) -> FreePrediction:
    """**Capa gratuita** — predice la probabilidad de victoria / empate / derrota.

    No requiere autenticación.
    """
    try:
        return service.predict_result(req.team1, req.team2, neutral=req.neutral)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e


@router.post("/stats", response_model=PremiumPrediction)
def predict_stats(
    req: MatchRequest,
    user: dict = Depends(require_premium),
    service: PredictionService = Depends(get_prediction_service),
) -> PremiumPrediction:
    """**Capa premium** — predice resultado + goles 1T/2T, tarjetas, corners,
    posesión y faltas por equipo.

    Requiere JWT con tier=`premium`.
    """
    try:
        return service.predict_premium(req.team1, req.team2, neutral=req.neutral)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
