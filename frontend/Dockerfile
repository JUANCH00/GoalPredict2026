# syntax=docker/dockerfile:1.6
#
# Dockerfile del frontend React de GoalPredict 2026.
#
# Multi-stage:
#   1) builder — Node 22 alpine compila la SPA con Vite.
#   2) runtime — nginx:alpine sirve los estáticos + hace reverse proxy
#      de /api/* al servicio `backend` de docker-compose.
#
# Build context = raíz del repo (para que la ruta sea consistente con el
# backend). Construir vía docker compose.

# --- Stage 1: build ----------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /build

# Capa de deps separada para mejor caching: solo se invalida si cambia
# package.json o package-lock.json.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Resto del código del frontend
COPY frontend/ ./

# tsc -b && vite build → output en /build/dist/
RUN npm run build

# --- Stage 2: runtime --------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Config personalizada (SPA fallback + reverse proxy a backend:8765)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Estáticos compilados
COPY --from=builder /build/dist /usr/share/nginx/html

EXPOSE 80

# Healthcheck — usamos /healthz (definido en nginx.conf)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://localhost/healthz || exit 1

# nginx:alpine ya tiene CMD ["nginx", "-g", "daemon off;"]
