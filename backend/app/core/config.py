"""Configuración global del backend.

Las rutas a los modelos y datasets se resuelven relativas a la raíz del repo.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


# Raíz del repo: backend/app/core/config.py -> subir 3 niveles
REPO_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    # --- Paths a los artefactos del pipeline ML ---
    repo_root: Path = REPO_ROOT
    models_dir: Path = REPO_ROOT / "ml" / "trained_models"
    processed_data_dir: Path = REPO_ROOT / "ml" / "data" / "processed"
    datasets_dir: Path = REPO_ROOT / "datasets"

    # --- App ---
    app_name: str = "GoalPredict 2026 API"
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = [
        "http://localhost:5173",     # vite dev
        "http://localhost:3000",     # CRA dev
        "http://127.0.0.1:5173",
    ]

    # --- JWT ---
    # En producción mover esto a una variable de entorno (.env)
    jwt_secret_key: str = "change-me-in-production-this-is-not-a-real-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # 24h

    # --- Bcrypt / auth demo ---
    # Para este proyecto académico usamos una "base de datos" en memoria con
    # 2 usuarios. En producción esto va a PostgreSQL.
    demo_users: dict[str, dict] = {
        "free_user": {
            "username": "free_user",
            # password: "free123"
            "hashed_password": "$2b$12$fZzGJySowPIWK5O3P2IhtO1GGl.w8IuEprTGd8QHe6NtT.xjJchOe",
            "tier": "free",
        },
        "premium_user": {
            "username": "premium_user",
            # password: "premium123"
            "hashed_password": "$2b$12$03dfNnC/4AtBblUbuJvnSuCnejUt2irMkocNq3Npi0HUpJM9xdUP6",
            "tier": "premium",
        },
    }

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
