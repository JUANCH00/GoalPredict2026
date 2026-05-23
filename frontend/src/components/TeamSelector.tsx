import { useMemo, useState } from "react";

import type { Team } from "../types/api";

interface TeamSelectorProps {
  label: string;
  teams: Team[];
  value: string;
  onChange: (team: string) => void;
  excludeTeam?: string;
  placeholder?: string;
}

export function TeamSelector({
  label,
  teams,
  value,
  onChange,
  excludeTeam,
  placeholder = "Buscar selección...",
}: TeamSelectorProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teams
      .filter((t) => t.name !== excludeTeam)
      .filter((t) => (q ? t.name.toLowerCase().includes(q) : true))
      .slice(0, 30);
  }, [teams, query, excludeTeam]);

  const selected = teams.find((t) => t.name === value);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-white border-2 border-slate-200 hover:border-brand-400 focus:border-brand-500 rounded-xl px-4 py-3 text-left transition-colors"
      >
        {selected ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">{selected.name}</div>
              {selected.cluster_label && (
                <div className="text-xs text-slate-500 mt-0.5">{selected.cluster_label}</div>
              )}
            </div>
            <span className="text-slate-400">▼</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{placeholder}</span>
            <span className="text-slate-400">▼</span>
          </div>
        )}
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-80 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <ul className="overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-500">Sin resultados</li>
            ) : (
              filtered.map((team) => (
                <li key={team.name}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(team.name);
                      setQuery("");
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-brand-50 flex items-center justify-between transition-colors ${
                      team.name === value ? "bg-brand-50" : ""
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-900 text-sm">{team.name}</div>
                      {team.cluster_label && (
                        <div className="text-xs text-slate-500">{team.cluster_label}</div>
                      )}
                    </div>
                    {team.win_rate !== null && team.win_rate !== undefined && (
                      <div className="text-xs font-mono text-slate-600">
                        {(team.win_rate * 100).toFixed(0)}% W
                      </div>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
