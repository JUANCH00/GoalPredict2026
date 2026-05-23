import type { TeamSummary } from "../types/api";

interface TeamCardProps {
  team: TeamSummary;
  accent: "brand" | "rose";
}

export function TeamCard({ team, accent }: TeamCardProps) {
  const ring =
    accent === "brand"
      ? "ring-brand-300 from-brand-50 to-brand-100"
      : "ring-rose-300 from-rose-50 to-rose-100";
  const text = accent === "brand" ? "text-brand-700" : "text-rose-700";

  return (
    <div className={`bg-gradient-to-br ${ring} ring-2 rounded-2xl p-5`}>
      <div className={`font-display font-bold text-xl ${text}`}>{team.name}</div>
      {team.cluster_label && (
        <div className="text-xs font-medium text-slate-600 mt-1 capitalize">
          {team.cluster_label}
        </div>
      )}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Mini label="Win rate" value={team.win_rate} format="pct" />
        <Mini label="GF/p" value={team.avg_goals_for} format="num" />
        <Mini label="GA/p" value={team.avg_goals_against} format="num" />
      </div>
      {team.n_recent_matches !== null && team.n_recent_matches !== undefined && (
        <div className="text-xs text-slate-500 mt-3">
          {team.n_recent_matches} partidos analizados
        </div>
      )}
    </div>
  );
}

function Mini({
  label,
  value,
  format,
}: {
  label: string;
  value: number | null | undefined;
  format: "pct" | "num";
}) {
  if (value === null || value === undefined) {
    return (
      <div>
        <div className="text-lg font-bold text-slate-400">—</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    );
  }
  const display = format === "pct" ? `${(value * 100).toFixed(0)}%` : value.toFixed(2);
  return (
    <div>
      <div className="text-lg font-bold text-slate-900">{display}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
