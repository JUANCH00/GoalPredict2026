import { Link } from "react-router-dom";

/** Footer editorial con 4 columnas y disclaimer al pie. */
export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div>
          <div className="brand" style={{ marginBottom: 12 }}>
            <div className="brand-mark" />
            <span>
              GoalPredict <span className="serif-it">'26</span>
            </span>
          </div>
          <div style={{ maxWidth: 280, lineHeight: 1.55 }}>
            Plataforma de predicción deportiva con Machine Learning para el
            Mundial FIFA 2026.
          </div>
          <div
            className="mt-4 mono"
            style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--ink-mute)" }}
          >
            UPTC · Ingeniería de Sistemas · 2026
          </div>
        </div>
        <div>
          <h4>Producto</h4>
          <Link to="/predict">Dashboard</Link>
          <Link to="/teams">Equipos</Link>
          <Link to="/pricing">Planes</Link>
          <Link to="/login">Iniciar sesión</Link>
        </div>
        <div>
          <h4>Modelo</h4>
          <a>Metodología CRISP-DM</a>
          <a>Datasets Kaggle</a>
          <a>API REST</a>
          <a>Documentación</a>
        </div>
        <div>
          <h4>Equipo</h4>
          <a>Juan E. Moreno</a>
          <a>David S. Naranjo</a>
          <a
            href="https://github.com/JUANCH00/GoalPredict2026"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
      <div
        className="container"
        style={{
          display: "block",
          marginTop: 48,
          paddingTop: 24,
          borderTop: "1px solid var(--line-soft)",
          fontSize: 12,
        }}
      >
        <div
          className="row between"
          style={{ flexWrap: "wrap", gap: 12 }}
        >
          <span className="mono" style={{ letterSpacing: "0.08em" }}>
            v 0.1.0 — Modelo entrenado el 21·04·2026
          </span>
          <span>
            Las predicciones son estimaciones basadas en datos históricos. No
            constituyen recomendación de apuesta.
          </span>
        </div>
      </div>
    </footer>
  );
}
