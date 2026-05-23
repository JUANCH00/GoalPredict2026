// Tipos espejo de los schemas Pydantic del backend.
// Si cambias los schemas en backend/app/schemas/*, actualiza estos tipos.

export interface MatchRequest {
  team1: string;
  team2: string;
  neutral?: boolean;
}

export interface ResultProbabilities {
  home_win: number;
  draw: number;
  away_win: number;
}

export interface HeadToHeadEntry {
  date: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  tournament: string;
}

export interface TeamSummary {
  name: string;
  cluster_label?: string | null;
  avg_goals_for?: number | null;
  avg_goals_against?: number | null;
  win_rate?: number | null;
  n_recent_matches?: number | null;
}

export interface FreePrediction {
  team1: TeamSummary;
  team2: TeamSummary;
  probabilities: ResultProbabilities;
  head_to_head_recent: HeadToHeadEntry[];
  model_info: Record<string, unknown>;
}

export interface GoalsByHalfPrediction {
  team1_first_half: number;
  team1_second_half: number;
  team2_first_half: number;
  team2_second_half: number;
}

export interface CardsPrediction {
  team1_expected_yellow: number;
  team2_expected_yellow: number;
  team1_red_card_probability: number;
  team2_red_card_probability: number;
}

export interface MatchStatsPrediction {
  team1_possession: number;
  team2_possession: number;
  team1_corners: number;
  team2_corners: number;
  team1_fouls: number;
  team2_fouls: number;
  team1_attempts: number;
  team2_attempts: number;
  team1_on_target: number;
  team2_on_target: number;
}

export interface PremiumPrediction extends FreePrediction {
  expected_total_goals: number;
  over_2_5_probability: number;
  goals_by_half: GoalsByHalfPrediction;
  cards: CardsPrediction;
  match_stats: MatchStatsPrediction;
}

export interface Team {
  name: string;
  cluster?: number | null;
  cluster_label?: string | null;
  win_rate?: number | null;
  avg_goals_for?: number | null;
  avg_goals_against?: number | null;
  n_recent_matches?: number | null;
}

export interface TeamsListResponse {
  total: number;
  teams: Team[];
}

export interface TeamProfile extends Team {
  avg_possession?: number | null;
  avg_corners?: number | null;
  avg_fouls?: number | null;
  avg_attempts?: number | null;
}

export interface Token {
  access_token: string;
  token_type: string;
  tier: "free" | "premium";
}

export interface UserInfo {
  username: string;
  tier: "free" | "premium";
}

export interface ApiError {
  detail: string;
}
