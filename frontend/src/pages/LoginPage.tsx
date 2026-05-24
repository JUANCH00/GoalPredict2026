import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Icons } from "../components/design";
import { useAuth } from "../context/AuthContext";
import * as api from "../services/api";

type Tab = "login" | "register";

/** Auth — login + registro con panel editorial oscuro al lado. */
export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tier, setTier] = useState<"free" | "premium">("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (username.trim().length < 3) {
      setError("El usuario debe tener al menos 3 caracteres");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      if (tab === "register") {
        await fetch("/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, tier }),
        }).then(async (r) => {
          if (!r.ok) {
            const body = await r.json().catch(() => ({}));
            throw new Error(body.detail ?? `${r.status} ${r.statusText}`);
          }
        });
      }
      await login(username, password);
      navigate("/predict");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de autenticación");
    } finally {
      setLoading(false);
    }
  }

  async function demoLogin(plan: "free" | "premium") {
    setError(null);
    setLoading(true);
    try {
      const creds =
        plan === "premium"
          ? { u: "premium_user", p: "premium123" }
          : { u: "free_user", p: "free123" };
      await login(creds.u, creds.p);
      navigate("/predict");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error con demo");
    } finally {
      setLoading(false);
    }
  }

  const heading =
    tab === "login" ? (
      <>
        Bienvenido
        <br />
        <span className="serif-it" style={{ color: "var(--accent)" }}>
          de vuelta.
        </span>
      </>
    ) : (
      <>
        Empieza a
        <br />
        <span className="serif-it" style={{ color: "var(--accent)" }}>
          predecir.
        </span>
      </>
    );

  return (
    <div
      className="page auth-grid"
      style={{
        minHeight: "calc(100vh - 60px)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      {/* IZQUIERDA — formulario */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div className="uplabel mb-3">
            {tab === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </div>
          <h1
            className="display"
            style={{ fontSize: 44, margin: 0, fontWeight: 500 }}
          >
            {heading}
          </h1>

          {/* Tab switcher */}
          <div
            className="row"
            style={{
              marginTop: 32,
              gap: 0,
              padding: 4,
              background: "var(--bg-soft)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--line)",
              width: "fit-content",
            }}
          >
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError(null);
                }}
                style={{
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  border: 0,
                  borderRadius: 4,
                  background: tab === t ? "var(--bg-card)" : "transparent",
                  color: tab === t ? "var(--ink)" : "var(--ink-mute)",
                  cursor: "pointer",
                  boxShadow: tab === t ? "0 1px 2px rgba(0,0,0,.04)" : "none",
                  fontFamily: "inherit",
                }}
              >
                {t === "login" ? "Entrar" : "Crear cuenta"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            <div className="mb-4">
              <label
                className="uplabel"
                style={{ display: "block", marginBottom: 8 }}
              >
                Usuario
              </label>
              <input
                className="input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej. juancho_uptc"
                autoComplete="username"
              />
            </div>
            <div className="mb-4">
              <label
                className="uplabel"
                style={{ display: "block", marginBottom: 8 }}
              >
                Contraseña
              </label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={
                  tab === "login" ? "current-password" : "new-password"
                }
              />
            </div>

            {tab === "register" && (
              <div className="mb-4">
                <label
                  className="uplabel"
                  style={{ display: "block", marginBottom: 8 }}
                >
                  Plan
                </label>
                <div
                  className="row gap-2"
                  style={{
                    padding: 4,
                    background: "var(--bg-soft)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--line)",
                  }}
                >
                  {(["free", "premium"] as const).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setTier(p)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        fontSize: 13,
                        fontWeight: 500,
                        border: 0,
                        borderRadius: 4,
                        background:
                          tier === p ? "var(--bg-card)" : "transparent",
                        color: tier === p ? "var(--ink)" : "var(--ink-mute)",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {p === "free" ? "Free" : "Premium ★"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: 10,
                  marginBottom: 12,
                  fontSize: 13,
                  color: "var(--loss)",
                  background:
                    "color-mix(in oklab, var(--loss) 8%, var(--bg))",
                  borderRadius: 4,
                  border:
                    "1px solid color-mix(in oklab, var(--loss) 25%, var(--line))",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn accent lg"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={loading}
            >
              {loading
                ? "Procesando..."
                : tab === "login"
                ? "Entrar"
                : "Crear cuenta"}
              {!loading && <Icons.arrow s={14} />}
            </button>
          </form>

          <div
            style={{
              marginTop: 24,
              padding: "16px 0",
              borderTop: "1px solid var(--line)",
            }}
          >
            <div className="uplabel mb-3">Probar sin registro</div>
            <div className="row gap-2">
              <button
                className="btn sm ghost"
                onClick={() => demoLogin("free")}
                disabled={loading}
                style={{ flex: 1, justifyContent: "center" }}
              >
                Demo gratuita
              </button>
              <button
                className="btn sm"
                onClick={() => demoLogin("premium")}
                disabled={loading}
                style={{ flex: 1, justifyContent: "center" }}
              >
                Demo Premium
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DERECHA — pieza editorial */}
      <div
        className="auth-side"
        style={{
          background: "var(--ink)",
          color: "var(--bg)",
          padding: 48,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="row gap-3">
          <div
            style={{
              width: 22,
              height: 22,
              background: "var(--bg)",
              borderRadius: "50%",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 4,
                border: "1px solid var(--ink)",
                borderRadius: "50%",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "-0.02em",
            }}
          >
            GoalPredict <span className="serif-it">'26</span>
          </div>
        </div>

        <div>
          <div
            className="uplabel mb-4"
            style={{ color: "var(--accent)" }}
          >
            Mundial 2026 · USA · CAN · MEX
          </div>
          <div
            className="display"
            style={{
              fontSize: "clamp(40px, 5vw, 72px)",
              fontWeight: 500,
              lineHeight: 0.95,
            }}
          >
            104 partidos.
            <br />
            <span
              className="serif-it"
              style={{ color: "var(--accent)" }}
            >
              48
            </span>{" "}
            selecciones.
            <br />
            Una sola plataforma.
          </div>
          <div
            style={{
              marginTop: 28,
              maxWidth: 360,
              fontSize: 15,
              lineHeight: 1.55,
              color: "var(--stone)",
            }}
          >
            Acceso al modelo de clasificación gratuito y a estadísticas
            premium con detalle por tiempo, tarjetas, corners y posesión.
          </div>
        </div>

        <div
          className="row gap-6"
          style={{
            paddingTop: 24,
            borderTop: "1px solid color-mix(in oklab, var(--bg) 14%, transparent)",
          }}
        >
          {[
            { n: "49k", l: "Partidos" },
            { n: "57%", l: "Accuracy" },
            { n: "<3s", l: "Respuesta" },
          ].map((m) => (
            <div key={m.l}>
              <div
                className="display mono tabnum"
                style={{
                  fontSize: 32,
                  fontWeight: 500,
                  letterSpacing: "-0.04em",
                }}
              >
                {m.n}
              </div>
              <div className="uplabel" style={{ color: "var(--stone)" }}>
                {m.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* responsive: ocultar panel derecho en móvil */}
      <style>{`
        @media (max-width: 860px) {
          .auth-grid { grid-template-columns: 1fr !important; }
          .auth-side { display: none !important; }
        }
      `}</style>
    </div>
  );
}
