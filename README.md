# GoalPredict 2026

Plataforma web de predicción deportiva con Machine Learning aplicada al Mundial de Fútbol FIFA 2026.

Proyecto académico — Electiva Machine Learning Aplicado, UPTC, Facultad de Ingeniería, Ingeniería de Sistemas y Computación.

**Autores**: Juan Esteban Moreno Gamboa, David Santiago Naranjo Corredor
**Docente**: Viviana Alexandra Villanueva Cipagauta

---

## Estructura del repositorio

```
Proyecto/
├── README.md                       Este archivo
├── propuesta_ml_mundial2026.pdf    Propuesta original del proyecto
├── datasets/                       Datos crudos (CSV de Kaggle)
│   ├── *.csv                       Fjelstul World Cup DB (1930-2018)
│   └── external/                   Datasets adicionales (Martj42, Die9origephit, ...)
├── ml/                             Pipeline de Machine Learning
│   ├── notebooks/                  EDA, feature engineering, modelado (Jupyter)
│   ├── src/                        Código reusable (loaders, features, models, eval)
│   ├── data/processed/             Datasets limpios y features generados
│   └── trained_models/             Modelos .pkl listos para servir
├── backend/                        API REST con FastAPI
│   ├── app/
│   │   ├── api/routes/             Endpoints: /predict, /teams, /history
│   │   ├── core/                   Config, seguridad (JWT)
│   │   ├── models/                 Carga de modelos ML
│   │   ├── schemas/                Modelos Pydantic
│   │   └── services/               Lógica de predicción
│   └── tests/
└── frontend/                       SPA en React + Tailwind
    └── src/
        ├── components/             TeamSelector, PredictionCard, ...
        ├── pages/                  Free, Premium, Login
        ├── services/api.ts         Cliente HTTP del backend
        ├── hooks/
        └── types/
```

## Stack tecnológico

| Capa | Tecnologías |
|---|---|
| Datos | CSVs de Kaggle, PostgreSQL, Pandas/NumPy |
| ML | scikit-learn, XGBoost, LightGBM |
| Backend | Python 3.10+, FastAPI, JWT |
| Frontend | React.js, Tailwind CSS, Chart.js / Recharts |
| Infra | Docker, Docker Compose |
| Despliegue | Render / Railway / Vercel |

## Modelos a entrenar

### Capa gratuita (Clasificación)
- Resultado del partido: **Victoria / Empate / Derrota** (clasificación multiclase)
- Algoritmos: Random Forest, XGBoost, Regresión Logística Multinomial

### Capa premium (Regresión + Clasificación)
- Goles esperados (primer tiempo, segundo tiempo, total)
- Tarjetas amarillas y rojas por equipo
- Tiros de esquina por equipo
- Posesión del balón (%)
- Over/Under 2.5 goles
- Algoritmos: Random Forest Regressor, Gradient Boosting (XGBoost/LightGBM)

### Análisis no supervisado
- Clustering de selecciones por estilo de juego (K-Means)

## Cómo arrancar

> **Pre-requisito**: descargar los datasets faltantes. Ver [datasets/external/README.md](datasets/external/README.md).

```bash
# 1. Crear entorno virtual e instalar dependencias de ML
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r ml/requirements.txt

# 2. Abrir el notebook de EDA
jupyter notebook ml/notebooks/01_eda.ipynb
```

## Metodología

Se sigue **CRISP-DM** (Cross-Industry Standard Process for Data Mining):
1. Comprensión del negocio
2. Comprensión de los datos (EDA)
3. Preparación de los datos
4. Modelado
5. Evaluación
6. Despliegue

## Referencias

- Fjelstul, J. C. (2022). *World Cup Database*. https://www.kaggle.com/datasets/joshfjelstul/world-cup-database
- Martj42 (2024). *International Football Results 1872-2024*. https://www.kaggle.com/datasets/martj42/international-football-results-from-1872-to-2017
- Hugomathien (2016). *European Soccer Database*. https://www.kaggle.com/datasets/hugomathien/soccer
- Die9origephit (2022). *FIFA World Cup 2022 Complete Dataset*. https://www.kaggle.com/datasets/die9origephit/fifa-world-cup-2022-complete-dataset
- Piterfm (2023). *FIFA Football World Cup Dataset (1930-2022)*. https://www.kaggle.com/datasets/piterfm/fifa-football-world-cup
