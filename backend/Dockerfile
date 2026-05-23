# syntax=docker/dockerfile:1.6
#
# Dockerfile del backend FastAPI de GoalPredict 2026.
#
# Optimizado: elimina nvidia-nccl-cu12 (~394 MB de libs CUDA que xgboost
# arrastra aunque no usemos GPU), pyc files y caches de pip/apt.
# Tamaño esperado: ~1.5 GB (antes ~1.87 GB).
#
# Build context = raíz del repo. Construir vía docker compose.

FROM python:3.11-slim AS runtime

# --- Dependencias de sistema ------------------------------------------
# - libgomp1: runtime de OpenMP que necesita xgboost
# - curl: usado por el HEALTHCHECK
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- Capa de dependencias Python --------------------------------------
# Separada para que cambios en código no invaliden el cache de pip.
# Tras la instalación:
#   - desinstalamos nvidia-nccl-cu12 (xgboost CPU-only no la usa)
#   - borramos pycache, pip cache, y el propio pip/setuptools/wheel del
#     runtime (no se necesitan después del install)
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt \
    && pip uninstall -y nvidia-nccl-cu12 \
    && pip cache purge \
    && find /usr/local/lib/python3.11 -type d -name "__pycache__" -exec rm -rf {} + \
    && find /usr/local/lib/python3.11 -name "*.pyc" -delete \
    && rm -rf /root/.cache

# --- Código y artefactos ML -------------------------------------------
COPY backend/app ./backend/app
COPY ml/src ./ml/src
COPY ml/trained_models ./ml/trained_models
COPY ml/data/processed ./ml/data/processed
COPY datasets/external/international_results/results.csv \
     ./datasets/external/international_results/results.csv

ENV PYTHONIOENCODING=utf-8 \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8765

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:8765/health || exit 1

CMD ["uvicorn", "app.main:app", \
     "--app-dir", "backend", \
     "--host", "0.0.0.0", \
     "--port", "8765"]
