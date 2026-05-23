# syntax=docker/dockerfile:1.6
#
# Dockerfile del backend FastAPI de GoalPredict 2026.
#
# Estrategia:
#   - Imagen base python:3.11-slim (xgboost necesita libgomp1).
#   - Layer separado para requirements (cache de build).
#   - Copiamos solo lo que el backend lee en runtime: código + ml/src/ +
#     trained_models + match_features.csv + results.csv (Martj42).
#
# Build context = raíz del repo. Construir desde la raíz con:
#   docker build -f backend/Dockerfile -t goalpredict-backend .
# o vía docker compose (recomendado).

FROM python:3.11-slim AS runtime

# Dependencias de sistema para xgboost (libgomp1) + curl para healthcheck
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Capa de dependencias: cambia poco, mejor cacheada por separado del código.
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Código del backend
COPY backend/app ./backend/app

# Artefactos del pipeline ML que el backend lee en runtime
COPY ml/src ./ml/src
COPY ml/trained_models ./ml/trained_models
COPY ml/data/processed ./ml/data/processed

# Solo el CSV de Martj42 que necesita FeatureBuilder para H2H.
# Si en el futuro el backend necesita más datasets, agregarlos aquí.
COPY datasets/external/international_results/results.csv \
     ./datasets/external/international_results/results.csv

# Encoding UTF-8 para que prints con tildes no exploten (problema en Windows)
ENV PYTHONIOENCODING=utf-8 \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8765

# Healthcheck para que compose sepa cuándo el server está listo.
# Uvicorn tarda ~3-5s en cargar los 9 .pkl al startup.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:8765/health || exit 1

CMD ["uvicorn", "app.main:app", \
     "--app-dir", "backend", \
     "--host", "0.0.0.0", \
     "--port", "8765"]
