"""FastAPI app entrypoint para GoalPredict 2026.

Carga todos los modelos `.pkl` y CSVs al startup vía `lifespan`. Expone:
- /api/v1/auth/login          (POST)  → JWT
- /api/v1/auth/me             (GET)   → info del usuario
- /api/v1/teams               (GET)   → lista de selecciones
- /api/v1/teams/{team_name}   (GET)   → perfil detallado
- /api/v1/predict/result      (POST)  → probabilidades W/D/L (free)
- /api/v1/predict/stats       (POST)  → predicciones premium (requiere JWT)
- /api/v1/history/{a}/vs/{b}  (GET)   → H2H

Docs interactivas en `/docs` y `/redoc`.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import auth as auth_router
from .api.routes import history as history_router
from .api.routes import predict as predict_router
from .api.routes import teams as teams_router
from .core.config import get_settings
from .services.feature_builder import get_feature_builder
from .services.model_loader import load_all_models, set_models


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Carga modelos y datos al arrancar el server."""
    settings = get_settings()
    print(f"\n=== {settings.app_name} ===")
    print(f"Models dir : {settings.models_dir}")
    print(f"Datasets   : {settings.datasets_dir}")
    print(f"Processed  : {settings.processed_data_dir}")

    print("\n[startup] Cargando modelos entrenados...")
    models = load_all_models()
    set_models(models)
    loaded = sum(1 for f in (
        models.classifier, models.total_goals, models.over_2_5,
        models.goals_1t, models.goals_2t, models.yellow_cards,
        models.red_card, models.wc2022_baselines, models.clustering,
    ) if f)
    print(f"[startup] {loaded}/9 modelos cargados.")

    print("[startup] Cargando feature builder y dataset Martj42...")
    fb = get_feature_builder()
    print(f"[startup] {len(fb.known_teams())} selecciones disponibles.")
    print("[startup] OK. Server listo.\n")

    yield

    print("[shutdown] Bye.")


settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    description=(
        "API REST para GoalPredict 2026 — plataforma de predicción ML "
        "aplicada al Mundial de Fútbol FIFA 2026."
    ),
    version="0.1.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Mount routers ----------------------------------------------------
prefix = settings.api_v1_prefix
app.include_router(auth_router.router, prefix=prefix)
app.include_router(teams_router.router, prefix=prefix)
app.include_router(predict_router.router, prefix=prefix)
app.include_router(history_router.router, prefix=prefix)


@app.get("/", tags=["meta"])
def root() -> dict:
    """Endpoint raíz informativo."""
    return {
        "name": settings.app_name,
        "version": "0.1.0",
        "docs": "/docs",
        "endpoints": {
            "auth_login": f"{prefix}/auth/login",
            "teams_list": f"{prefix}/teams",
            "predict_result": f"{prefix}/predict/result",
            "predict_stats": f"{prefix}/predict/stats",
            "history": f"{prefix}/history/{{team1}}/vs/{{team2}}",
        },
    }


@app.get("/health", tags=["meta"])
def health() -> dict:
    """Healthcheck básico."""
    return {"status": "ok"}
