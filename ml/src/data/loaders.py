"""Loaders para los datasets del proyecto GoalPredict 2026.

Estos loaders devuelven DataFrames de pandas con dtypes apropiados y son la
única entrada al pipeline de ML. Cualquier notebook o script debe usar estas
funciones en vez de leer CSVs a mano — esto centraliza casteos y rutas.
"""

from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import pandas as pd

# Raíz del repo: ml/src/data/loaders.py -> subir 3 niveles
REPO_ROOT = Path(__file__).resolve().parents[3]
DATASETS_DIR = REPO_ROOT / "datasets"
EXTERNAL_DIR = DATASETS_DIR / "external"


# ---------------------------------------------------------------------------
# Fjelstul World Cup Database (1930-2018)
# ---------------------------------------------------------------------------

# Mapa de nombres de tabla -> dtype overrides cuando pandas no acierta solo.
# Para la mayoría dejamos inferencia automática.
_FJELSTUL_DATE_COLS = {
    "matches": ["match_date"],
    "team_appearances": ["match_date"],
    "goals": ["match_date"],
    "bookings": ["match_date"],
    "substitutions": ["match_date"],
    "penalty_kicks": ["match_date"],
    "manager_appearances": ["match_date"],
    "referee_appearances": ["match_date"],
    "tournaments": ["start_date", "end_date"],
    "tournament_stages": ["start_date", "end_date"],
    "players": ["birth_date"],
}


@lru_cache(maxsize=None)
def _read_fjelstul_csv(name: str) -> pd.DataFrame:
    """Lee un CSV de Fjelstul (cacheado en memoria por nombre)."""
    path = DATASETS_DIR / f"{name}.csv"
    if not path.exists():
        raise FileNotFoundError(
            f"No encontré {path}. Verifica que los CSVs de Fjelstul "
            f"estén en {DATASETS_DIR}/"
        )
    date_cols = _FJELSTUL_DATE_COLS.get(name)
    df = pd.read_csv(path, parse_dates=date_cols)
    return df


def load_matches() -> pd.DataFrame:
    """900 partidos de Mundial 1930-2018, uno por fila."""
    return _read_fjelstul_csv("matches")


def load_team_appearances() -> pd.DataFrame:
    """1800 filas: dos por partido (perspectiva de cada equipo).

    Es el formato más útil para construir features rolling por selección, ya
    que cada fila tiene `team_id`, `opponent_id`, `goals_for`, `goals_against`,
    `result` (win/lose/draw).
    """
    return _read_fjelstul_csv("team_appearances")


def load_goals() -> pd.DataFrame:
    """2548 goles individuales con `minute_regulation` y `match_period`.

    Útil para construir agregados de goles por tiempo (1T vs 2T) para el
    modelo de regresión de la capa premium.
    """
    return _read_fjelstul_csv("goals")


def load_bookings() -> pd.DataFrame:
    """2466 amonestaciones con flags `yellow_card`, `red_card`, `second_yellow_card`."""
    return _read_fjelstul_csv("bookings")


def load_teams() -> pd.DataFrame:
    """84 selecciones que han participado en Mundiales con metadata de confederación."""
    return _read_fjelstul_csv("teams")


def load_tournaments() -> pd.DataFrame:
    """21 ediciones del Mundial (1930-2018) con país anfitrión y ganador."""
    return _read_fjelstul_csv("tournaments")


def load_substitutions() -> pd.DataFrame:
    return _read_fjelstul_csv("substitutions")


def load_penalty_kicks() -> pd.DataFrame:
    return _read_fjelstul_csv("penalty_kicks")


def load_tournament_standings() -> pd.DataFrame:
    return _read_fjelstul_csv("tournament_standings")


@dataclass
class FjelstulLoader:
    """Fachada conveniente para cargar todo el dataset Fjelstul de una vez.

    Uso típico:
        >>> data = FjelstulLoader.load_all()
        >>> data.matches.shape
        (900, 37)
    """

    matches: pd.DataFrame
    team_appearances: pd.DataFrame
    goals: pd.DataFrame
    bookings: pd.DataFrame
    teams: pd.DataFrame
    tournaments: pd.DataFrame
    substitutions: pd.DataFrame
    penalty_kicks: pd.DataFrame
    tournament_standings: pd.DataFrame

    @classmethod
    def load_all(cls) -> "FjelstulLoader":
        return cls(
            matches=load_matches(),
            team_appearances=load_team_appearances(),
            goals=load_goals(),
            bookings=load_bookings(),
            teams=load_teams(),
            tournaments=load_tournaments(),
            substitutions=load_substitutions(),
            penalty_kicks=load_penalty_kicks(),
            tournament_standings=load_tournament_standings(),
        )


# ---------------------------------------------------------------------------
# Datasets externos (descarga manual desde Kaggle, ver datasets/external/README.md)
# ---------------------------------------------------------------------------


# --- Martj42: International Football Results -------------------------------

