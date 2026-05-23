"""Feature engineering para el clasificador W/D/L y los modelos de regresión.

Este módulo construye el dataset entrenable a partir de Martj42 (49k partidos
internacionales 1872-2026) con features computadas SIEMPRE con información
disponible antes de cada partido (sin data leakage).

Pipeline:
    1. Cargar partidos crudos y convertir a formato "long" (2 filas por partido).
    2. Calcular rolling stats por equipo: ventana móvil de N partidos previos.
    3. Calcular rating Elo iterativo (uno por equipo en el tiempo).
    4. Calcular H2H histórico entre los dos equipos.
    5. Calcular días de descanso desde el último partido.
    6. Hacer "wide pivot" para tener una fila por partido con features de
       ambos equipos prefijadas (team1_*, team2_*) + diferencias.
    7. Codificar tipo de torneo en grupos (mundial, eliminatoria, copa
       continental, amistoso, otro) para reducir cardinalidad.

Notas de diseño:
    - Todas las features rolling/Elo se calculan en orden cronológico estricto
      y se desplazan un partido (`.shift(1)`) para garantizar que la feature
      en el partido T solo usa información de partidos T-1, T-2, ...
    - El módulo NO filtra fechas — el usuario decide qué rango usar al
      llamar `build_match_features(min_year=1990, ...)`.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

# --- Configuración por defecto ---------------------------------------------
DEFAULT_ROLLING_WINDOWS = (5, 10)
DEFAULT_H2H_WINDOW = 10
ELO_K_FACTOR = 30.0           # estándar para fútbol internacional
ELO_INITIAL = 1500.0
ELO_HOME_ADVANTAGE = 100.0    # típico en fútbol internacional con sede del local


# --- Mapeo de torneos a grupos de importancia ------------------------------

TOURNAMENT_GROUP_MAP = {
    "fifa_world_cup": ["FIFA World Cup"],
    "world_cup_qualif": [
        "FIFA World Cup qualification",
    ],
    "continental_cup": [
        "UEFA Euro", "Copa América", "African Cup of Nations",
        "AFC Asian Cup", "Gold Cup", "CONCACAF Championship",
        "OFC Nations Cup", "CONCACAF Gold Cup",
    ],
    "continental_qualif": [
        "UEFA Euro qualification",
        "African Cup of Nations qualification",
        "AFC Asian Cup qualification",
        "CONCACAF Championship qualification",
        "Copa América qualification",
    ],
    "uefa_nations_league": ["UEFA Nations League"],
    "confederations_cup": ["FIFA Confederations Cup"],
    "friendly": ["Friendly"],
}


def _group_tournament(t: str) -> str:
    """Mapea un nombre de torneo a uno de 8 grupos predefinidos.

    Esto reduce la cardinalidad (más de 100 nombres únicos) a algo manejable
    para one-hot encoding sin explotar las dimensiones.
    """
    if pd.isna(t):
        return "other"
    for group, names in TOURNAMENT_GROUP_MAP.items():
        if t in names:
            return group
    return "other"


# ---------------------------------------------------------------------------
# Paso 1: matches "wide" → "long" (perspectiva por equipo)
# ---------------------------------------------------------------------------

def to_long_format(matches: pd.DataFrame) -> pd.DataFrame:
    """Convierte el dataset Martj42 a formato long.

    Cada partido se duplica en 2 filas: una desde la perspectiva del local y
    otra desde la del visitante. Esto facilita calcular rolling stats por
    equipo con `groupby('team')`.

    Columnas resultantes:
        date, team, opponent, is_home, neutral, goals_for, goals_against,
        result (win/draw/loss desde la perspectiva de `team`), tournament,
        match_id (índice original del partido para hacer merge wide después).
    """
    m = matches.copy().reset_index(drop=True)
    m["match_id"] = m.index

    home = m.rename(columns={
        "home_team": "team", "away_team": "opponent",
        "home_score": "goals_for", "away_score": "goals_against",
    }).assign(is_home=1)

    away = m.rename(columns={
        "away_team": "team", "home_team": "opponent",
        "away_score": "goals_for", "home_score": "goals_against",
    }).assign(is_home=0)

    long = pd.concat([home, away], ignore_index=True)
    long["result"] = np.where(
        long["goals_for"] > long["goals_against"], "win",
        np.where(long["goals_for"] < long["goals_against"], "loss", "draw"),
    )
    long["win"] = (long["result"] == "win").astype(int)
    long["draw"] = (long["result"] == "draw").astype(int)
    long["loss"] = (long["result"] == "loss").astype(int)
    long["goal_diff"] = long["goals_for"] - long["goals_against"]

    cols = ["match_id", "date", "team", "opponent", "is_home", "neutral",
            "tournament", "goals_for", "goals_against", "goal_diff",
            "result", "win", "draw", "loss"]
    return long[cols].sort_values(["team", "date"]).reset_index(drop=True)


# ---------------------------------------------------------------------------
# Paso 2: rolling stats por equipo
# ---------------------------------------------------------------------------

def add_rolling_team_stats(
    long: pd.DataFrame,
    windows: tuple[int, ...] = DEFAULT_ROLLING_WINDOWS,
) -> pd.DataFrame:
    """Calcula promedios móviles de los últimos N partidos por equipo.

    Para cada equipo y cada fila, computa el promedio de las features en sus
    últimos N partidos (excluyendo el actual con `.shift(1)`). Esto garantiza
    que las features de un partido nunca usan información del propio partido.

    Crea columnas: `roll{N}_win_rate`, `roll{N}_avg_gf`, `roll{N}_avg_ga`,
    `roll{N}_avg_gd`, `roll{N}_n_matches` (cuántos partidos previos se usaron,
    útil para filtrar muestras con poco historial).
    """
    out = long.sort_values(["team", "date"]).copy()
    grp = out.groupby("team", group_keys=False)

    for w in windows:
        # min_periods=1 permite calcular con menos de N partidos si no hay
        # suficiente historial. El shift(1) excluye el partido actual.
        for col_in, col_out in [
            ("win", f"roll{w}_win_rate"),
            ("goals_for", f"roll{w}_avg_gf"),
            ("goals_against", f"roll{w}_avg_ga"),
            ("goal_diff", f"roll{w}_avg_gd"),
        ]:
            out[col_out] = (
                grp[col_in]
                .apply(lambda s: s.shift(1).rolling(w, min_periods=1).mean())
                .reset_index(level=0, drop=True)
            )

        # Conteo de partidos previos (capped at w)
        out[f"roll{w}_n_matches"] = (
            grp["win"]
            .apply(lambda s: s.shift(1).rolling(w, min_periods=1).count())
            .reset_index(level=0, drop=True)
        )

    return out


# ---------------------------------------------------------------------------
# Paso 3: descanso (días desde el último partido)
# ---------------------------------------------------------------------------

def add_days_since_last_match(long: pd.DataFrame) -> pd.DataFrame:
    """Días entre el partido actual y el partido inmediatamente anterior del equipo.

    NaN para el primer partido histórico de cada equipo.
    """
    out = long.sort_values(["team", "date"]).copy()
    out["days_since_last_match"] = (
        out.groupby("team")["date"].diff().dt.days
    )
    return out


# ---------------------------------------------------------------------------
# Paso 4: rating Elo iterativo
# ---------------------------------------------------------------------------

def compute_elo_ratings(
    matches: pd.DataFrame,
    k: float = ELO_K_FACTOR,
    initial: float = ELO_INITIAL,
    home_advantage: float = ELO_HOME_ADVANTAGE,
) -> pd.DataFrame:
    """Calcula rating Elo iterativo para cada equipo en orden cronológico.

    Devuelve un DataFrame con dos columnas: `team1_elo_before`,
    `team2_elo_before` — los ratings antes de cada partido. El índice coincide
    con el índice del DataFrame `matches` original.

    Implementación: bucle simple sobre 49k filas (~1-2s en Python puro). Para
    fútbol internacional el rating Elo es muy informativo.
    """
    # Preservar el índice original ordenado por fecha (con secondary sort
    # por equipos para que el orden sea determinista cuando hay partidos en
    # la misma fecha; ~300 casos en Martj42)
    sorted_idx = matches.sort_values(
        ["date", "home_team", "away_team"], kind="stable"
    ).index
    m = matches.loc[sorted_idx]
    ratings: dict[str, float] = {}

    n = len(m)
    home_elo = np.empty(n)
    away_elo = np.empty(n)

    home_teams = m["home_team"].values
    away_teams = m["away_team"].values
    home_scores = m["home_score"].values
    away_scores = m["away_score"].values
    neutral = m["neutral"].values

    for i in range(n):
        h, a = home_teams[i], away_teams[i]
        rh = ratings.get(h, initial)
        ra = ratings.get(a, initial)

        home_elo[i] = rh
        away_elo[i] = ra

        # Ventaja de localía solo si no es sede neutral
        rh_adj = rh + (0 if neutral[i] else home_advantage)
        expected_home = 1.0 / (1.0 + 10 ** ((ra - rh_adj) / 400.0))

        # Resultado real desde la perspectiva del local
        gd = home_scores[i] - away_scores[i]
        if gd > 0:
            actual_home = 1.0
        elif gd < 0:
            actual_home = 0.0
        else:
            actual_home = 0.5

        # Multiplicador por margen de victoria (común en Elo de fútbol)
        margin_mult = np.log(max(abs(gd), 1) + 1)

        change = k * margin_mult * (actual_home - expected_home)
        ratings[h] = rh + change
        ratings[a] = ra - change

    # home_elo[i] corresponde al índice original sorted_idx[i]
    elo_df = pd.DataFrame({
        "team1_elo_before": home_elo,
        "team2_elo_before": away_elo,
    }, index=sorted_idx)
    return elo_df.reindex(matches.index)


# ---------------------------------------------------------------------------
# Paso 5: head-to-head (H2H)
# ---------------------------------------------------------------------------

def add_h2h_features(matches: pd.DataFrame, window: int = DEFAULT_H2H_WINDOW) -> pd.DataFrame:
    """Para cada partido, calcula el resultado promedio de los últimos N
    enfrentamientos directos entre los mismos dos equipos.

    Devuelve un DataFrame con `h2h_team1_win_rate`, `h2h_draw_rate`,
    `h2h_avg_goals_total`, `h2h_n_matches` indexado igual que `matches`.
    """
    m = matches.copy().sort_values("date").reset_index(drop=False).rename(
        columns={"index": "_orig_idx"}
    )

    # Pair canónico (sin importar quién fue local) para identificar el H2H
    pair_a = np.where(m["home_team"] < m["away_team"], m["home_team"], m["away_team"])
    pair_b = np.where(m["home_team"] < m["away_team"], m["away_team"], m["home_team"])
    m["_pair"] = pair_a + "||" + pair_b

    # Resultado desde la perspectiva del primer equipo del pair (alfabético)
    home_is_first = m["home_team"] == pair_a
    gd = m["home_score"] - m["away_score"]
    # Si home es el "primer equipo" del pair, su victoria suma 1. Si home es
    # el "segundo equipo", su victoria suma 0 desde la perspectiva del primer.
    m["_result_first"] = np.where(
        home_is_first,
        np.where(gd > 0, 1.0, np.where(gd < 0, 0.0, 0.5)),
        np.where(gd > 0, 0.0, np.where(gd < 0, 1.0, 0.5)),
    )
    m["_total_goals"] = m["home_score"] + m["away_score"]
    m["_is_draw"] = (gd == 0).astype(int)

    g = m.groupby("_pair", group_keys=False)
    m["_h2h_first_win_rate"] = g["_result_first"].apply(
        lambda s: s.shift(1).rolling(window, min_periods=1).mean()
    ).reset_index(level=0, drop=True)
    m["_h2h_draw_rate"] = g["_is_draw"].apply(
        lambda s: s.shift(1).rolling(window, min_periods=1).mean()
    ).reset_index(level=0, drop=True)
    m["_h2h_avg_goals_total"] = g["_total_goals"].apply(
        lambda s: s.shift(1).rolling(window, min_periods=1).mean()
    ).reset_index(level=0, drop=True)
    m["_h2h_n_matches"] = g["_result_first"].apply(
        lambda s: s.shift(1).rolling(window, min_periods=1).count()
    ).reset_index(level=0, drop=True)

    # Convertir "first equipo" a "team1" (home_team) para tener perspectiva
    # consistente con las otras features
    m["h2h_team1_win_rate"] = np.where(
        home_is_first, m["_h2h_first_win_rate"], 1.0 - m["_h2h_first_win_rate"]
    )
    m["h2h_draw_rate"] = m["_h2h_draw_rate"]
    m["h2h_avg_goals_total"] = m["_h2h_avg_goals_total"]
    m["h2h_n_matches"] = m["_h2h_n_matches"]

    out = m.set_index("_orig_idx")[
        ["h2h_team1_win_rate", "h2h_draw_rate", "h2h_avg_goals_total", "h2h_n_matches"]
    ].reindex(matches.index)
    return out


# ---------------------------------------------------------------------------
# Paso 6: ensamble final wide
# ---------------------------------------------------------------------------

@dataclass
class FeatureBuildConfig:
    rolling_windows: tuple[int, ...] = DEFAULT_ROLLING_WINDOWS
    h2h_window: int = DEFAULT_H2H_WINDOW
    min_year: int | None = 1990
    drop_first_n_per_team: int = 5  # descartar primeros N partidos sin historial


def build_match_features(
    matches: pd.DataFrame,
    config: FeatureBuildConfig | None = None,
) -> pd.DataFrame:
    """Construye el dataset entrenable a nivel de partido.

    Args:
        matches: DataFrame de Martj42 (`load_international_results()`).
        config: configuración opcional.

    Returns:
        DataFrame con una fila por partido, features de team1/team2 prefijadas,
        diferencias `diff_*`, features H2H, Elo y target `result`.
    """
    config = config or FeatureBuildConfig()
    m = matches.copy()

    if config.min_year is not None:
        m = m[m["date"].dt.year >= config.min_year].reset_index(drop=True)

    # Descartar partidos sin score (fixtures futuros sin resultado todavía)
    m = m.dropna(subset=["home_score", "away_score"]).reset_index(drop=True)

    long = to_long_format(m)
    long = add_rolling_team_stats(long, windows=config.rolling_windows)
    long = add_days_since_last_match(long)

    # Pivot a wide: cada partido (match_id) tiene una fila con features de
    # team1 (home) y team2 (away).
    feature_cols = [c for c in long.columns if c.startswith("roll")] + [
        "days_since_last_match",
    ]

    home_long = long[long["is_home"] == 1].set_index("match_id")[feature_cols]
    away_long = long[long["is_home"] == 0].set_index("match_id")[feature_cols]

    home_long = home_long.add_prefix("team1_")
    away_long = away_long.add_prefix("team2_")

    wide = m.copy()
    wide["match_id"] = wide.index
    wide = wide.merge(home_long, left_on="match_id", right_index=True, how="left")
    wide = wide.merge(away_long, left_on="match_id", right_index=True, how="left")

    # Features de diferencia (útiles para modelos lineales y RF)
    for w in config.rolling_windows:
        for base in ("win_rate", "avg_gf", "avg_ga", "avg_gd"):
            wide[f"diff_roll{w}_{base}"] = (
                wide[f"team1_roll{w}_{base}"] - wide[f"team2_roll{w}_{base}"]
            )

    # Elo (uno solo, no rolling)
    elo = compute_elo_ratings(m)
    wide = wide.join(elo)
    wide["diff_elo"] = wide["team1_elo_before"] - wide["team2_elo_before"]

    # H2H
    h2h = add_h2h_features(m, window=config.h2h_window)
    wide = wide.join(h2h)

    # Tipo de torneo agrupado
    wide["tournament_group"] = wide["tournament"].apply(_group_tournament)

    # Filtrar partidos donde alguno de los equipos tiene poco historial
    min_n = config.drop_first_n_per_team
    if min_n > 0 and config.rolling_windows:
        smallest_w = min(config.rolling_windows)
        wide = wide[
            (wide[f"team1_roll{smallest_w}_n_matches"] >= min_n)
            & (wide[f"team2_roll{smallest_w}_n_matches"] >= min_n)
        ].reset_index(drop=True)

    return wide


# ---------------------------------------------------------------------------
# Listado de features para alimentar modelos
# ---------------------------------------------------------------------------

def get_feature_columns(
    windows: tuple[int, ...] = DEFAULT_ROLLING_WINDOWS,
) -> list[str]:
    """Lista de columnas que un modelo de clasificación W/D/L debería usar.

    Excluye columnas crudas (team names, date, score, etc.) y el target.
    """
    cols: list[str] = []
    for w in windows:
        for base in ("win_rate", "avg_gf", "avg_ga", "avg_gd"):
            cols.append(f"team1_roll{w}_{base}")
            cols.append(f"team2_roll{w}_{base}")
            cols.append(f"diff_roll{w}_{base}")
    cols += [
        "team1_days_since_last_match", "team2_days_since_last_match",
        "team1_elo_before", "team2_elo_before", "diff_elo",
        "h2h_team1_win_rate", "h2h_draw_rate", "h2h_avg_goals_total",
        "h2h_n_matches",
        "neutral",
    ]
    return cols
