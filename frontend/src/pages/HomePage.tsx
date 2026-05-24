import { Link } from "react-router-dom";

import { Footer } from "../components/Footer";
import { Icons, ProbBar, TeamMark } from "../components/design";
import { getTeamMeta, WC2026_TEAMS } from "../data/teams";

/** Landing tipográfico puro — la primera impresión del producto. */
export function HomePage() {
  const sampleA = getTeamMeta("Argentina")!;
  const sampleB = getTeamMeta("Francia")!;

  return (
    <div className="page">
      {/* ---------- HERO ---------- */}
      <section style={{ padding: "80px 0 60px", position: "relative" }}>
        <div className="container">
          <div className="row gap-2 mb-6" style={{ flexWrap: "wrap" }}>
            <span className="tag accent dot">En vivo · Modelo v0.1</span>
            <span className="tag">11·jun·2026 — Kickoff Mundial</span>
          </div>

          <h1
            className="display"
            style={{
              fontSize: "clamp(56px, 10vw, 168px)",
              margin: 0,
              color: "var(--ink)",
              fontWeight: 500,
            }}
          >
            Predice
            <br />
            cada partido
            <br />
            <span
              className="serif-it"
              style={{ color: "var(--accent)", fontWeight: 400 }}
            >
              antes
            </span>{" "}
            de que ocurra.
          </h1>

          <div
            className="row mt-8 gap-8"
            style={{ alignItems: "flex-end", flexWrap: "wrap" }}
          >
            <p
              style={{
                maxWidth: 520,
                fontSize: 18,
                lineHeight: 1.5,
                color: "var(--ink-3)",
                margin: 0,
              }}
            >
              GoalPredict 2026 combina{" "}
              <span className="serif-it" style={{ fontSize: 20 }}>
                47.000
              </span>{" "}
              partidos internacionales y modelos de Machine Learning para
              calcular la probabilidad real de cada enfrentamiento del Mundial.
            </p>
            <div className="row gap-3">
              <Link to="/predict" className="btn lg accent">
                Probar predicción
                <Icons.arrow s={14} />
              </Link>
              <Link to="/pricing" className="btn lg ghost">
                Ver planes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- TICKER de equipos ---------- */}
      <section
        style={{
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
          background: "var(--bg-soft)",
          padding: "20px 0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 40,
            animation: "tickerMove 50s linear infinite",
            whiteSpace: "nowrap",
            width: "max-content",
          }}
        >
          {[...WC2026_TEAMS, ...WC2026_TEAMS].map((t, i) => (
            <div
              key={i}
              className="row gap-3"
              style={{ alignItems: "center", flexShrink: 0 }}
            >
              <TeamMark team={t} size={26} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>{t.name}</span>
              <span
                className="mono"
                style={{ fontSize: 11, color: "var(--ink-mute)" }}
              >
                FIFA #{t.rank}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- METRICS ---------- */}
      <section style={{ padding: "80px 0" }}>
        <div className="container">
          <div className="uplabel mb-6">[01] El modelo en cifras</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 0,
              borderTop: "1px solid var(--line)",
              borderLeft: "1px solid var(--line)",
            }}
          >
            {[
              {
                n: "49.287",
                l: "Partidos internacionales analizados",
                s: "desde 1872 (Martj42)",
              },
              {
                n: "48",
                l: "Selecciones del Mundial 2026",
                s: "formato ampliado FIFA",
              },
              {
                n: "104",
                l: "Partidos del torneo cubiertos",
                s: "fase grupos + eliminatorias",
              },
              {
                n: "34",
                l: "Variables por predicción",
                s: "Elo, rolling stats, H2H, descanso",
              },
              {
                n: "<3s",
                l: "Tiempo de respuesta promedio",
                s: "API FastAPI + caché",
              },
              {
                n: "57%",
                l: "Accuracy sobre dataset de prueba",
                s: "XGBoost regularizado + balanced",
              },
            ].map((m, i) => (
              <div
                key={i}
                style={{
                  padding: "28px 24px",
                  borderRight: "1px solid var(--line)",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div
                  className="display mono tabnum"
                  style={{
                    fontSize: 56,
                    fontWeight: 500,
                    letterSpacing: "-0.05em",
                    color: "var(--ink)",
                    lineHeight: 1,
                  }}
                >
                  {m.n}
                </div>
                <div
                  style={{
                    marginTop: 14,
                    fontSize: 14,
                    color: "var(--ink)",
                    maxWidth: 220,
                    lineHeight: 1.4,
                  }}
                >
                  {m.l}
                </div>
                <div
                  className="mono"
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    color: "var(--ink-mute)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {m.s}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section style={{ padding: "40px 0 80px" }}>
        <div className="container">
          <div className="uplabel mb-6">[02] Cómo funciona</div>
          <h2
            className="display"
            style={{
              fontSize: "clamp(36px, 5vw, 64px)",
              margin: "0 0 48px",
              maxWidth: 800,
              fontWeight: 500,
            }}
          >
            Eliges dos selecciones.{" "}
            <span className="serif-it" style={{ color: "var(--ink-mute)" }}>
              El resto lo calcula el modelo.
            </span>
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 1,
              background: "var(--line)",
              border: "1px solid var(--line)",
            }}
          >
            {[
              {
                n: "01",
                t: "Selecciona dos selecciones",
                d: "Elige las selecciones nacionales que se enfrentan. 48 equipos clasificados al Mundial 2026.",
              },
              {
                n: "02",
                t: "El modelo procesa el histórico",
                d: "Analizamos enfrentamientos directos, rendimiento reciente, condición local/visitante y 34 variables.",
              },
              {
                n: "03",
                t: "Recibes la predicción",
                d: "Probabilidad de victoria, empate y derrota. Si eres Premium, también goles por tiempo, tarjetas, corners y posesión.",
              },
              {
                n: "04",
                t: "Inspecciona el modelo",
                d: "Cada predicción muestra los factores que pesaron — diferencia de Elo, historial directo, sede neutral.",
              },
            ].map((s) => (
              <div
                key={s.n}
                style={{ padding: "28px 24px", background: "var(--bg)" }}
              >
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    color: "var(--accent)",
                  }}
                >
                  {s.n}
                </div>
                <div
                  className="mt-3"
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {s.t}
                </div>
                <div
                  className="mt-3"
                  style={{
                    fontSize: 14,
                    color: "var(--ink-3)",
                    lineHeight: 1.55,
                  }}
                >
                  {s.d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- SAMPLE PREDICTION CARD ---------- */}
      <section style={{ padding: "20px 0 80px" }}>
        <div className="container">
          <div className="uplabel mb-6">[03] Una predicción cualquiera</div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "24px 28px",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div className="row gap-3" style={{ alignItems: "center" }}>
                <span className="tag dot accent">Demo</span>
                <span
                  className="mono"
                  style={{ fontSize: 12, color: "var(--ink-mute)" }}
                >
                  Argentina vs Francia · Fase de grupos
                </span>
              </div>
              <span
                className="mono"
                style={{
                  fontSize: 11,
                  color: "var(--ink-mute)",
                  letterSpacing: "0.06em",
                }}
              >
                Confianza del modelo: 0.81
              </span>
            </div>
            <div style={{ padding: 28 }}>
              <div
                className="row between"
                style={{
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div className="row gap-4" style={{ alignItems: "center" }}>
                  <TeamMark team={sampleA} size={48} />
                  <div className="col">
                    <div style={{ fontWeight: 500, fontSize: 18 }}>
                      {sampleA.name}
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 11,
                        color: "var(--ink-mute)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {sampleA.conf} · #{sampleA.rank}
                    </div>
                  </div>
                </div>
                <div
                  className="display mono tabnum"
                  style={{ fontSize: 28, color: "var(--ink-mute)" }}
                >
                  vs
                </div>
                <div className="row gap-4" style={{ alignItems: "center" }}>
                  <div
                    className="col"
                    style={{ textAlign: "right", alignItems: "flex-end" }}
                  >
                    <div style={{ fontWeight: 500, fontSize: 18 }}>
                      {sampleB.name}
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 11,
                        color: "var(--ink-mute)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {sampleB.conf} · #{sampleB.rank}
                    </div>
                  </div>
                  <TeamMark team={sampleB} size={48} />
                </div>
              </div>

              <div style={{ marginTop: 32 }}>
                <ProbBar a={0.42} draw={0.27} b={0.31} height={12} showLabels={false} />
                <div
                  className="row between mt-3"
                  style={{ flexWrap: "wrap", gap: 12 }}
                >
                  <div>
                    <div
                      className="display mono tabnum"
                      style={{
                        fontSize: 44,
                        fontWeight: 500,
                        letterSpacing: "-0.04em",
                        color: "var(--ink)",
                      }}
                    >
                      42
                      <span style={{ fontSize: 22, color: "var(--ink-mute)" }}>
                        %
                      </span>
                    </div>
                    <div className="uplabel">Victoria {sampleA.name}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      className="display mono tabnum"
                      style={{
                        fontSize: 44,
                        fontWeight: 500,
                        letterSpacing: "-0.04em",
                        color: "var(--ink-mute)",
                      }}
                    >
                      27<span style={{ fontSize: 22 }}>%</span>
                    </div>
                    <div className="uplabel">Empate</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      className="display mono tabnum"
                      style={{
                        fontSize: 44,
                        fontWeight: 500,
                        letterSpacing: "-0.04em",
                        color: "var(--accent)",
                      }}
                    >
                      31
                      <span style={{ fontSize: 22, color: "var(--ink-mute)" }}>
                        %
                      </span>
                    </div>
                    <div className="uplabel">Victoria {sampleB.name}</div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 32,
                  paddingTop: 24,
                  borderTop: "1px solid var(--line)",
                }}
              >
                <Link to="/predict" className="btn">
                  Probar con cualquier enfrentamiento
                  <Icons.arrow s={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- DATASETS ---------- */}
      <section style={{ padding: "20px 0 80px" }}>
        <div className="container">
          <div className="uplabel mb-6">[04] Datos y modelo</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 60,
            }}
          >
            <div>
              <h3
                className="display"
                style={{
                  fontSize: "clamp(28px, 4vw, 44px)",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                Entrenado con{" "}
                <span className="serif-it" style={{ color: "var(--accent)" }}>
                  cuatro
                </span>{" "}
                datasets públicos de Kaggle.
              </h3>
              <p
                style={{
                  marginTop: 20,
                  fontSize: 15,
                  color: "var(--ink-3)",
                  lineHeight: 1.6,
                  maxWidth: 480,
                }}
              >
                Combinamos resultados internacionales desde 1872, base europea
                de partidos detallados, histórico completo de Mundiales y el
                dataset oficial del Mundial 2022 para alimentar un ensemble de
                modelos supervisados.
              </p>
            </div>
            <div>
              {[
                {
                  n: "International Football Results",
                  s: "1872–2024 · Martj42",
                  c: "49.287 partidos · resultado, local, visitante",
                },
                {
                  n: "European Soccer Database",
                  s: "Hugomathien",
                  c: "25.000 partidos · goles, posesión, faltas",
                },
                {
                  n: "FIFA World Cup 1930–2022",
                  s: "Fjelstul",
                  c: "Histórico completo de Mundiales",
                },
                {
                  n: "FIFA World Cup 2022 Complete",
                  s: "Die9origephit",
                  c: "Stats detalladas del último Mundial",
                },
              ].map((d, i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px 0",
                    borderBottom: i < 3 ? "1px solid var(--line)" : "none",
                    display: "grid",
                    gridTemplateColumns: "24px 1fr",
                    gap: 14,
                  }}
                >
                  <div
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "var(--ink-mute)",
                      paddingTop: 4,
                    }}
                  >
                    0{i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{d.n}</div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 11,
                        color: "var(--ink-mute)",
                        marginTop: 3,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {d.s}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--ink-3)",
                        marginTop: 6,
                      }}
                    >
                      {d.c}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CTA FINAL ---------- */}
      <section
        style={{
          padding: "80px 0",
          borderTop: "1px solid var(--line)",
          background: "var(--bg-soft)",
        }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          <div className="uplabel mb-4">
            11·06·2026 — Estadio Azteca, CDMX
          </div>
          <h2
            className="display"
            style={{
              fontSize: "clamp(40px, 7vw, 96px)",
              margin: 0,
              maxWidth: 900,
              marginLeft: "auto",
              marginRight: "auto",
              fontWeight: 500,
            }}
          >
            El Mundial empieza
            <br />
            en{" "}
            <span className="serif-it" style={{ color: "var(--accent)" }}>
              19 días.
            </span>
          </h2>
          <p
            style={{
              marginTop: 24,
              fontSize: 17,
              color: "var(--ink-3)",
              maxWidth: 540,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Cubrimos los 104 partidos del torneo. Prueba el dashboard gratis o
            desbloquea todas las estadísticas con Premium.
          </p>
          <div
            className="row gap-3 mt-6"
            style={{ justifyContent: "center" }}
          >
            <Link to="/predict" className="btn lg accent">
              Probar gratis
              <Icons.arrow s={14} />
            </Link>
            <Link to="/pricing" className="btn lg ghost">
              Ver Premium
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
