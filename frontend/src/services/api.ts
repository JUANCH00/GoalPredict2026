// Cliente HTTP del backend GoalPredict 2026.
// Usa fetch nativo + el JWT del localStorage (si existe) en cada request.

import type {
  FreePrediction,
  HeadToHeadEntry,
  MatchRequest,
  PremiumPrediction,
  Team,
  TeamProfile,
  TeamsListResponse,
  Token,
  UserInfo,
} from "../types/api";

const API_BASE = "/api/v1"; // vite proxy reenvía a http://127.0.0.1:8765

const TOKEN_STORAGE_KEY = "goalpredict_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null) {
  if (token === null) localStorage.removeItem(TOKEN_STORAGE_KEY);
  else localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

class ApiClientError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  options: { withAuth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  if (options.withAuth) {
    const token = getStoredToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      // ignore JSON parse error
    }
    throw new ApiClientError(detail, res.status);
  }
  return (await res.json()) as T;
}

// --- Auth ------------------------------------------------------------------

export async function login(username: string, password: string): Promise<Token> {
  const body = new URLSearchParams({ username, password });
  const token = await request<Token>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  setStoredToken(token.access_token);
  return token;
}

export function logout() {
  setStoredToken(null);
}

export async function fetchMe(): Promise<UserInfo> {
  return request<UserInfo>("/auth/me", {}, { withAuth: true });
}

// --- Teams -----------------------------------------------------------------

export async function listTeams(query?: string, minMatches = 20): Promise<Team[]> {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (minMatches > 0) params.set("min_matches", String(minMatches));
  const data = await request<TeamsListResponse>(`/teams?${params.toString()}`);
  return data.teams;
}

export async function fetchTeamProfile(name: string): Promise<TeamProfile> {
  return request<TeamProfile>(`/teams/${encodeURIComponent(name)}`);
}

// --- Predict ---------------------------------------------------------------

export async function predictResult(req: MatchRequest): Promise<FreePrediction> {
  return request<FreePrediction>("/predict/result", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function predictStats(req: MatchRequest): Promise<PremiumPrediction> {
  return request<PremiumPrediction>(
    "/predict/stats",
    { method: "POST", body: JSON.stringify(req) },
    { withAuth: true },
  );
}

// --- History ---------------------------------------------------------------

export async function fetchHeadToHead(
  team1: string,
  team2: string,
  limit = 10,
): Promise<HeadToHeadEntry[]> {
  return request<HeadToHeadEntry[]>(
    `/history/${encodeURIComponent(team1)}/vs/${encodeURIComponent(team2)}?limit=${limit}`,
  );
}

export { ApiClientError };
