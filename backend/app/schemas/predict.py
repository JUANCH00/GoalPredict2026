"""Schemas Pydantic para endpoints de predicción."""

from __future__ import annotations

from pydantic import BaseModel, Field


class MatchRequest(BaseModel):
    """Request para predecir un partido entre dos selecciones."""
    team1: str = Field(..., description="Nombre de la selección local", examples=["Argentina"])
    team2: str = Field(..., description="Nombre de la selección visitante", examples=["Brazil"])
    neutral: bool = Field(False, description="¿La sede es neutral?")


# --- Capa gratuita ---

class ResultProbabilities(BaseModel):
    home_win: float = Field(..., ge=0, le=1, description="P(victoria del team1)")
    draw: float = Field(..., ge=0, le=1, description="P(empate)")
    away_win: float = Field(..., ge=0, le=1, description="P(victoria del team2)")


class HeadToHeadEntry(BaseModel):
    date: str
    home_team: str
    away_team: str
    home_score: int
    away_score: int
    tournament: str


class TeamSummary(BaseModel):
    name: str
    cluster_label: str | None = None
    avg_goals_for: float | None = None
    avg_goals_against: float | None = None
    win_rate: float | None = None
    n_recent_matches: int | None = None


class FreePrediction(BaseModel):
    team1: TeamSummary
    team2: TeamSummary
    probabilities: ResultProbabilities
    head_to_head_recent: list[HeadToHeadEntry] = Field(
        default_factory=list,
        description="Últimos 10 enfrentamientos directos",
    )
    model_info: dict = Field(default_factory=dict)


# --- Capa premium ---

class GoalsByHalfPrediction(BaseModel):
    """Goles esperados por tiempo para cada equipo."""
    team1_first_half: float
    team1_second_half: float
    team2_first_half: float
    team2_second_half: float


class CardsPrediction(BaseModel):
    """Tarjetas amarillas esperadas y probabilidad de roja por equipo."""
    team1_expected_yellow: float
    team2_expected_yellow: float
    team1_red_card_probability: float
    team2_red_card_probability: float


class MatchStatsPrediction(BaseModel):
    """Stats agregadas esperadas por equipo (basadas en WC2022)."""
    team1_possession: float
    team2_possession: float
    team1_corners: float
    team2_corners: float
    team1_fouls: float
    team2_fouls: float
    team1_attempts: float
    team2_attempts: float
    team1_on_target: float
    team2_on_target: float


class PremiumPrediction(BaseModel):
    """Predicción completa para usuarios premium."""
    team1: TeamSummary
    team2: TeamSummary
    probabilities: ResultProbabilities
    head_to_head_recent: list[HeadToHeadEntry] = Field(default_factory=list)

    # Goles
    expected_total_goals: float
    over_2_5_probability: float
    goals_by_half: GoalsByHalfPrediction

    # Disciplina
    cards: CardsPrediction

    # Stats avanzadas
    match_stats: MatchStatsPrediction

    model_info: dict = Field(default_factory=dict)
