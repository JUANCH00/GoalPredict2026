import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useTeams } from "../hooks/useTeams";

export function TeamsPage() {
  const { teams, loading, error } = useTeams();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return teams;
    const lower = q.toLowerCase();
    return teams.filter((t) => t.name.toLowerCase().includes(lower));
  }, [teams, q]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display font-bold text-3xl text-slate-900">Selecciones</h1>
      <p className="text-slate-600 mt-1">
        {loading ? "Cargando..." : `${teams.length} selecciones perfiladas con sus clusters`}
      </p>

      <div className="mt-6 mb-4">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar selección..."
          className="w-full sm:max-w-sm px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none transition-colors"
        />
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-4 mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((t) => (
          <Link
            key={t.name}
            to={`/?prefill=${encodeURIComponent(t.name)}`}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-brand-400 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-slate-900">{t.name}</div>
              {t.win_rate !== null && t.win_rate !== undefined && (
                <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {(t.win_rate * 100).toFixed(0)}%W
                </span>
              )}
            </div>
            {t.cluster_label && (
              <div className="text-xs text-slate-500 mt-1 capitalize">{t.cluster_label}</div>
            )}
            <div className="text-xs text-slate-500 mt-2 grid grid-cols-2 gap-1">
              <span>GF/p: {t.avg_goals_for?.toFixed(2) ?? "—"}</span>
              <span>GA/p: {t.avg_goals_against?.toFixed(2) ?? "—"}</span>
            </div>
          </Link>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500">Sin resultados para "{q}"</div>
      )}
    </div>
  );
}
