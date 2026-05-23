from .loaders import (
    FjelstulLoader,
    DATASETS_DIR,
    EXTERNAL_DIR,
    # Fjelstul
    load_matches,
    load_team_appearances,
    load_goals,
    load_bookings,
    load_teams,
    load_tournaments,
    load_substitutions,
    load_penalty_kicks,
    load_tournament_standings,
    # Martj42
    load_international_results,
    load_upcoming_fixtures,
    load_goalscorers,
    load_shootouts,
    load_former_team_names,
    # Die9origephit
    load_wc2022_matches,
    # Hugomathien
    european_soccer_connection,
    query_european_soccer,
)

__all__ = [
    "FjelstulLoader",
    "DATASETS_DIR",
    "EXTERNAL_DIR",
    "load_matches",
    "load_team_appearances",
    "load_goals",
    "load_bookings",
    "load_teams",
    "load_tournaments",
    "load_substitutions",
    "load_penalty_kicks",
    "load_tournament_standings",
    "load_international_results",
    "load_upcoming_fixtures",
    "load_goalscorers",
    "load_shootouts",
    "load_former_team_names",
    "load_wc2022_matches",
    "european_soccer_connection",
    "query_european_soccer",
]
