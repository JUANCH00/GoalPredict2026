import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Footer } from "../components/Footer";
import { Icons } from "../components/design";
import { useAuth } from "../context/AuthContext";

type Billing = "monthly" | "yearly";

interface Feature {
  t: string;
  on: boolean;
}

interface Plan {
  id: "free" | "premium";
  name: string;
  sub: string;
  price: Record<Billing, number>;
  featured?: boolean;
  features: Feature[];
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gratuita",
    sub: "Para el aficionado casual",
    price: { monthly: 0, yearly: 0 },
    features: [
      { t: "Probabilidad de victoria, empate y derrota", on: true },
      { t: "Historial directo · últimos 10 enfrentamientos", on: true },
      { t: "Cluster de estilo de cada selección", on: true },
      { t: "Acceso a las 48 selecciones del Mundial", on: true },
      { t: "Goles esperados por tiempo (1T / 2T)", on: false },
      { t: "Tarjetas amarillas y rojas estimadas", on: false },
      { t: "Corners, posesión y disparos", on: false },
      { t: "Panel de combinadas", on: false },
      { t: "Exportación de informe en PDF", on: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    sub: "Análisis profundo para entender el Mundial",
    price: { monthly: 8, yearly: 72 },
    featured: true,
    features: [
      { t: "Todo lo de la capa gratuita", on: true },
      { t: "Goles esperados por tiempo (1T / 2T)", on: true },
      { t: "Tarjetas amarillas y rojas por equipo", on: true },
      { t: "Tiros de esquina estimados", on: true },
      { t: "Porcentaje de posesión proyectado", on: true },
      { t: "Over / Under 2.5 goles", on: true },
      { t: "Panel de combinadas (legs múltiples)", on: true },
      { t: "Exportación PDF + datos crudos JSON", on: true },
      { t: "Acceso anticipado a nuevos modelos", on: true },
    ],
  },
];

const FAQ = [
  {
    q: "¿Las predicciones son apuestas?",
    a: "No. Son estimaciones probabilísticas basadas en datos históricos. No reemplazan el juicio personal ni constituyen recomendación de apuesta.",
  },
  {
    q: "¿Puedo cancelar Premium?",
    a: "Sí, en cualquier momento desde tu cuenta. Conservas el acceso hasta el final del periodo facturado.",
  },
  {
    q: "¿Qué tan preciso es el modelo?",
    a: "El clasificador XGBoost alcanza 57% de accuracy y 0.526 F1 macro sobre el dataset de prueba (partidos 2018+), comparado con un baseline mayoritario del 47%.",
  },
  {
    q: "¿De dónde vienen los datos?",
    a: "De cuatro datasets públicos de Kaggle, sumando 49.287 partidos internacionales desde 1872 hasta partidos del Mundial 2026 ya disputados.",
  },
];

const COMPARISON = [
  { l: "Selecciones", g: "48", p: "48" },
  { l: "Predicciones diarias", g: "Ilimitado", p: "Ilimitado" },
  { l: "Variables estadísticas", g: "3", p: "12+" },
  { l: "Combinadas", g: "—", p: "Hasta 8 legs" },
  { l: "Exportar PDF", g: "—", p: "Sí" },
  { l: "Soporte", g: "Comunidad", p: "Prioritario" },
];

export function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const { user, isAuthenticated, isPremium } = useAuth();
  const navigate = useNavigate();

  function ctaForPlan(plan: Plan): { label: string; disabled: boolean; onClick: () => void } {
    if (plan.id === "free") {
      if (!isAuthenticated) {
        return {
          label: "Empezar gratis",
          disabled: false,
          onClick: () => navigate("/predict"),
        };
      }
      if (!isPremium) {
        return { label: "Plan actual", disabled: true, onClick: () => {} };
      }
      return {
        label: "Volver al dashboard",
        disabled: false,
        onClick: () => navigate("/predict"),
      };
    }
    // premium
    if (isPremium) {
      return { label: "Plan actual", disabled: true, onClick: () => {} };
    }
    return {
      label: isAuthenticated ? "Activar Premium" : "Iniciar sesión Premium",
      disabled: false,
      onClick: () => navigate("/login"),
    };
  }

