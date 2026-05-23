import type { ResultProbabilities } from "../types/api";

interface ProbabilityBarProps {
  team1Name: string;
  team2Name: string;
  probabilities: ResultProbabilities;
}

export function ProbabilityBar({
  team1Name,
  team2Name,
  probabilities,
}: ProbabilityBarProps) {
  const { home_win, draw, away_win } = probabilities;
  const fmt = (p: number) => (p * 100).toFixed(1);

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 text-center mb-3">
        <div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-brand-600">
            {fmt(home_win)}%
          </div>
          <div className="text-xs sm:text-sm font-medium text-slate-700 mt-1 truncate">
            {team1Name}
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-amber-500">
            {fmt(draw)}%
          </div>
          <div className="text-xs sm:text-sm font-medium text-slate-700 mt-1">Empate</div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-rose-500">
            {fmt(away_win)}%
          </div>
          <div className="text-xs sm:text-sm font-medium text-slate-700 mt-1 truncate">
            {team2Name}
          </div>
        </div>
      </div>

      <div className="h-3 rounded-full overflow-hidden flex bg-slate-200">
        <div
          className="bg-brand-500 transition-all"
          style={{ width: `${home_win * 100}%` }}
          title={`${team1Name}: ${fmt(home_win)}%`}
        />
        <div
          className="bg-amber-400 transition-all"
          style={{ width: `${draw * 100}%` }}
          title={`Empate: ${fmt(draw)}%`}
        />
        <div
          className="bg-rose-500 transition-all"
          style={{ width: `${away_win * 100}%` }}
          title={`${team2Name}: ${fmt(away_win)}%`}
        />
      </div>
    </div>
  );
}
