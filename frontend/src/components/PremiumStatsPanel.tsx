import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { PremiumPrediction } from "../types/api";

interface PremiumStatsPanelProps {
  prediction: PremiumPrediction;
}

export function PremiumStatsPanel({ prediction }: PremiumStatsPanelProps) {
  const { team1, team2, expected_total_goals, over_2_5_probability, goals_by_half, cards, match_stats } =
    prediction;

  // Datos para el gráfico de barras de goles por tiempo
  const goalsByHalfData = [
    {
      tiempo: "1er Tiempo",
      [team1.name]: parseFloat(goals_by_half.team1_first_half.toFixed(2)),
      [team2.name]: parseFloat(goals_by_half.team2_first_half.toFixed(2)),
    },
    {
      tiempo: "2do Tiempo",
      [team1.name]: parseFloat(goals_by_half.team1_second_half.toFixed(2)),
      [team2.name]: parseFloat(goals_by_half.team2_second_half.toFixed(2)),
    },
  ];

  // Datos para el radar chart de stats avanzadas (normalizado a 0-100)
  const radarData = [
    {
      stat: "Posesión %",
      [team1.name]: match_stats.team1_possession,
      [team2.name]: match_stats.team2_possession,
    },
    {
      stat: "Corners ×10",
      [team1.name]: match_stats.team1_corners * 10,
      [team2.name]: match_stats.team2_corners * 10,
    },
    {
      stat: "Intentos ×5",
      [team1.name]: match_stats.team1_attempts * 5,
      [team2.name]: match_stats.team2_attempts * 5,
    },
    {
      stat: "Al arco ×10",
      [team1.name]: match_stats.team1_on_target * 10,
      [team2.name]: match_stats.team2_on_target * 10,
    },
    {
      stat: "Faltas ×5",
      [team1.name]: match_stats.team1_fouls * 5,
      [team2.name]: match_stats.team2_fouls * 5,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header con goles esperados y Over/Under */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon="⚽"
          label="Goles totales esperados"
          value={expected_total_goals.toFixed(2)}
          sub={`Promedio histórico ≈ 2.5`}
          accent="brand"
        />
        <StatCard
          icon="🎯"
          label="Probabilidad Over 2.5"
          value={`${(over_2_5_probability * 100).toFixed(1)}%`}
          sub={over_2_5_probability >= 0.5 ? "Más probable Over" : "Más probable Under"}
          accent={over_2_5_probability >= 0.5 ? "pitch" : "rose"}
        />
      </div>

      {/* Goles por tiempo */}
      <Section title="🕐 Goles esperados por tiempo">
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={goalsByHalfData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="tiempo" stroke="#475569" />
              <YAxis stroke="#475569" />
              <Tooltip />
              <Legend />
              <Bar dataKey={team1.name} fill="#178bf6" radius={[6, 6, 0, 0]} />
              <Bar dataKey={team2.name} fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* Disciplina */}
      <Section title="🟨 Disciplina esperada">
        <div className="grid grid-cols-2 gap-4">
          <CardsCard
            team={team1.name}
            yellow={cards.team1_expected_yellow}
            redProb={cards.team1_red_card_probability}
            color="brand"
          />
          <CardsCard
            team={team2.name}
            yellow={cards.team2_expected_yellow}
            redProb={cards.team2_red_card_probability}
            color="rose"
          />
        </div>
      </Section>

      {/* Stats avanzadas — Radar */}
      <Section title="📊 Comparativa de estilo (WC2022)">
        <div className="h-72">
          <ResponsiveContainer>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis dataKey="stat" tick={{ fill: "#475569", fontSize: 12 }} />
              <PolarRadiusAxis tick={{ fill: "#94a3b8" }} />
              <Radar
                name={team1.name}
                dataKey={team1.name}
                stroke="#178bf6"
                fill="#178bf6"
                fillOpacity={0.4}
              />
              <Radar
                name={team2.name}
                dataKey={team2.name}
                stroke="#f43f5e"
                fill="#f43f5e"
                fillOpacity={0.4}
              />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Valores escalados para visualización en una sola gráfica. Stats reales abajo.
        </p>
      </Section>

      {/* Tabla de stats crudas */}
      <Section title="📋 Stats por equipo (promedio histórico)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-200">
                <th className="py-2 pr-4 font-semibold text-slate-600">Stat</th>
                <th className="py-2 px-4 font-semibold text-brand-600">{team1.name}</th>
                <th className="py-2 px-4 font-semibold text-rose-600">{team2.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <StatsRow label="Posesión (%)" v1={match_stats.team1_possession} v2={match_stats.team2_possession} unit="%" />
              <StatsRow label="Tiros de esquina" v1={match_stats.team1_corners} v2={match_stats.team2_corners} />
              <StatsRow label="Intentos totales" v1={match_stats.team1_attempts} v2={match_stats.team2_attempts} />
              <StatsRow label="Tiros al arco" v1={match_stats.team1_on_target} v2={match_stats.team2_on_target} />
              <StatsRow label="Faltas" v1={match_stats.team1_fouls} v2={match_stats.team2_fouls} />
              <StatsRow label="Tarjetas amarillas" v1={cards.team1_expected_yellow} v2={cards.team2_expected_yellow} />
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

// --- Subcomponentes -------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display font-semibold text-lg text-slate-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  accent: "brand" | "pitch" | "rose";
}) {
  const ring =
    accent === "brand" ? "ring-brand-200" : accent === "pitch" ? "ring-pitch-200" : "ring-rose-200";
  const text =
    accent === "brand" ? "text-brand-600" : accent === "pitch" ? "text-pitch-600" : "text-rose-600";

  return (
    <div className={`bg-white border-2 ring-2 ring-offset-1 ${ring} rounded-xl p-5`}>
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{label}</div>
      <div className={`mt-1 text-3xl font-display font-bold ${text}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

function CardsCard({
  team,
  yellow,
  redProb,
  color,
}: {
  team: string;
  yellow: number;
  redProb: number;
  color: "brand" | "rose";
}) {
  const borderColor = color === "brand" ? "border-brand-200" : "border-rose-200";

  return (
    <div className={`bg-white border-2 ${borderColor} rounded-xl p-4`}>
      <div className="font-semibold text-slate-900 mb-3 text-sm truncate">{team}</div>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-6 h-8 bg-yellow-400 rounded-sm" aria-label="Tarjeta amarilla" />
        <div>
          <div className="text-2xl font-bold text-slate-900">{yellow.toFixed(1)}</div>
          <div className="text-xs text-slate-500">esperadas</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-6 h-8 bg-rose-500 rounded-sm" aria-label="Tarjeta roja" />
        <div>
          <div className="text-2xl font-bold text-slate-900">{(redProb * 100).toFixed(0)}%</div>
          <div className="text-xs text-slate-500">prob. roja</div>
        </div>
      </div>
    </div>
  );
}

function StatsRow({
  label,
  v1,
  v2,
  unit = "",
}: {
  label: string;
  v1: number;
  v2: number;
  unit?: string;
}) {
  const fmt = (v: number) => `${v.toFixed(2)}${unit}`;
  const max = Math.max(v1, v2);
  const team1Wins = v1 > v2;
  const team2Wins = v2 > v1;

  return (
    <tr>
      <td className="py-2 pr-4 text-slate-700">{label}</td>
      <td
        className={`py-2 px-4 font-mono ${
          team1Wins ? "font-bold text-brand-700" : "text-slate-600"
        }`}
      >
        {fmt(v1)}
      </td>
      <td
        className={`py-2 px-4 font-mono ${
          team2Wins ? "font-bold text-rose-700" : "text-slate-600"
        }`}
      >
        {fmt(v2)}
      </td>
    </tr>
  );
}