  return (
    <div className="page">
      {/* HERO -------------------------------------------------- */}
      <section style={{ padding: "64px 0 32px" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div className="uplabel mb-3">Planes</div>
          <h1
            className="display"
            style={{
              fontSize: "clamp(48px, 7vw, 88px)",
              margin: 0,
              fontWeight: 500,
            }}
          >
            Predicción gratis.
            <br />
            Análisis{" "}
            <span className="serif-it" style={{ color: "var(--accent)" }}>
              completo
            </span>{" "}
            con Premium.
          </h1>
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
            Empieza sin pagar. Si quieres ver más de cerca cómo se comportará
            el partido, hay un plan para eso.
          </p>

          {/* Billing toggle */}
          <div
            className="row gap-1 mt-6"
            style={{
              padding: 4,
              background: "var(--bg-soft)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--line)",
              display: "inline-flex",
            }}
          >
            {(
              [
                { id: "monthly" as const, l: "Mensual" },
                { id: "yearly" as const, l: "Anual · ahorra 25%" },
              ]
            ).map((b) => (
              <button
                key={b.id}
                onClick={() => setBilling(b.id)}
                style={{
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 500,
                  border: 0,
                  borderRadius: 4,
                  background:
                    billing === b.id ? "var(--bg-card)" : "transparent",
                  color: billing === b.id ? "var(--ink)" : "var(--ink-mute)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow:
                    billing === b.id ? "0 1px 2px rgba(0,0,0,.06)" : "none",
                }}
              >
                {b.l}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PLAN CARDS -------------------------------------------- */}
      <section style={{ padding: "40px 0 64px" }}>
        <div className="container" style={{ maxWidth: 920 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {PLANS.map((p) => {
              const cta = ctaForPlan(p);
              return (
                <div
                  key={p.id}
                  className="card"
                  style={{
                    padding: 32,
                    borderColor: p.featured ? "var(--ink)" : "var(--line)",
                    background: p.featured ? "var(--ink)" : "var(--bg-card)",
                    color: p.featured ? "var(--bg)" : "var(--ink)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {p.featured && (
                    <div
                      style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        padding: "3px 8px",
                        borderRadius: 999,
                        background: "var(--accent)",
                        color: "#fff",
                        fontSize: 10,
                        fontFamily: "'Geist Mono', monospace",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >
                      Recomendado
                    </div>
                  )}
                  <div
                    className="uplabel"
                    style={{
                      color: p.featured ? "var(--stone)" : "var(--ink-mute)",
                    }}
                  >
                    {p.sub}
                  </div>
                  <h2
                    className="display mt-2"
                    style={{
                      fontSize: 32,
                      margin: 0,
                      fontWeight: 500,
                      letterSpacing: "-0.025em",
                    }}
                  >
                    {p.name}
                  </h2>

                  <div
                    className="row mt-4"
                    style={{ alignItems: "baseline", gap: 6 }}
                  >
                    <span
                      className="display mono tabnum"
                      style={{
                        fontSize: 64,
                        fontWeight: 500,
                        letterSpacing: "-0.05em",
                        lineHeight: 1,
                      }}
                    >
                      {p.price[billing] === 0
                        ? "$0"
                        : `$${
                            billing === "yearly"
                              ? Math.round(p.price.yearly / 12)
                              : p.price.monthly
                          }`}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        color: p.featured
                          ? "var(--stone)"
                          : "var(--ink-mute)",
                      }}
                    >
                      {p.price[billing] === 0 ? "siempre" : "/ mes"}
                    </span>
                  </div>
                  {billing === "yearly" && p.price.yearly > 0 && (
                    <div
                      className="mono"
                      style={{
                        fontSize: 11,
                        marginTop: 4,
                        color: "var(--accent)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Facturado anualmente · ${p.price.yearly}/año
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 24,
                      paddingTop: 20,
                      borderTop:
                        "1px solid " +
                        (p.featured
                          ? "color-mix(in oklab, var(--bg) 14%, transparent)"
                          : "var(--line)"),
                    }}
                  >
                    {p.features.map((f, i) => (
                      <div
                        key={i}
                        className="row gap-2"
                        style={{ padding: "7px 0", alignItems: "flex-start" }}
                      >
                        <span
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: f.on
                              ? p.featured
                                ? "var(--accent)"
                                : "var(--ink)"
                              : "transparent",
                            border: f.on
                              ? "none"
                              : "1px solid " +
                                (p.featured
                                  ? "color-mix(in oklab, var(--bg) 22%, transparent)"
                                  : "var(--line)"),
                            flexShrink: 0,
                            marginTop: 1,
                            color: "#fff",
                          }}
                        >
                          {f.on && <Icons.check s={10} />}
                        </span>
                        <span
                          style={{
                            fontSize: 13.5,
                            color: f.on
                              ? p.featured
                                ? "var(--bg)"
                                : "var(--ink)"
                              : p.featured
                              ? "color-mix(in oklab, var(--bg) 45%, transparent)"
                              : "var(--ink-mute)",
                            lineHeight: 1.4,
                          }}
                        >
                          {f.t}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={cta.onClick}
                    disabled={cta.disabled}
                    style={{
                      width: "100%",
                      marginTop: 24,
                      padding: "14px",
                      border:
                        "1px solid " +
                        (p.featured ? "var(--accent)" : "var(--ink)"),
                      background: cta.disabled
                        ? "transparent"
                        : p.featured
                        ? "var(--accent)"
                        : "var(--ink)",
                      color: cta.disabled
                        ? p.featured
                          ? "var(--stone)"
                          : "var(--ink-mute)"
                        : p.featured
                        ? "#fff"
                        : "var(--bg)",
                      borderRadius: "var(--radius-md)",
                      cursor: cta.disabled ? "default" : "pointer",
                      fontFamily: "inherit",
                      fontSize: 14,
                      fontWeight: 500,
                      letterSpacing: "-0.005em",
                      opacity: cta.disabled ? 0.6 : 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "background .15s",
                    }}
                  >
                    {cta.label}
                    {!cta.disabled && <Icons.arrow s={14} />}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Comparison table -------------------------------- */}
          <div
            className="mt-8"
            style={{ padding: "24px 0", borderTop: "1px solid var(--line)" }}
          >
            <div className="uplabel mb-4">Comparación rápida</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 24,
              }}
            >
              {COMPARISON.map((c, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid var(--line-soft)",
                  }}
                >
                  <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                    {c.l}
                  </div>
                  <div className="row between mt-2">
                    <span
                      className="mono tabnum"
                      style={{ fontSize: 14, color: "var(--ink-3)" }}
                    >
                      {c.g}
                    </span>
                    <span
                      className="mono tabnum"
                      style={{ fontSize: 14, color: "var(--accent)" }}
                    >
                      {c.p}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ --------------------------------------------- */}
          <div
            className="mt-8"
            style={{ paddingTop: 32, borderTop: "1px solid var(--line)" }}
          >
            <div className="uplabel mb-4">Preguntas frecuentes</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {FAQ.map((f, i) => (
                <div
                  key={i}
                  style={{
                    padding: 16,
                    background: "var(--bg-soft)",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div
                    style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}
                  >
                    {f.q}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--ink-3)",
                      lineHeight: 1.5,
                    }}
                  >
                    {f.a}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {user && (
            <div
              className="mt-8"
              style={{
                padding: 16,
                background: "var(--bg-soft)",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                color: "var(--ink-3)",
                textAlign: "center",
              }}
            >
              Sesión actual:{" "}
              <strong style={{ color: "var(--ink)" }}>{user.username}</strong>{" "}
              ·{" "}
              <span
                className={isPremium ? "" : "mono"}
                style={{ color: isPremium ? "var(--accent)" : "var(--ink-3)" }}
              >
                {isPremium ? "★ Premium" : "Free"}
              </span>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
