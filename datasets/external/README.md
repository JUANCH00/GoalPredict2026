# Datasets externos

Esta carpeta contiene los datasets de Kaggle **adicionales** al dataset Fjelstul (que ya está en `datasets/` raíz). Estos archivos NO se versionan en git por su tamaño.

## Cómo descargar

### Opción A — Manual (navegador)
1. Ir a cada URL de abajo, hacer login en Kaggle.
2. Hacer click en **Download** → descomprimir el `.zip`.
3. Copiar los archivos indicados a la subcarpeta correspondiente.

### Opción B — Kaggle CLI (recomendado)
```bash
pip install kaggle
# Poner tu kaggle.json en ~/.kaggle/ (Linux/Mac) o %USERPROFILE%\.kaggle\ (Windows)

# Descargar los 3 datasets:
kaggle datasets download -d martj42/international-football-results-from-1872-to-2017 -p datasets/external/international_results --unzip
kaggle datasets download -d die9origephit/fifa-world-cup-2022-complete-dataset -p datasets/external/wc2022 --unzip
kaggle datasets download -d hugomathien/soccer -p datasets/external/european_soccer --unzip
```

---

## Datasets requeridos

### 1. `international_results/` — Martj42 (**prioridad alta**)
- **URL**: https://www.kaggle.com/datasets/martj42/international-football-results-from-1872-to-2017
- **Por qué**: 47.000+ partidos internacionales (amistosos, eliminatorias, copas regionales, Mundiales). Es el corpus principal para entrenar el clasificador W/D/L.
- **Archivos clave**:
  - `results.csv` — `date, home_team, away_team, home_score, away_score, tournament, city, country, neutral`
  - `goalscorers.csv` — anotador por partido (útil para identificar máximos goleadores históricos)
  - `shootouts.csv` — desempates por penales

### 2. `wc2022/` — Die9origephit (**prioridad alta**)
- **URL**: https://www.kaggle.com/datasets/die9origephit/fifa-world-cup-2022-complete-dataset
- **Por qué**: cubre el Mundial 2022 (Fjelstul corta en 2018) e incluye **estadísticas avanzadas** que Fjelstul no tiene: posesión, tiros, tiros a puerta, faltas, fueras de juego, tiros de esquina, tarjetas detalladas.
- **Archivos clave**:
  - `Fifa_world_cup_matches.csv` — uno por partido con todas las stats avanzadas
  - `group_stats.csv`, `team_data.csv` — agregados por equipo

### 3. `european_soccer/` — Hugomathien (**prioridad media**)
- **URL**: https://www.kaggle.com/datasets/hugomathien/soccer
- **Por qué**: 25.000+ partidos de ligas europeas (2008-2016) con stats detalladas y ratings de FIFA. Útil para enriquecer modelos de regresión (corners, posesión, goles por tiempo).
- **Archivo clave**: `database.sqlite` (~300MB) — base SQLite con tablas `Match`, `Team`, `Player`, `Team_Attributes`, etc.
- **⚠️ Cuidado**: es pesado. Si tu plan de despliegue gratuito es limitado, puedes exportar solo las columnas necesarias a CSV y descartar el resto.

---

## Estructura final esperada

Una vez descargados, la carpeta debería verse así:

```
datasets/external/
├── README.md                    ← este archivo
├── international_results/
│   ├── results.csv
│   ├── goalscorers.csv
│   └── shootouts.csv
├── wc2022/
│   ├── Fifa_world_cup_matches.csv
│   ├── group_stats.csv
│   └── team_data.csv
└── european_soccer/
    └── database.sqlite
```

## Notas de licencia

- **Fjelstul WC DB**: CC-BY-SA 4.0. © 2022 Joshua C. Fjelstul, Ph.D. Atribución requerida.
- **Martj42, Die9origephit, Hugomathien**: ver términos en sus páginas Kaggle.