@lru_cache(maxsize=None)
def load_international_results() -> pd.DataFrame:
    """International Football Results 1872-2026 (Martj42).

    ~49.000 partidos internacionales (amistosos, eliminatorias, copas regionales,
    Mundiales). Es el corpus principal para entrenar el clasificador W/D/L.

    Columnas: date, home_team, away_team, home_score, away_score, tournament,
              city, country, neutral.

    Agrega `result` ∈ {'home_win','draw','away_win'} para facilitar el target.
    """
    path = EXTERNAL_DIR / "international_results" / "results.csv"
    if not path.exists():
        raise FileNotFoundError(
            f"No encontré {path}. Descarga desde Kaggle (martj42/"
            f"international-football-results-from-1872-to-2017) y "
            f"descomprime en {EXTERNAL_DIR}/international_results/"
        )
    df = pd.read_csv(path, parse_dates=["date"])
    # result solo se calcula donde haya scores; partidos sin score corresponden
    # a fixtures futuros (ej. Mundial 2026 aún no jugado al momento del dataset)
    diff = df["home_score"] - df["away_score"]
    df["result"] = pd.cut(
        diff,
        bins=[-float("inf"), -0.5, 0.5, float("inf")],
        labels=["away_win", "draw", "home_win"],
    )
    df["result"] = df["result"].astype("object").where(diff.notna(), other=pd.NA)
    return df


def load_upcoming_fixtures() -> pd.DataFrame:
    """Partidos sin resultado todavía (fixtures futuros, ej. Mundial 2026)."""
    df = load_international_results()
    return df[df["home_score"].isna()].drop(columns=["result"]).reset_index(drop=True)


@lru_cache(maxsize=None)
def load_goalscorers() -> pd.DataFrame:
    """Goleadores por partido (Martj42). Útil para identificar máximos artilleros."""
    path = EXTERNAL_DIR / "international_results" / "goalscorers.csv"
    if not path.exists():
        raise FileNotFoundError(f"No encontré {path}.")
    return pd.read_csv(path, parse_dates=["date"])


@lru_cache(maxsize=None)
def load_shootouts() -> pd.DataFrame:
    """Desempates por penales (Martj42)."""
    path = EXTERNAL_DIR / "international_results" / "shootouts.csv"
    if not path.exists():
        raise FileNotFoundError(f"No encontré {path}.")
    return pd.read_csv(path, parse_dates=["date"])


@lru_cache(maxsize=None)
def load_former_team_names() -> pd.DataFrame:
    """Mapeo de nombres antiguos de selecciones (Martj42).

    Crítico para normalizar nombres entre datasets: por ejemplo, "Soviet Union"
    en Fjelstul vs "Russia" en Martj42 reciente.
    """
    path = EXTERNAL_DIR / "international_results" / "former_names.csv"
    if not path.exists():
        raise FileNotFoundError(f"No encontré {path}.")
    return pd.read_csv(path, parse_dates=["start_date", "end_date"])


# --- Die9origephit: FIFA World Cup 2022 ------------------------------------

# Mapa de renombres para columnas con problemas de formato en el CSV original.
# El usuario detectó: dobles espacios, espacios faltantes, inconsistencias.
_WC2022_RENAMES = {
    "attempts inside the penalty area  team2": "attempts inside the penalty area team2",
    "attempts outside the penalty area  team1": "attempts outside the penalty area team1",
    "attempts outside the penalty area  team2": "attempts outside the penalty area team2",
    "completed line breaksteam1": "completed line breaks team1",
    "completed defensive line breaksteam1": "completed defensive line breaks team1",
}


def _parse_percentage(value):
    """Convierte '42%' -> 42.0; deja NaN si no se puede."""
    if pd.isna(value):
        return float("nan")
    s = str(value).strip().rstrip("%")
    try:
        return float(s)
    except ValueError:
        return float("nan")


@lru_cache(maxsize=None)
def load_wc2022_matches() -> pd.DataFrame:
    """FIFA World Cup 2022 con stats avanzadas (Die9origephit).

    64 partidos × 88 columnas. Incluye posesión, intentos (totales, on/off
    target, dentro/fuera del área), tarjetas, faltas, offsides, pases, crosses,
    corners, tiros libres, penales, etc. — features que **no** existen en
    Fjelstul.

    Normalizaciones aplicadas:
      - Espacios dobles y nombres pegados en columnas (ver _WC2022_RENAMES).
      - Snake_case en todas las columnas.
      - Posesión `'42%'` → float `42.0`.
      - `date` parseada a datetime.
    """
    path = EXTERNAL_DIR / "wc2022" / "Fifa_world_cup_matches.csv"
    if not path.exists():
        raise FileNotFoundError(
            f"No encontré {path}. Descarga desde Kaggle "
            f"(die9origephit/fifa-world-cup-2022-complete-dataset)."
        )
    df = pd.read_csv(path)

    df = df.rename(columns=_WC2022_RENAMES)
    df.columns = [c.strip().replace(" ", "_").lower() for c in df.columns]

    for col in ("possession_team1", "possession_team2", "possession_in_contest"):
        if col in df.columns:
            df[col] = df[col].apply(_parse_percentage)

    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], format="mixed", errors="coerce")

    return df


# --- Hugomathien: European Soccer Database (SQLite) ------------------------

@lru_cache(maxsize=None)
def european_soccer_connection():
    """Devuelve una conexión SQLite a la European Soccer Database.

    Tablas disponibles: Match (25.979), Player (11.060), Player_Attributes
    (183.978), Team (299), Team_Attributes (1.458), League (11), Country (11).

    La conexión se cachea para no abrir el archivo varias veces.
    """
    import sqlite3

    path = EXTERNAL_DIR / "european_soccer" / "database.sqlite"
    if not path.exists():
        raise FileNotFoundError(
            f"No encontré {path}. Descarga desde Kaggle (hugomathien/soccer)."
        )
    return sqlite3.connect(str(path))


def query_european_soccer(sql: str) -> pd.DataFrame:
    """Ejecuta una consulta SQL contra la European Soccer DB y devuelve un DataFrame."""
    return pd.read_sql(sql, european_soccer_connection())
