import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { TeamSelector } from "../components/TeamSelector";
import { useTeams } from "../hooks/useTeams";

export function HomePage() {
  const navigate = useNavigate();
  const { teams, loading, error } = useTeams();
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [neutral, setNeutral] = useState(true); // Mundial 2026 generalmente neutral

  const canPredict = team1 && team2 && team1 !== team2;

  const handlePredict = () => {
    if (!canPredict) return;
    const params = new URLSearchParams({ team1, team2, neutral: String(neutral) });
    navigate(`/predict?${params.toString()}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <section className="text-center mb-10">
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900">
          Predicción ML para el <span className="text-brand-600">Mundial 2026</span>
        </h1>
        <p className="text-slate-600 mt-3 text-lg max-w-2xl mx-auto">
          Selecciona dos selecciones y obtén la probabilidad de victoria, empate o derrota basada
          en {loading ? "..." : teams.length} equipos analizados con 49k+ partidos internacionales.
        </p>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        {error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-4 mb-4">
            <strong>Error:</strong> {error}. ¿Está el backend corriendo en el puerto 8765?
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TeamSelector
            label="Equipo 1 (local)"
            teams={teams}
            value={team1}
            onChange={setTeam1}
            excludeTeam={team2}
            placeholder={loading ? "Cargando..." : "Selecciona el primer equipo"}
          />
          <TeamSelector
            label="Equipo 2 (visitante)"
            teams={teams}
            value={team2}
            onChange={setTeam2}
            excludeTeam={team1}
            placeholder={loading ? "Cargando..." : "Selecciona el segundo equipo"}
          />
        </div>

        <div className="mt-6 flex items-center gap-2">
          <input
            id="neutral"
            type="checkbox"
            checked={neutral}
            onChange={(e) => setNeutral(e.target.checked)}
            className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
          />
          <label htmlFor="neutral" className="text-sm text-slate-700">
            Sede neutral (como en el Mundial)
          </label>
        </div>

        <button
          onClick={handlePredict}
          disabled={!canPredict}
          className="mt-6 w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors text-lg shadow-sm"
        >
          {canPredict ? "Predecir resultado" : "Selecciona ambos equipos"}
        </button>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
        <FeatureCard
          icon="🤖"
          title="Machine Learning"
          desc="XGBoost entrenado sobre 49k partidos internacionales con features de Elo, rolling stats y head-to-head."
        />
        <FeatureCard
          icon="📊"
          title="Capa Premium"
          desc="Goles esperados por tiempo, tarjetas, corners, posesión y faltas — todo con visualizaciones interactivas."
        />
        <FeatureCard
          icon="🏆"
          title="Mundial 2026"
          desc="Calibrado para predecir partidos del Mundial expandido a 48 selecciones (104 partidos)."
        />
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-1.5">{desc}</p>
    </div>
  );
}
