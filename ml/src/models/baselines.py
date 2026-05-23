"""Baselines simples reutilizables.

Estas clases viven aquí (en un módulo importable) para que joblib pueda
deserializarlas tanto desde notebooks como desde el backend FastAPI.
"""

from __future__ import annotations

import numpy as np
import pandas as pd


class TeamAveragePredictor:
    """Baseline: predice el promedio histórico de cada equipo.

    Si el equipo no apareció durante el entrenamiento, devuelve la media
    global. Útil para WC2022 (solo 64 partidos, demasiado poco para un
    modelo de regresión real).
    """

    def __init__(self) -> None:
        self.team_means_: dict[str, float] = {}
        self.global_mean_: float | None = None

    def fit(self, team_names, y):
        d = pd.DataFrame({"t": team_names, "y": y})
        self.team_means_ = d.groupby("t")["y"].mean().to_dict()
        self.global_mean_ = float(np.mean(y))
        return self

    def predict(self, team_names):
        if self.global_mean_ is None:
            raise RuntimeError("TeamAveragePredictor no ha sido entrenado.")
        return np.array(
            [self.team_means_.get(t, self.global_mean_) for t in team_names]
        )
