# GoalPredict 2026

Plataforma web de predicción deportiva con Machine Learning aplicada al Mundial de Fútbol FIFA 2026.

Proyecto académico — Electiva *Machine Learning Aplicado*, UPTC, Facultad de Ingeniería, Ingeniería de Sistemas y Computación.

- **Autores**: Juan Esteban Moreno Gamboa · David Santiago Naranjo Corredor
- **Docente**: Viviana Alexandra Villanueva Cipagauta
- **Propuesta original**: [`propuesta_ml_mundial2026.pdf`](propuesta_ml_mundial2026.pdf)

---

## Qué es

El usuario abre la SPA, elige dos selecciones del Mundial 2026 y recibe la probabilidad de victoria, empate o derrota — calculada por un ensemble entrenado con 49.000+ partidos internacionales. Si está logueado con una cuenta Premium, también obtiene goles esperados por tiempo, tarjetas, corners, posesión y comparativa de estilo.

El diseño es editorial: tipografía Geist + Instrument Serif, paleta cálida (cream + ink + naranja), datos en mono con tabular nums. Los identificadores de equipo son marcas abstractas (bandas de colores nacionales + código de 3 letras), no banderas reales.

## Stack

| Capa | Tecnologías |
|---|---|
| Datos | 4 datasets de Kaggle (49k+ partidos), PostgreSQL 16, Pandas/NumPy |
| ML | scikit-learn, XGBoost (clasificador + regresores), K-Means clustering |
| Backend | Python 3.11, FastAPI, SQLAlchemy 2.0, JWT (python-jose), bcrypt |
| Frontend | React 18, TypeScript, Vite 5, React Router 6, CSS variables (sin Tailwind) |
| Infra | Docker Compose (3 servicios), Nginx 1.27 con reverse proxy |
| Datos en memoria | 49k+ partidos internacionales (Martj42) + 9 modelos `.pkl` cargados al startup |

## Cómo arrancar

### Opción A — Docker (recomendado)

Requiere Docker Desktop o Docker Engine + Compose.

```bash
cp .env.example .env
docker compose up --build
```

Esto levanta tres servicios:
- `db` (postgres:16-alpine, puerto 5432) con volumen persistente
- `backend` (FastAPI, puerto 8765) con healthcheck `/health`
- `frontend` (nginx, puerto 8080) sirviendo la SPA y proxeando `/api/*` al backend

Abre **http://localhost:8080** y entra con uno de los usuarios demo (ver más abajo).

> Si cambias `POSTGRES_PASSWORD` o `DATABASE_URL` después del primer arranque, corre `docker compose down -v` para reinicializar el volumen. Ver [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md).

### Opción B — Dev local (hot reload)

Útil cuando estás iterando código.

```bash
# Terminal 1 — backend con SQLite local (sin docker)
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r backend/requirements.txt
$env:DATABASE_URL = "sqlite:///backend/goalpredict.sqlite"   # PowerShell
python -m uvicorn app.main:app --app-dir backend --port 8765 --reload

# Terminal 2 — frontend Vite
cd frontend
npm install
npm run dev
```

Abre **http://localhost:5173**. Vite proxea `/api/*` al backend en 8765.

### Opción C — Pipeline de ML (re-entrenar)

Si quieres correr los notebooks o re-entrenar los modelos:

```bash
pip install -r ml/requirements.txt
jupyter notebook ml/notebooks/01_eda.ipynb
```

Los 5 notebooks van en orden: `01_eda` → `02_feature_engineering` → `03_classification_model` → `04_regression_models` → `05_clustering`. Los artefactos se guardan en `ml/trained_models/`. Antes de correrlos, descarga los datasets faltantes según [`datasets/external/README.md`](datasets/external/README.md).

## Usuarios demo

Se siembran automáticamente al primer arranque del backend si la tabla `users` está vacía:

| Usuario | Contraseña | Tier |
|---|---|---|
| `free_user` | `free123` | free |
| `premium_user` | `premium123` | premium |

También puedes registrar un usuario nuevo con `POST /api/v1/auth/register` o desde el formulario de la SPA en `/login`. Para esta demo el `tier` lo elige el cliente en el registro (en producción `premium` requeriría un pago).

## Endpoints del API

Todos bajo el prefijo `/api/v1`.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET  | `/health` | — | Healthcheck |
| POST | `/auth/register` | — | Crear usuario (201 / 409 / 422) |
| POST | `/auth/login` | — | Login con form `username`+`password`, devuelve JWT |
| GET  | `/auth/me` | Bearer | Info del usuario actual |
| GET  | `/teams` | — | Lista de selecciones con cluster + stats |
| GET  | `/teams/{name}` | — | Perfil de una selección |
| POST | `/predict/result` | — | Probabilidades W/D/L + H2H (free) |
| POST | `/predict/stats` | Bearer + tier=premium | Predicción completa premium |
| GET  | `/history/{a}/vs/{b}` | — | Últimos N enfrentamientos directos |

Docs interactivos en **http://localhost:8765/docs** cuando el backend está corriendo.

## Resultados del modelo (honestos)

Test sobre partidos desde 2018 (7.897 partidos), entrenado sobre Martj42 1990+ con 34 features (Elo iterativo + rolling stats + H2H + descanso + tipo de torneo):

| Modelo | Accuracy | F1 macro | Log-loss |
|---|---:|---:|---:|
| Baseline (clase mayoritaria) | 0.475 | 0.215 | — |
| Baseline (regla Elo > 50) | 0.572 | 0.516 | — |
| Regresión Logística balanced | 0.566 | 0.526 | 0.897 |
| Random Forest balanced | 0.572 | 0.518 | 0.904 |
| **XGBoost regularizado + balanced** ✓ | 0.568 | **0.526** | 0.900 |

