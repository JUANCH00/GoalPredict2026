import type { HeadToHeadEntry } from "../types/api";

interface HeadToHeadListProps {
  team1: string;
  matches: HeadToHeadEntry[];
}

export function HeadToHeadList({ team1, matches }: HeadToHeadListProps) {
  if (matches.length === 0) {
    return (
      <div className="text-sm text-slate-500 italic">
        No hay enfrentamientos previos registrados.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {matches.map((m, i) => {
        const t1IsHome = m.home_team === team1;
        const team1Score = t1IsHome ? m.home_score : m.away_score;
        const team2Score = t1IsHome ? m.away_score : m.home_score;
        const team1Won = team1Score > team2Score;
        const team1Lost = team1Score < team2Score;
        const isDraw = team1Score === team2Score;

        const indicator = team1Won
          ? "bg-pitch-500"
          : team1Lost
          ? "bg-rose-500"
          : "bg-slate-400";

        return (
          <li
            key={i}
            className="flex items-center gap-3 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div
              className={`w-1 h-8 rounded-full ${indicator}`}
              aria-hidden
              title={team1Won ? "Victoria" : isDraw ? "Empate" : "Derrota"}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-900 truncate">
                  {m.home_team} <span className="text-slate-400">vs</span> {m.away_team}
                </span>
                <span className="text-sm font-mono font-bold text-slate-900 whitespace-nowrap">
                  {m.home_score} - {m.away_score}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{m.date}</span>
                <span>·</span>
                <span className="truncate">{m.tournament}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
