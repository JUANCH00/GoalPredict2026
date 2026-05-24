import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Footer } from "../components/Footer";
import { TeamPicker } from "../components/TeamPicker";
import {
  AnimatedNumber,
  Donut,
  Icons,
  PremiumLock,
  ProbBar,
  TeamMark,
  VsBar,
} from "../components/design";
import { useAuth } from "../context/AuthContext";
import { FIXTURES_2026, type Fixture } from "../data/fixtures";
import { getTeamMeta, type TeamMeta } from "../data/teams";
import { useTeams } from "../hooks/useTeams";
import { predictResult, predictStats } from "../services/api";
import type {
  FreePrediction,
  HeadToHeadEntry,
  PremiumPrediction,
} from "../types/api";

type Tab = "result" | "stats" | "h2h";

/** Dashboard — selector + predicción animada + tabs. Pieza central de la app. */
export function PredictionPage() {
  const [params, setParams] = useSearchParams();
  const { isPremium } = useAuth();
  const navigate = useNavigate();
  const { teams, loading: teamsLoading } = useTeams();

  const [team1, setTeam1] = useState(params.get("team1") ?? "Argentina");
  const [team2, setTeam2] = useState(params.get("team2") ?? "France");
  const [neutral] = useState(params.get("neutral") !== "false");
  const [tab, setTab] = useState<Tab>("result");

  const [free, setFree] = useState<FreePrediction | null>(null);
  const [premium, setPremium] = useState<PremiumPrediction | null>(null);
  const [phase, setPhase] = useState<"computing" | "revealed" | "error">(
    "computing",
  );
  const [error, setError] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);

  const metaA = getTeamMeta(team1);
  const metaB = getTeamMeta(team2);

  // Re-predict cuando cambian las selecciones
  useEffect(() => {
    if (!team1 || !team2 || team1 === team2) return;
    let cancelled = false;
    setPhase("computing");
    setError(null);
    setFree(null);
    setPremium(null);

    const minComputingMs = 800; // que la animación shimmer alcance a verse
    const start = performance.now();

    const run = async () => {
      try {
        if (isPremium) {
          const data = await predictStats({ team1, team2, neutral });
          if (cancelled) return;
          setPremium(data);
          setFree(data);
        } else {
          const data = await predictResult({ team1, team2, neutral });
          if (cancelled) return;
          setFree(data);
        }
        const elapsed = performance.now() - start;
        const wait = Math.max(0, minComputingMs - elapsed);
        setTimeout(() => {
          if (cancelled) return;
          setPhase("revealed");
          setAnimKey((k) => k + 1);
        }, wait);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setPhase("error");
      }
    };
    run();

    // sync URL para shareability
    setParams({ team1, team2, neutral: String(neutral) }, { replace: true });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team1, team2, neutral, isPremium]);

  function swap() {
    setTeam1(team2);
    setTeam2(team1);
  }

  function loadFixture(f: Fixture) {
    setTeam1(f.a);
    setTeam2(f.b);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="page">
      <div className="container" style={{ padding: "40px 32px 80px" }}>
        {/* HERO ----------------------------------------------------- */}
        <div
          className="row between mb-6"
          style={{ alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}
        >
          <div>
            <div className="uplabel mb-3">Predicción de partido</div>
            <h1
              className="display"
              style={{
                fontSize: "clamp(36px, 5vw, 56px)",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Elige dos selecciones,
              <br />
              <span className="serif-it" style={{ color: "var(--accent)" }}>
                recibe la probabilidad.
              </span>
            </h1>
          </div>
          <div className="row gap-2">
            {!isPremium && (
              <button
                className="btn ghost sm"
                onClick={() => navigate("/pricing")}
              >
                <Icons.sparkles s={12} />
                Ver Premium
              </button>
            )}
          </div>
        </div>

        {/* SELECTOR ------------------------------------------------- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 60px 1fr",
            gap: 16,
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <TeamPicker
            value={team1}
            onChange={setTeam1}
            teams={teams}
            exclude={team2}
            placeholder={teamsLoading ? "Cargando..." : "Local"}
          />
          <SwapButton onClick={swap} />
          <TeamPicker
            value={team2}
            onChange={setTeam2}
            teams={teams}
            exclude={team1}
            placeholder={teamsLoading ? "Cargando..." : "Visitante"}
            align="right"
          />
        </div>

        {/* RESULT CARD ---------------------------------------------- */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* header */}
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid var(--line)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              background: "var(--bg-soft)",
            }}
          >
            <div className="row gap-3" style={{ alignItems: "center" }}>
              <span
                className="tag dot"
                style={{
                  color:
                    phase === "computing"
                      ? "var(--accent)"
                      : phase === "error"
                      ? "var(--loss)"
                      : "var(--win)",
                }}
              >
                {phase === "computing"
                  ? "Calculando"
                  : phase === "error"
                  ? "Error"
                  : "Predicción lista"}
              </span>
              <span
                className="mono"
                style={{
                  fontSize: 11,
                  color: "var(--ink-mute)",
                  letterSpacing: "0.06em",
                }}
              >
                {free
                  ? `${(free.model_info?.model_name as string) ?? "XGBoost"} · sede ${neutral ? "neutral" : "local"}`
                  : "Inicializando modelo..."}
              </span>
            </div>
            <TabSwitcher tab={tab} setTab={setTab} isPremium={isPremium} />
          </div>

          {/* big team showdown */}
          <div
            style={{
              padding: "40px 32px 32px",
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              gap: 24,
              alignItems: "center",
            }}
          >
            <TeamColumn
              meta={metaA}
              side="a"
              prob={free?.probabilities.home_win}
              computing={phase === "computing"}
            />
            <div className="col center" style={{ gap: 4 }}>
              <div
                className="display mono tabnum"
                style={{
                  fontSize: 36,
                  color: "var(--ink-mute)",
                  fontWeight: 500,
                }}
              >
                vs
              </div>
              <div className="uplabel" style={{ fontSize: 9 }}>
                {neutral ? "Sede neutral" : "Local · visitante"}
              </div>
            </div>
            <TeamColumn
              meta={metaB}
              side="b"
              prob={free?.probabilities.away_win}
              computing={phase === "computing"}
              reverse
            />
          </div>

          {/* probability bar */}
          <div style={{ padding: "0 32px 32px" }}>
            {phase === "computing" && <ComputingBar />}
            {phase === "error" && (
              <div
                style={{
                  padding: 16,
                  background: "color-mix(in oklab, var(--loss) 8%, var(--bg))",
                  border:
                    "1px solid color-mix(in oklab, var(--loss) 25%, var(--line))",
                  borderRadius: "var(--radius-md)",
                  color: "var(--loss)",
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}
            {free && phase === "revealed" && (
              <div key={animKey}>
                <ProbBar
                  a={free.probabilities.home_win}
                  draw={free.probabilities.draw}
                  b={free.probabilities.away_win}
                  height={14}
                  showLabels={false}
                />
                <div className="row between mt-4">
                  <Outcome
                    label={metaA?.name ?? team1}
                    prob={free.probabilities.home_win}
                    color="var(--ink)"
                  />
                  <Outcome
                    label="Empate"
                    prob={free.probabilities.draw}
                    color="var(--stone)"
                    center
                  />
                  <Outcome
                    label={metaB?.name ?? team2}
                    prob={free.probabilities.away_win}
                    color="var(--accent)"
                    right
                  />
                </div>
              </div>
            )}
          </div>

          {/* TAB CONTENT */}
          {free && phase === "revealed" && tab === "result" && (
            <ResultTab
              free={free}
              metaA={metaA}
              metaB={metaB}
              isPremium={isPremium}
              animKey={animKey}
            />
          )}
          {free && phase === "revealed" && tab === "stats" && (
            <StatsTab
              premium={premium}
              metaA={metaA}
              metaB={metaB}
              isPremium={isPremium}
              animKey={animKey}
              onUpgrade={() => navigate("/pricing")}
            />
          )}
          {free && phase === "revealed" && tab === "h2h" && (
            <H2HTab
              h2h={free.head_to_head_recent}
              metaA={metaA}
              metaB={metaB}
              team1Name={team1}
            />
          )}
        </div>

        {/* PRÓXIMOS PARTIDOS -------------------------------------- */}
        <div style={{ marginTop: 48 }}>
          <div
            className="row between mb-4"
            style={{ alignItems: "flex-end" }}
          >
            <div>
              <div className="uplabel mb-2">Próximos partidos</div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                }}
              >
                Mundial 2026 — Fase de grupos
              </h2>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 12,
            }}
          >
            {FIXTURES_2026.map((f, i) => (
              <FixtureCard key={i} f={f} onClick={() => loadFixture(f)} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ===========================================================================
// Subcomponentes
// ===========================================================================

function SwapButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Intercambiar selecciones"
      style={{
        width: 44,
        height: 44,
        margin: "0 auto",
        borderRadius: "50%",
        border: "1px solid var(--line)",
        background: "var(--bg-card)",
        color: "var(--ink-3)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all .15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--ink)";
        e.currentTarget.style.color = "var(--ink)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--line)";
        e.currentTarget.style.color = "var(--ink-3)";
      }}
    >
      <Icons.swap s={16} />
    </button>
  );
}

function TabSwitcher({
  tab,
  setTab,
  isPremium,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  isPremium: boolean;
}) {
  const items: { id: Tab; label: string; premium?: boolean }[] = [
    { id: "result", label: "Resultado" },
    { id: "stats", label: "Estadísticas", premium: true },
    { id: "h2h", label: "H2H" },
  ];
  return (
    <div
      className="row gap-1"
      style={{
        padding: 3,
        background: "var(--bg-card)",
        borderRadius: 4,
        border: "1px solid var(--line)",
      }}
    >
      {items.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          style={{
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 500,
            border: 0,
            borderRadius: 3,
            background: tab === t.id ? "var(--ink)" : "transparent",
            color: tab === t.id ? "var(--bg)" : "var(--ink-3)",
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {t.label}
          {t.premium && !isPremium && <Icons.lock s={10} />}
        </button>
      ))}
    </div>
  );
}

function TeamColumn({
  meta,
  side,
  prob,
  computing,
  reverse,
}: {
  meta: TeamMeta | null;
  side: "a" | "b";
  prob: number | undefined;
  computing: boolean;
  reverse?: boolean;
}) {
  if (!meta) return null;
  const flexDir = reverse ? "row-reverse" : "row";
  const textAlign: "left" | "right" = reverse ? "right" : "left";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: flexDir,
        alignItems: "center",
        gap: 20,
      }}
    >
      <TeamMark team={meta} size={72} />
      <div style={{ textAlign }}>
        <div
          className="display"
          style={{
            fontSize: "clamp(24px, 3vw, 36px)",
            fontWeight: 500,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
          }}
        >
          {meta.name}
        </div>
        <div
          className="mono mt-2"
          style={{
            fontSize: 11,
            color: "var(--ink-mute)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {meta.conf}
          {meta.rank < 999 && ` · FIFA #${meta.rank}`}
        </div>
        <div
          className="mt-3"
          style={{
            display: "flex",
            justifyContent: reverse ? "flex-end" : "flex-start",
          }}
        >
          {computing ? (
            <div
              className="mono"
              style={{ fontSize: 26, color: "var(--ink-mute)" }}
            >
              —
            </div>
          ) : prob != null ? (
            <div
              className="display mono tabnum fade-in"
              style={{
                fontSize: 56,
                fontWeight: 500,
                letterSpacing: "-0.05em",
                color: side === "b" ? "var(--accent)" : "var(--ink)",
                lineHeight: 1,
              }}
            >
              <AnimatedNumber
                value={prob * 100}
                format={(v) => String(Math.round(v))}
                suffix="%"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Outcome({
  label,
  prob,
  color,
  center,
  right,
}: {
  label: string;
  prob: number;
  color: string;
  center?: boolean;
  right?: boolean;
}) {
  const align: "left" | "right" | "center" = right
    ? "right"
    : center
    ? "center"
    : "left";
  return (
    <div style={{ textAlign: align }}>
      <div className="uplabel" style={{ fontSize: 10 }}>
        {label}
      </div>
      <div
        className="display mono tabnum mt-1"
        style={{
          fontSize: 22,
          color,
          fontWeight: 500,
          letterSpacing: "-0.03em",
        }}
      >
        {Math.round(prob * 100)}%
      </div>
    </div>
  );
}

function ComputingBar() {
  return (
    <div>
      <div
        style={{
          height: 14,
          width: "100%",
          borderRadius: 999,
          background: "var(--line-soft)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "40%",
            background:
              "linear-gradient(90deg, transparent, var(--accent), transparent)",
            animation: "shimmerMove 1.4s linear infinite",
          }}
        />
      </div>
      <div
        className="row gap-2 mt-3 mono"
        style={{
          fontSize: 11,
          color: "var(--ink-mute)",
          letterSpacing: "0.06em",
        }}
      >
        <span style={{ color: "var(--accent)" }}>●</span>
        <span>
          Procesando 49.287 partidos · ensemble XGBoost + features Elo...
        </span>
      </div>
    </div>
  );
}

// ===========================================================================
// Tabs
// ===========================================================================

function ResultTab({
  free,
  metaA,
  metaB,
  isPremium,
  animKey,
}: {
  free: FreePrediction;
  metaA: TeamMeta | null;
  metaB: TeamMeta | null;
  isPremium: boolean;
  animKey: number;
}) {
  if (!metaA || !metaB) return null;

  const factors = [
    {
      l: "Diferencia ranking FIFA",
      v:
        metaB.rank < 999 && metaA.rank < 999
          ? `${metaB.rank - metaA.rank > 0 ? "+" : ""}${metaB.rank - metaA.rank}`
          : "—",
      w: 0.28,
    },
    {
      l: "Win rate reciente (team1)",
      v: free.team1.win_rate != null
        ? `${(free.team1.win_rate * 100).toFixed(0)}%`
        : "—",
      w: 0.22,
    },
    {
      l: "Promedio goles a favor",
      v: free.team1.avg_goals_for != null && free.team2.avg_goals_for != null
        ? `${free.team1.avg_goals_for.toFixed(2)} vs ${free.team2.avg_goals_for.toFixed(2)}`
        : "—",
      w: 0.2,
    },
    {
      l: "Promedio goles en contra",
      v: free.team1.avg_goals_against != null && free.team2.avg_goals_against != null
        ? `${free.team1.avg_goals_against.toFixed(2)} vs ${free.team2.avg_goals_against.toFixed(2)}`
        : "—",
      w: 0.18,
    },
    { l: "Sede neutral", v: "Sí · Mundial 2026", w: 0.14 },
  ];

  const probs = free.probabilities;
  const aWins = probs.home_win > probs.away_win;
  const winner = aWins ? metaA.name : metaB.name;
  const winnerProb = Math.max(probs.home_win, probs.away_win);

  return (
    <div className="fade-in" key={animKey} style={{ padding: "0 32px 32px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 32,
          borderTop: "1px solid var(--line)",
          paddingTop: 28,
        }}
      >
        <div>
          <div className="uplabel mb-4">Factores del modelo</div>
          {factors.map((f, i) => (
            <div
              key={i}
              style={{
                padding: "12px 0",
                borderBottom:
                  i < factors.length - 1
                    ? "1px solid var(--line-soft)"
                    : "none",
              }}
            >
              <div className="row between mb-2">
                <div style={{ fontSize: 13.5, color: "var(--ink)" }}>{f.l}</div>
                <div
                  className="mono tabnum"
                  style={{ fontSize: 12, color: "var(--ink-mute)" }}
                >
                  {f.v}
                </div>
              </div>
              <div
                style={{
                  height: 3,
                  background: "var(--line-soft)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, f.w * 200)}%`,
                    height: "100%",
                    background: "var(--ink)",
                    animation: "barGrow 1s cubic-bezier(.2,.7,.2,1) both",
                    transformOrigin: "left",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="uplabel mb-4">Resumen ejecutivo</div>
          <div
            style={{
              padding: 20,
              background: "var(--bg-soft)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--line)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.6,
                color: "var(--ink)",
              }}
            >
              El modelo otorga a <strong>{winner}</strong> la mayor probabilidad
              de victoria con{" "}
              <span
                className="mono tabnum"
                style={{ color: aWins ? "var(--ink)" : "var(--accent)" }}
              >
                {Math.round(winnerProb * 100)}%
              </span>
              . El empate es{" "}
              {probs.draw > 0.28 ? "notablemente probable" : "una opción secundaria"}{" "}
              ({Math.round(probs.draw * 100)}%).
            </p>
            <p
              style={{
                margin: "12px 0 0",
                fontSize: 14,
                lineHeight: 1.55,
                color: "var(--ink-3)",
              }}
            >
              Modelo:{" "}
              <span className="mono">
                {(free.model_info?.model_name as string) ?? "XGBoost"}
              </span>
              . Las estadísticas detalladas (goles 1T/2T, tarjetas, posesión y
              corners) requieren acceso{" "}
              {isPremium ? (
                <strong>Premium activo</strong>
              ) : (
                <strong>Premium</strong>
              )}
              .
            </p>
          </div>

          <div className="mt-4 row gap-2" style={{ flexWrap: "wrap" }}>
            <button className="btn sm ghost">
              <Icons.download s={12} />
              Exportar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsTab({
  premium,
  metaA,
  metaB,
  isPremium,
  animKey,
  onUpgrade,
}: {
  premium: PremiumPrediction | null;
  metaA: TeamMeta | null;
  metaB: TeamMeta | null;
  isPremium: boolean;
  animKey: number;
  onUpgrade: () => void;
}) {
  if (!metaA || !metaB) return null;

  // Mostrar overlay si no es premium. Renderizamos un placeholder con
  // datos de muestra para que el blur deje ver la composición.
  const sample: PremiumPrediction = premium ?? makeSamplePremium(metaA, metaB);
  const locked = !isPremium;

  return (
    <div
      className="fade-in"
      key={animKey}
      style={{ padding: "0 32px 32px", position: "relative" }}
    >
      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 28 }}>
        <div className="row between mb-5">
          <div className="uplabel">Estadísticas detalladas · Premium</div>
          <span className="tag accent dot">Modelo regresión</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 24,
            filter: locked ? "blur(6px)" : "none",
            pointerEvents: locked ? "none" : "auto",
          }}
        >
          <div className="card" style={{ padding: 20 }}>
            <div className="uplabel mb-3">Over / Under 2.5 goles</div>
            <div className="row gap-4 center">
              <Donut
                value={sample.over_2_5_probability}
                label="Over 2.5"
                color="var(--ink)"
              />
              <Donut
                value={1 - sample.over_2_5_probability}
                label="Under 2.5"
                color="var(--accent)"
              />
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div className="uplabel mb-3">Goles por tiempo</div>
            <div className="col gap-3 mt-3">
              <div className="row between">
                <span style={{ fontSize: 13 }}>1er tiempo</span>
                <span
                  className="display mono tabnum"
                  style={{
                    fontSize: 26,
                    fontWeight: 500,
                    letterSpacing: "-0.03em",
                  }}
                >
                  <AnimatedNumber
                    value={
                      sample.goals_by_half.team1_first_half +
                      sample.goals_by_half.team2_first_half
                    }
                    format={(v) => v.toFixed(1)}
                  />
                </span>
              </div>
              <div className="row between">
                <span style={{ fontSize: 13 }}>2do tiempo</span>
                <span
                  className="display mono tabnum"
                  style={{
                    fontSize: 26,
                    fontWeight: 500,
                    letterSpacing: "-0.03em",
                    color: "var(--accent)",
                  }}
                >
                  <AnimatedNumber
                    value={
                      sample.goals_by_half.team1_second_half +
                      sample.goals_by_half.team2_second_half
                    }
                    format={(v) => v.toFixed(1)}
                  />
                </span>
              </div>
              <div
                className="row between"
                style={{
                  paddingTop: 8,
                  borderTop: "1px solid var(--line)",
                }}
              >
                <span style={{ fontSize: 13, color: "var(--ink-mute)" }}>
                  Total esperado
                </span>
                <span className="mono tabnum" style={{ fontSize: 14 }}>
                  {sample.expected_total_goals.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div className="uplabel mb-3">Disciplina (amarillas)</div>
            <div className="col gap-3 mt-3">
              <div className="row between">
                <span style={{ fontSize: 13 }}>{metaA.name}</span>
                <span
                  className="display mono tabnum"
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {sample.cards.team1_expected_yellow.toFixed(1)}
                </span>
              </div>
              <div className="row between">
                <span style={{ fontSize: 13 }}>{metaB.name}</span>
                <span
                  className="display mono tabnum"
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    letterSpacing: "-0.03em",
                    color: "var(--accent)",
                  }}
                >
                  {sample.cards.team2_expected_yellow.toFixed(1)}
                </span>
              </div>
              <div
                className="row between"
                style={{
                  paddingTop: 8,
                  borderTop: "1px solid var(--line)",
                  fontSize: 12,
                  color: "var(--ink-mute)",
                }}
              >
                <span>P(roja) {metaA.name}</span>
                <span className="mono tabnum">
                  {(sample.cards.team1_red_card_probability * 100).toFixed(0)}%
                </span>
              </div>
              <div
                className="row between"
                style={{ fontSize: 12, color: "var(--ink-mute)" }}
              >
                <span>P(roja) {metaB.name}</span>
                <span className="mono tabnum">
                  {(sample.cards.team2_red_card_probability * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            filter: locked ? "blur(6px)" : "none",
            pointerEvents: locked ? "none" : "auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 32,
            }}
          >
            <StatVsGroup
              title="Disciplina y juego"
              rows={[
                {
                  l: "Tarjetas amarillas",
                  a: sample.cards.team1_expected_yellow,
                  b: sample.cards.team2_expected_yellow,
                  format: (v) => v.toFixed(1),
                },
                {
                  l: "Tiros de esquina",
                  a: sample.match_stats.team1_corners,
                  b: sample.match_stats.team2_corners,
                  format: (v) => v.toFixed(1),
                },
                {
                  l: "Faltas",
                  a: sample.match_stats.team1_fouls,
                  b: sample.match_stats.team2_fouls,
                  format: (v) => v.toFixed(0),
                },
              ]}
            />
            <StatVsGroup
              title="Ofensiva"
              rows={[
                {
                  l: "Posesión",
                  a: sample.match_stats.team1_possession,
                  b: sample.match_stats.team2_possession,
                  format: (v) => `${v.toFixed(0)}%`,
                },
                {
                  l: "Intentos totales",
                  a: sample.match_stats.team1_attempts,
                  b: sample.match_stats.team2_attempts,
                  format: (v) => v.toFixed(0),
                },
                {
                  l: "A puerta",
                  a: sample.match_stats.team1_on_target,
                  b: sample.match_stats.team2_on_target,
                  format: (v) => v.toFixed(0),
                },
              ]}
            />
          </div>
        </div>

        {locked && <PremiumLock onUnlock={onUpgrade} />}
      </div>
    </div>
  );
}

function StatVsGroup({
  title,
  rows,
}: {
  title: string;
  rows: { l: string; a: number; b: number; format: (v: number) => string }[];
}) {
  return (
    <div>
      <div className="uplabel mb-3">{title}</div>
      <div style={{ borderTop: "1px solid var(--line)" }}>
        {rows.map((r, i) => (
          <div
            key={i}
            style={{
              padding: "14px 0",
              borderBottom: "1px solid var(--line-soft)",
            }}
          >
            <div className="row between mb-2">
              <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                {r.l}
              </span>
            </div>
            <VsBar a={r.a} b={r.b} format={r.format} />
          </div>
        ))}
      </div>
    </div>
  );
}

function H2HTab({
  h2h,
  metaA,
  metaB,
  team1Name,
}: {
  h2h: HeadToHeadEntry[];
  metaA: TeamMeta | null;
  metaB: TeamMeta | null;
  team1Name: string;
}) {
  if (!metaA || !metaB) return null;

  // calcular totales desde la perspectiva de team1
  let aWins = 0;
  let draws = 0;
  for (const g of h2h) {
    const t1IsHome = g.home_team === team1Name;
    const team1Score = t1IsHome ? g.home_score : g.away_score;
    const team2Score = t1IsHome ? g.away_score : g.home_score;
    if (team1Score > team2Score) aWins++;
    else if (team1Score === team2Score) draws++;
  }
  const bWins = h2h.length - aWins - draws;

  return (
    <div className="fade-in" style={{ padding: "0 32px 32px" }}>
      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 28 }}>
        <div className="row between mb-4">
          <div className="uplabel">
            Enfrentamientos directos · últimos {h2h.length}
          </div>
        </div>

        {h2h.length > 0 && (
          <div
            className="row gap-4 mb-5"
            style={{
              borderRadius: 4,
              padding: 16,
              background: "var(--bg-soft)",
              border: "1px solid var(--line)",
            }}
          >
            <div style={{ flex: 1 }}>
              <div className="uplabel">{metaA.code} gana</div>
              <div
                className="display mono tabnum"
                style={{
                  fontSize: 40,
                  fontWeight: 500,
                  letterSpacing: "-0.04em",
                }}
              >
                {aWins}
              </div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div className="uplabel">Empates</div>
              <div
                className="display mono tabnum"
                style={{
                  fontSize: 40,
                  fontWeight: 500,
                  letterSpacing: "-0.04em",
                  color: "var(--ink-mute)",
                }}
              >
                {draws}
              </div>
            </div>
            <div style={{ flex: 1, textAlign: "right" }}>
              <div className="uplabel">{metaB.code} gana</div>
              <div
                className="display mono tabnum"
                style={{
                  fontSize: 40,
                  fontWeight: 500,
                  letterSpacing: "-0.04em",
                  color: "var(--accent)",
                }}
              >
                {bWins}
              </div>
            </div>
          </div>
        )}

        {h2h.length === 0 ? (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              color: "var(--ink-mute)",
              fontSize: 14,
              fontStyle: "italic",
            }}
          >
            Sin enfrentamientos directos registrados.
          </div>
        ) : (
          <div>
            {h2h.slice(0, 10).map((g, i) => {
              const t1IsHome = g.home_team === team1Name;
              const team1Score = t1IsHome ? g.home_score : g.away_score;
              const team2Score = t1IsHome ? g.away_score : g.home_score;
              const team1Won = team1Score > team2Score;
              const team2Won = team2Score > team1Score;
              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr 80px 1fr 180px",
                    gap: 12,
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom:
                      i < 9 && i < h2h.length - 1
                        ? "1px solid var(--line-soft)"
                        : "none",
                    fontSize: 13,
                  }}
                >
                  <div
                    className="mono"
                    style={{ color: "var(--ink-mute)", fontSize: 12 }}
                  >
                    {g.date}
                  </div>
                  <div
                    className="row gap-3"
                    style={{
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        color: team1Won ? "var(--ink)" : "var(--ink-mute)",
                        fontWeight: team1Won ? 500 : 400,
                      }}
                    >
                      {metaA.name}
                    </span>
                    <TeamMark team={metaA} size={22} />
                  </div>
                  <div
                    className="display mono tabnum"
                    style={{
                      fontSize: 18,
                      fontWeight: 500,
                      textAlign: "center",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    <span
                      style={{
                        color: team1Won ? "var(--ink)" : "var(--ink-mute)",
                      }}
                    >
                      {team1Score}
                    </span>
                    <span style={{ color: "var(--ink-mute)", margin: "0 6px" }}>
                      –
                    </span>
                    <span
                      style={{
                        color: team2Won ? "var(--accent)" : "var(--ink-mute)",
                      }}
                    >
                      {team2Score}
                    </span>
                  </div>
                  <div className="row gap-3" style={{ alignItems: "center" }}>
                    <TeamMark team={metaB} size={22} />
                    <span
                      style={{
                        color: team2Won ? "var(--ink)" : "var(--ink-mute)",
                        fontWeight: team2Won ? 500 : 400,
                      }}
                    >
                      {metaB.name}
                    </span>
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "var(--ink-mute)",
                      letterSpacing: "0.04em",
                      textAlign: "right",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {g.tournament}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function FixtureCard({
  f,
  onClick,
}: {
  f: Fixture;
  onClick: () => void;
}) {
  const a = getTeamMeta(f.a);
  const b = getTeamMeta(f.b);
  if (!a || !b) return null;
  return (
    <button
      onClick={onClick}
      style={{
        padding: 16,
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-md)",
        background: "var(--bg-card)",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        transition: "all .15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--ink)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--line)";
        e.currentTarget.style.transform = "none";
      }}
    >
      <div className="row between mb-3">
        <span
          className="mono"
          style={{
            fontSize: 11,
            color: "var(--ink-mute)",
            letterSpacing: "0.06em",
          }}
        >
          {f.date} · {f.kick}
        </span>
        <span className="tag" style={{ fontSize: 10, padding: "2px 6px" }}>
          Grupo {f.group}
        </span>
      </div>
      <div className="row between" style={{ alignItems: "center" }}>
        <div className="row gap-2" style={{ alignItems: "center" }}>
          <TeamMark team={a} size={24} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{a.name}</span>
        </div>
        <span
          className="mono"
          style={{ fontSize: 11, color: "var(--ink-mute)" }}
        >
          vs
        </span>
        <div className="row gap-2" style={{ alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{b.name}</span>
          <TeamMark team={b} size={24} />
        </div>
      </div>
      <div className="mt-3" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
        {f.venue}
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Helper: cuando el usuario no es premium, mostramos un sample blurreado
// para que se vea la composición.

function makeSamplePremium(
  a: TeamMeta,
  b: TeamMeta,
): PremiumPrediction {
  return {
    team1: { name: a.name },
    team2: { name: b.name },
    probabilities: { home_win: 0.42, draw: 0.27, away_win: 0.31 },
    head_to_head_recent: [],
    expected_total_goals: 2.4,
    over_2_5_probability: 0.55,
    goals_by_half: {
      team1_first_half: 0.5,
      team1_second_half: 0.7,
      team2_first_half: 0.4,
      team2_second_half: 0.8,
    },
    cards: {
      team1_expected_yellow: 1.8,
      team2_expected_yellow: 2.1,
      team1_red_card_probability: 0.05,
      team2_red_card_probability: 0.07,
    },
    match_stats: {
      team1_possession: 52,
      team2_possession: 48,
      team1_corners: 5.5,
      team2_corners: 4.8,
      team1_fouls: 13,
      team2_fouls: 14,
      team1_attempts: 14,
      team2_attempts: 11,
      team1_on_target: 5,
      team2_on_target: 4,
    },
    model_info: {},
  };
}
