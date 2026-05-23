"""Configuración global del backend.

Todas las settings sensibles vienen de variables de entorno (cargadas
automáticamente desde `.env` por pydantic-settings). Ver `.env.example`
para la plantilla completa.
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
        "http://localhost:8080",     # frontend nginx (compose)
        "http://127.0.0.1:5173",
    ]

    # --- JWT ---
    jwt_secret_key: str = "change-me-in-production-this-is-not-a-real-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # 24h

    # --- Database ---
    # Por defecto sqlite local (útil para tests / dev sin docker).
    # En compose se sobreescribe vía DATABASE_URL apuntando a postgres.
    database_url: str = f"sqlite:///{REPO_ROOT / 'backend' / 'goalpredict.sqlite'}"

    # --- Usuarios demo (se siembran solo si la tabla `users` está vacía) ---
    demo_free_username: str = "free_user"
    demo_free_password: str = "free123"
    demo_premium_username: str = "premium_user"
    demo_premium_password: str = "premium123"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        # Permitir, por ejemplo, JWT_SECRET_KEY o jwt_secret_key en .env
        case_sensitive=False,
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