El XGBoost sin class balancing daba mejor accuracy bruta (0.593) pero predecía empates solo en 5% de los casos reales — inaceptable para una UI que muestra las 3 probabilidades. La versión balanced mantiene la predicción distribuida.

## Estructura del repositorio

```
Proyecto/
├── README.md                          Este archivo
├── TROUBLESHOOTING.md                 Errores comunes y cómo recuperarse
├── docker-compose.yml                 db + backend + frontend
├── .env.example                       Plantilla (copiar a .env)
├── .dockerignore  .gitignore
├── propuesta_ml_mundial2026.pdf       Propuesta original del proyecto
│
├── datasets/                          CSVs de Kaggle
│   ├── *.csv                          Fjelstul World Cup DB (1930-2018, 27 archivos)
│   └── external/                      Datasets adicionales descargados
│       ├── international_results/     Martj42 (49.287 partidos)
│       ├── wc2022/                    Die9origephit (Mundial 2022 con stats avanzadas)
│       └── european_soccer/           Hugomathien (SQLite)
│
├── ml/                                Pipeline de Machine Learning
│   ├── requirements.txt
│   ├── notebooks/                     5 notebooks en orden
│   ├── src/
│   │   ├── data/loaders.py            Carga centralizada de los 4 datasets
│   │   ├── features/feature_engineering.py   Elo + rolling + H2H + descanso
│   │   └── models/baselines.py        TeamAveragePredictor (pickleable)
│   ├── data/processed/                match_features.csv, team_profiles.csv
│   └── trained_models/                9 .pkl entrenados
│
├── backend/                           API REST con FastAPI
│   ├── Dockerfile                     Optimizado, 1.03 GB (sin nvidia-nccl-cu12)
│   ├── requirements.txt
│   └── app/
│       ├── main.py                    Lifespan + CORS + routes
│       ├── core/                      config.py (settings via env), security.py (JWT + bcrypt)
│       ├── db/                        SQLAlchemy session, models, init_db con retry
│       ├── api/routes/                auth, teams, predict, history
│       ├── schemas/                   Pydantic
│       └── services/                  model_loader, feature_builder, prediction_service
│
└── frontend/                          SPA en React + TypeScript
    ├── Dockerfile                     Multi-stage (node:22 build → nginx:1.27 serve), 74 MB
    ├── nginx.conf                     SPA fallback + reverse proxy /api/* → backend:8765
    ├── package.json                   React + React Router (sin Tailwind ni Recharts)
    └── src/
        ├── main.tsx  App.tsx  index.css   tokens editoriales + utilidades
        ├── components/
        │   ├── Header.tsx  Footer.tsx
        │   ├── TeamPicker.tsx
        │   └── design/                TeamMark, ProbBar, VsBar, Donut, AnimatedNumber, PremiumLock, Icons
        ├── pages/                     HomePage, PredictionPage, LoginPage, TeamsPage, PricingPage
        ├── data/                      teams.ts (48 selecciones + colores), fixtures.ts
        ├── services/api.ts            Cliente HTTP tipado del backend
        ├── hooks/                     useTeams
        ├── context/                   AuthContext (JWT en localStorage)
        └── types/api.ts               Mirror de los schemas Pydantic
```

## Limitaciones conocidas

- **Modelos Fjelstul con poco volumen** (~1.4k muestras): los regresores de goles 1T/2T y tarjetas amarillas tienen R² ≤ 0, así que para esos targets persistimos `DummyRegressor` (predice la media histórica). Esto es honesto: con tan pocos datos, el promedio es la mejor predicción posible.
- **Stats avanzadas WC2022** (corners, posesión, faltas, intentos) usan baselines tipo `TeamAveragePredictor` sobre 64 partidos. No es ML real — son promedios por equipo del Mundial 2022. En el backend se mostraban como heurísticas con copy claro.
- **Goles por tiempo en el endpoint premium** usan un reparto 44%/56% sobre el total predicho (proporción histórica Fjelstul) en vez del modelo Fjelstul directo, porque el `FeatureBuilder` actual produce features Martj42, no Fjelstul. Mejora futura: añadir un `FjelstulFeatureBuilder`.
- **Imagen del backend (~1 GB)**: optimizada quitando `nvidia-nccl-cu12`. Más reducción requeriría multi-stage build con un runtime aún más mínimo.

## Documentación adicional

- [`propuesta_ml_mundial2026.pdf`](propuesta_ml_mundial2026.pdf) — propuesta original del proyecto académico
- [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) — errores comunes con Docker + soluciones
- [`datasets/external/README.md`](datasets/external/README.md) — instrucciones para descargar los datasets de Kaggle
- [`.env.example`](.env.example) — plantilla de variables de entorno

## Referencias

- Fjelstul, J. C. (2022). *World Cup Database*. https://www.kaggle.com/datasets/joshfjelstul/world-cup-database
- Martj42 (2024). *International Football Results 1872-2024*. https://www.kaggle.com/datasets/martj42/international-football-results-from-1872-to-2017
- Hugomathien (2016). *European Soccer Database*. https://www.kaggle.com/datasets/hugomathien/soccer
- Die9origephit (2022). *FIFA World Cup 2022 Complete Dataset*. https://www.kaggle.com/datasets/die9origephit/fifa-world-cup-2022-complete-dataset

---

Las predicciones son estimaciones probabilísticas basadas en datos históricos. No constituyen recomendación de apuesta.