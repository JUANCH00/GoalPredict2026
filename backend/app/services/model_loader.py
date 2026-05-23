"""Carga los .pkl entrenados al arrancar la app y los cachea en memoria.

Cada modelo se guarda como dict con la forma:
    {'model': sklearn_pipeline, 'feature_cols': [...], ...}
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import joblib

from ..core.config import get_settings


@dataclass
class LoadedModels:
    """Contiene todos los artefactos cargados al startup."""
    # Capa gratuita
    classifier: dict = field(default_factory=dict)  # W/D/L

    # Capa premium
    total_goals: dict = field(default_factory=dict)
    over_2_5: dict = field(default_factory=dict)
    goals_1t: dict = field(default_factory=dict)
    goals_2t: dict = field(default_factory=dict)
    yellow_cards: dict = field(default_factory=dict)
    red_card: dict = field(default_factory=dict)
    wc2022_baselines: dict = field(default_factory=dict)

    # Clustering
    clustering: dict = field(default_factory=dict)

    def is_loaded(self) -> bool:
        return bool(self.classifier and self.classifier.get("model"))


def _load_pkl(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(f"Modelo no encontrado: {path}")
    return joblib.load(path)


def load_all_models() -> LoadedModels:
    """Carga todos los modelos persistidos en `ml/trained_models/`.

    Si algún modelo no existe, devuelve un dict vacío para ese slot —
    los endpoints que lo necesiten deben validar.
    """
    settings = get_settings()
    md = settings.models_dir

    def safe_load(name: str) -> dict:
        path = md / name
        if not path.exists():
            return {}
        try:
            return _load_pkl(path)
        except Exception as e:  # noqa: BLE001
            print(f"⚠️  No se pudo cargar {name}: {e}")
            return {}

    return LoadedModels(
        classifier=safe_load("classifier.pkl"),
        total_goals=safe_load("regressor_total_goals.pkl"),
        over_2_5=safe_load("classifier_over_2_5.pkl"),
        goals_1t=safe_load("regressor_goals_1t.pkl"),
        goals_2t=safe_load("regressor_goals_2t.pkl"),
        yellow_cards=safe_load("regressor_yellow_cards.pkl"),
        red_card=safe_load("classifier_red_card.pkl"),
        wc2022_baselines=safe_load("baseline_wc2022_stats.pkl"),
        clustering=safe_load("clustering_teams.pkl"),
    )


# Singleton — se inicializa en main.lifespan
_MODELS: LoadedModels | None = None


def set_models(models: LoadedModels) -> None:
    global _MODELS
    _MODELS = models


def get_models() -> LoadedModels:
    if _MODELS is None:
        raise RuntimeError(
            "Modelos no cargados. ¿Olvidaste llamar set_models() en el lifespan?"
        )
    return _MODELS
