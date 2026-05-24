import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Footer } from "../components/Footer";
import { Icons, TeamMark } from "../components/design";
import { getTeamMeta } from "../data/teams";
import { useTeams } from "../hooks/useTeams";

/** Listado de selecciones con sus clusters y stats. */
export function TeamsPage() {
  const navigate = useNavigate();
  const { teams, loading, error } = useTeams();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return teams;
    const lower = q.toLowerCase();
    return teams.filter((t) => t.name.toLowerCase().includes(lower));
  }, [teams, q]);

  return (
    <div className="page">
      <div className="container" style={{ padding: "48px 32px 80px" }}>
        <div className="row between mb-6" style={{ alignItems: "flex-end" }}>
          <div>
            <div className="uplabel mb-3">Catálogo de selecciones</div>
            <h1
              className="display"
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                margin: 0,
                fontWeight: 500,
              }}
            >
              {loading
                ? "Cargando..."
                : `${teams.length} selecciones perfiladas`}
            </h1>
            <p
              style={{
                marginTop: 10,
                fontSize: 14,
                color: "var(--ink-3)",
                maxWidth: 540,
              }}
            >
              Cada selección con su cluster de estilo (K-Means sobre features
              agregadas) y promedios históricos de los últimos 8 años.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar selección..."
            style={{ maxWidth: 360 }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: 14,
              background:
                "color-mix(in oklab, var(--loss) 8%, var(--bg))",
              border:
                "1px solid color-mix(in oklab, var(--loss) 25%, var(--line))",
              borderRadius: "var(--radius-md)",
              color: "var(--loss)",
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {filtered.map((t) => {
            const meta = getTeamMeta(t.name);
            if (!meta) return null;
            return (
              <button
                key={t.name}
                onClick={() => {
                  navigate(
                    `/predict?team1=${encodeURIComponent(t.name)}&team2=Brazil`,
                  );
                }}
                className="card"
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all .15s",
                  padding: 18,
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
                <div className="row between mb-3" style={{ alignItems: "center" }}>
                  <div className="row gap-3" style={{ alignItems: "center" }}>
                    <TeamMark team={meta} size={36} />
                    <div className="col" style={{ gap: 2 }}>
                      <div style={{ fontSize: 15, fontWeight: 500 }}>
                        {meta.name}
                      </div>
                      <div
                        className="mono"
                        style={{
                          fontSize: 10,
                          color: "var(--ink-mute)",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {meta.conf}
                        {meta.rank < 999 && ` · #${meta.rank}`}
                      </div>
                    </div>
                  </div>
                  <Icons.arrow s={14} className="muted" />
                </div>

                {t.cluster_label && (
                  <div className="mb-3">
                    <span
                      className="tag"
                      style={{ fontSize: 10, textTransform: "capitalize" }}
                    >
                      {t.cluster_label}
                    </span>
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                    paddingTop: 12,
                    borderTop: "1px solid var(--line-soft)",
                  }}
                >
                  <Mini
                    label="Win"
                    value={t.win_rate}
                    fmt="pct"
                  />
                  <Mini label="GF/p" value={t.avg_goals_for} fmt="num" />
                  <Mini label="GA/p" value={t.avg_goals_against} fmt="num" />
                </div>
              </button>
            );
          })}
        </div>

        {!loading && filtered.length === 0 && (
          <div
            style={{
              padding: "48px 0",
              textAlign: "center",
              color: "var(--ink-mute)",
            }}
          >
            Sin resultados para "{q}"
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

function Mini({
  label,
  value,
  fmt,
}: {
  label: string;
  value: number | null | undefined;
  fmt: "pct" | "num";
}) {
  const display =
    value == null
      ? "—"
      : fmt === "pct"
      ? `${(value * 100).toFixed(0)}%`
      : value.toFixed(2);
  return (
    <div>
      <div
        className="mono tabnum"
        style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}
      >
        {display}
      </div>
      <div
        className="mono"
        style={{
          fontSize: 9,
          color: "var(--ink-mute)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}
