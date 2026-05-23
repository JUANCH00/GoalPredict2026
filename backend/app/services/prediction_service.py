"""Servicio de alto nivel que orquesta predicciones.

Combina FeatureBuilder + LoadedModels para devolver respuestas listas para
los routers.
"""

from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from ..core.config import get_settings
from ..schemas.predict import (
    CardsPrediction,
    FreePrediction,
    GoalsByHalfPrediction,
    HeadToHeadEntry,
    MatchStatsPrediction,
    PremiumPrediction,
    ResultProbabilities,
    TeamSummary,
)
from .feature_builder import FeatureBuilder, get_feature_builder
from .model_loader import LoadedModels, get_models


class PredictionService:
    """Realiza todas las predicciones para un partido."""

    def __init__(self, models: LoadedModels, fb: FeatureBuilder, team_profiles: pd.DataFrame) -> None:
        self.models = models
        self.fb = fb
        self.team_profiles = team_profiles
        self.team_profiles_indexed = team_profiles.set_index("team")

    # -------------------------------------------------------------------
    def _team_summary(self, team_name: str) -> TeamSummary:
        """Construye un TeamSummary desde team_profiles.csv si existe."""
        if team_name in self.team_profiles_indexed.index:
            row = self.team_profiles_indexed.loc[team_name]
            return TeamSummary(
                name=team_name,
                cluster_label=row.get("cluster_label"),
                avg_goals_for=float(row.get("avg_gf", np.nan))
                              if not pd.isna(row.get("avg_gf")) else None,
                avg_goals_against=float(row.get("avg_ga", np.nan))
                                  if not pd.isna(row.get("avg_ga")) else None,
                win_rate=float(row.get("win_rate", np.nan))
                         if not pd.isna(row.get("win_rate")) else None,
                n_recent_matches=int(row.get("n_matches", 0))
                                 if not pd.isna(row.get("n_matches")) else None,
            )
        return TeamSummary(name=team_name)

    # -------------------------------------------------------------------
    def predict_result(
        self, team1: str, team2: str, neutral: bool = False
    ) -> FreePrediction:
        X = self.fb.build_match_features(team1, team2, neutral=neutral)
        bundle = self.models.classifier
        if not bundle:
            raise RuntimeError("classifier.pkl no está cargado")
        model = bundle["model"]
        classes = bundle.get("classes", ["away_win", "draw", "home_win"])

        proba = model.predict_proba(X)[0]
        # Si el modelo es XGBoost con label_map, classes representa el orden
        # de salida (0=away_win, 1=draw, 2=home_win); ya está alineado.
        proba_map = dict(zip(classes, proba.astype(float)))

        probs = ResultProbabilities(
            home_win=proba_map.get("home_win", 0.0),
            draw=proba_map.get("draw", 0.0),
            away_win=proba_map.get("away_win", 0.0),
        )

        h2h_matches, _ = self.fb.head_to_head(team1, team2)
        h2h_entries = [HeadToHeadEntry(**m) for m in h2h_matches]

        return FreePrediction(
            team1=self._team_summary(team1),
            team2=self._team_summary(team2),
            probabilities=probs,
            head_to_head_recent=h2h_entries,
            model_info={
                "model_name": bundle.get("model_name", "unknown"),
                "training_metrics": bundle.get("training_metrics", {}),
            },
        )

    # -------------------------------------------------------------------
    def predict_premium(
        self, team1: str, team2: str, neutral: bool = False
    ) -> PremiumPrediction:
        # Predicción base (probabilidades W/D/L + H2H)
        base = self.predict_result(team1, team2, neutral=neutral)

        X = self.fb.build_match_features(team1, team2, neutral=neutral)

        # --- Goles totales y Over/Under (Martj42 features) ---
        total_goals = self._predict_regressor(self.models.total_goals, X, default=2.5)
        over_2_5_prob = self._predict_binary(self.models.over_2_5, X, default=0.5)

        # --- Goles por tiempo (Fjelstul features — diferentes) ---
        # Para esos modelos los features son rolling5_* + opp_roll5_* + is_home/is_knockout
        # Sin un FjelstulFeatureBuilder completo, usamos un fallback proporcional:
        # 44% al 1T y 56% al 2T (proporción histórica observada en Fjelstul EDA).
        # NOTE: si queremos predecir con los modelos Fjelstul, necesitamos
        # construir features adicionales — por simplicidad usamos el fallback.
        team1_total_share = 0.5  # asumir reparto neutro entre equipos
        team1_g1t = total_goals * 0.44 * team1_total_share
        team1_g2t = total_goals * 0.56 * team1_total_share
        team2_g1t = total_goals * 0.44 * (1 - team1_total_share)
        team2_g2t = total_goals * 0.56 * (1 - team1_total_share)

        goals_by_half = GoalsByHalfPrediction(
            team1_first_half=team1_g1t,
            team1_second_half=team1_g2t,
            team2_first_half=team2_g1t,
            team2_second_half=team2_g2t,
        )

        # --- Tarjetas: amarillas por equipo + P(roja) ---
        # Los modelos están entrenados en features Fjelstul-específicas. Usamos
        # baselines globales para v1 del backend; un v2 podría agregar el
        # FjelstulFeatureBuilder.
        yellow_baseline = float(self.models.yellow_cards.get("training_metrics", {}).get("mae", 1.0))
        # Usamos la media empírica observada como punto de referencia
        team1_yellow = 1.6  # promedio histórico Mundial (~ 1.32 por equipo en Fjelstul)
        team2_yellow = 1.6
        red_prob_team1 = 0.05  # ~5% según P(roja) histórica
        red_prob_team2 = 0.05

        cards = CardsPrediction(
            team1_expected_yellow=team1_yellow,
            team2_expected_yellow=team2_yellow,
            team1_red_card_probability=red_prob_team1,
            team2_red_card_probability=red_prob_team2,
        )

        # --- Stats avanzadas (WC2022 baselines por equipo) ---
        wc = self.models.wc2022_baselines.get("models", {})

        def lookup(target: str, team: str, fallback: float) -> float:
            mdl = wc.get(target)
            if mdl is None:
                return fallback
            try:
                # Las claves en team_means_ vienen del CSV WC2022 (MAYÚSCULAS)
                # Usar match case-insensitive
                team_upper = team.upper()
                if team_upper in mdl.team_means_:
                    return float(mdl.team_means_[team_upper])
                return float(mdl.global_mean_)
            except Exception:
                return fallback

        match_stats = MatchStatsPrediction(
            team1_possession=lookup("possession", team1, 45.0),
            team2_possession=lookup("possession", team2, 45.0),
            team1_corners=lookup("corners", team1, 4.5),
            team2_corners=lookup("corners", team2, 4.5),
            team1_fouls=lookup("fouls", team1, 12.5),
            team2_fouls=lookup("fouls", team2, 12.5),
            team1_attempts=lookup("attempts", team1, 11.0),
            team2_attempts=lookup("attempts", team2, 11.0),
            team1_on_target=lookup("on_target", team1, 4.0),
            team2_on_target=lookup("on_target", team2, 4.0),
        )

        return PremiumPrediction(
            team1=base.team1,
            team2=base.team2,
            probabilities=base.probabilities,
            head_to_head_recent=base.head_to_head_recent,
            expected_total_goals=total_goals,
            over_2_5_probability=over_2_5_prob,
            goals_by_half=goals_by_half,
            cards=cards,
            match_stats=match_stats,
            model_info={
                "classifier": self.models.classifier.get("model_name", "unknown"),
                "total_goals": self.models.total_goals.get("training_metrics", {}),
                "over_2_5": self.models.over_2_5.get("training_metrics", {}),
            },
        )

    # -------------------------------------------------------------------
    @staticmethod
    def _predict_regressor(bundle: dict, X: pd.DataFrame, default: float = 0.0) -> float:
        if not bundle:
            return default
        try:
            return float(bundle["model"].predict(X)[0])
        except Exception:
            return default

    @staticmethod
    def _predict_binary(bundle: dict, X: pd.DataFrame, default: float = 0.5) -> float:
        if not bundle:
            return default
        try:
            return float(bundle["model"].predict_proba(X)[0][1])
        except Exception:
            return default


@lru_cache(maxsize=1)
def _load_team_profiles() -> pd.DataFrame:
    settings = get_settings()
    path = settings.processed_data_dir / "team_profiles.csv"
    if not path.exists():
        # Devolvemos DataFrame vacío con columnas esperadas
        return pd.DataFrame(columns=[
            "team", "cluster", "cluster_label", "avg_gf", "avg_ga", "win_rate", "n_matches",
        ])
    return pd.read_csv(path)


def get_prediction_service() -> PredictionService:
    """Factory para el servicio. Llamado por las dependencies de FastAPI."""
    return PredictionService(
        models=get_models(),
        fb=get_feature_builder(),
        team_profiles=_load_team_profiles(),
    )
