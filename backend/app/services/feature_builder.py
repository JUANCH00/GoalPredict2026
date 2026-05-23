"""Construye el vector de features para un partido NUEVO (sin score aún).

El problema: los modelos esperan features como `team1_roll5_win_rate` que se
calcularon durante el feature engineering. Para un partido nuevo (ej. Argentina
vs Brasil en el Mundial 2026), necesitamos extraer el estado MÁS RECIENTE de
cada selección desde el CSV de entrenamiento.
"""

from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import numpy as np
import pandas as pd

from ..core.config import get_settings


# Sufijos comunes en feature engineering
_TEAM_FEATURE_PREFIXES = ("team1_", "team2_")


@dataclass
class TeamState:
    """Estado más reciente conocido de una selección."""
    name: str
    last_match_date: pd.Timestamp
    features: dict[str, float]  # nombres sin prefijo (e.g. "roll5_win_rate")


class FeatureBuilder:
    """Lee `match_features.csv` y `results.csv` (Martj42) y construye el
    vector de features para cualquier partido entre dos selecciones."""

    def __init__(self) -> None:
        settings = get_settings()
        features_path = settings.processed_data_dir / "match_features.csv"
        raw_path = settings.datasets_dir / "external" / "international_results" / "results.csv"

        if not features_path.exists():
            raise FileNotFoundError(
                f"No encontré {features_path}. Corre primero "
                f"`ml/notebooks/02_feature_engineering.ipynb`."
            )
        if not raw_path.exists():
            raise FileNotFoundError(
                f"No encontré {raw_path}. Descarga el dataset Martj42 a "
                f"`datasets/external/international_results/`."
            )

        self.features = pd.read_csv(features_path, parse_dates=["date"])
        self.raw_matches = pd.read_csv(raw_path, parse_dates=["date"])

        # Precompute el estado más reciente de cada selección
        self._team_state: dict[str, TeamState] = self._build_team_states()

        # Lista de selecciones disponibles para el frontend
        self._known_teams: list[str] = sorted(self._team_state.keys())

    # -------------------------------------------------------------------
    def _build_team_states(self) -> dict[str, TeamState]:
        """Para cada equipo, encuentra la fila más reciente donde aparece
        (como home o away) y extrae sus features."""
        feat = self.features
        teams = pd.concat([feat["home_team"], feat["away_team"]]).unique()

        # Indexar features por equipo para evitar O(N×teams)
        feat_sorted = feat.sort_values("date", ascending=False)

        state: dict[str, TeamState] = {}
        for team in teams:
            mask_home = feat_sorted["home_team"] == team
            mask_away = feat_sorted["away_team"] == team
            mask = mask_home | mask_away
            if not mask.any():
                continue
            row = feat_sorted[mask].iloc[0]
            side = "team1" if row["home_team"] == team else "team2"

            extracted: dict[str, float] = {}
            for col in feat.columns:
                if col.startswith(f"{side}_"):
                    key = col[len(f"{side}_"):]
                    extracted[key] = row[col]

            state[team] = TeamState(
                name=team,
                last_match_date=row["date"],
                features=extracted,
            )
        return state

    # -------------------------------------------------------------------
    def known_teams(self) -> list[str]:
        return self._known_teams

    def has_team(self, name: str) -> bool:
        return name in self._team_state

    def get_team_state(self, name: str) -> TeamState | None:
        return self._team_state.get(name)

    # -------------------------------------------------------------------
    def head_to_head(
        self,
        team1: str,
        team2: str,
        window: int = 10,
    ) -> tuple[list[dict], dict[str, float]]:
        """Últimos N partidos directos entre los dos equipos.

        Returns:
            (last_matches, h2h_summary):
              - last_matches: lista de partidos formateada para la UI.
              - h2h_summary: agregados {h2h_team1_win_rate, h2h_draw_rate,
                h2h_avg_goals_total, h2h_n_matches}.
        """
        m = self.raw_matches
        mask = (
            ((m["home_team"] == team1) & (m["away_team"] == team2))
            | ((m["home_team"] == team2) & (m["away_team"] == team1))
        )
        h2h = m[mask].dropna(subset=["home_score", "away_score"]).sort_values(
            "date", ascending=False
        ).head(window)

        if h2h.empty:
            summary = {
                "h2h_team1_win_rate": np.nan,
                "h2h_draw_rate": np.nan,
                "h2h_avg_goals_total": np.nan,
                "h2h_n_matches": 0,
            }
            return [], summary

        # Calcular tasa de victoria desde la perspectiva del team1
        t1_wins = 0
        draws = 0
        total_goals = 0
        for _, r in h2h.iterrows():
            gd = r["home_score"] - r["away_score"]
            if r["home_team"] == team1:
                if gd > 0:
                    t1_wins += 1
                elif gd == 0:
                    draws += 1
            else:  # team1 jugó de visitante
                if gd < 0:
                    t1_wins += 1
                elif gd == 0:
                    draws += 1
            total_goals += r["home_score"] + r["away_score"]

        n = len(h2h)
        summary = {
            "h2h_team1_win_rate": t1_wins / n,
            "h2h_draw_rate": draws / n,
            "h2h_avg_goals_total": total_goals / n,
            "h2h_n_matches": n,
        }

        last_matches = [
            {
                "date": r["date"].strftime("%Y-%m-%d"),
                "home_team": r["home_team"],
                "away_team": r["away_team"],
                "home_score": int(r["home_score"]),
                "away_score": int(r["away_score"]),
                "tournament": r["tournament"],
            }
            for _, r in h2h.iterrows()
        ]
        return last_matches, summary

    # -------------------------------------------------------------------
    def build_match_features(
        self,
        team1: str,
        team2: str,
        neutral: bool = False,
        tournament_group: str = "fifa_world_cup",
    ) -> pd.DataFrame:
        """Construye un DataFrame de 1 fila con todas las features que el
        clasificador y los regresores Martj42 esperan."""
        s1 = self.get_team_state(team1)
        s2 = self.get_team_state(team2)
        if s1 is None:
            raise ValueError(f"Selección desconocida: {team1!r}")
        if s2 is None:
            raise ValueError(f"Selección desconocida: {team2!r}")

        row: dict[str, float] = {}

        # team1_* y team2_* features
        for key, val in s1.features.items():
            row[f"team1_{key}"] = val
        for key, val in s2.features.items():
            row[f"team2_{key}"] = val

        # diff_* features
        for base in ("roll5_win_rate", "roll5_avg_gf", "roll5_avg_ga", "roll5_avg_gd",
                     "roll10_win_rate", "roll10_avg_gf", "roll10_avg_ga", "roll10_avg_gd"):
            v1 = row.get(f"team1_{base}")
            v2 = row.get(f"team2_{base}")
            if v1 is not None and v2 is not None:
                row[f"diff_{base}"] = v1 - v2
        row["diff_elo"] = row.get("team1_elo_before", 0) - row.get("team2_elo_before", 0)

        # H2H
        _, h2h_summary = self.head_to_head(team1, team2)
        row.update(h2h_summary)

        # Otros
        row["neutral"] = int(neutral)
        row["tournament_group"] = tournament_group

        return pd.DataFrame([row])


@lru_cache(maxsize=1)
def get_feature_builder() -> FeatureBuilder:
    """Singleton del builder. Carga los CSVs solo una vez."""
    return FeatureBuilder()
