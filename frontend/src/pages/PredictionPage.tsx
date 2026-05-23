import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { HeadToHeadList } from "../components/HeadToHeadList";
import { PremiumLockedCard } from "../components/PremiumLockedCard";
import { PremiumStatsPanel } from "../components/PremiumStatsPanel";
import { ProbabilityBar } from "../components/ProbabilityBar";
import { TeamCard } from "../components/TeamCard";
import { useAuth } from "../context/AuthContext";
import { predictResult, predictStats } from "../services/api";
import type { FreePrediction, PremiumPrediction } from "../types/api";

export function PredictionPage() {
  const [params] = useSearchParams();
  const { isPremium } = useAuth();
  const team1 = params.get("team1") ?? "";
  const team2 = params.get("team2") ?? "";
  const neutral = params.get("neutral") === "true";

  const [free, setFree] = useState<FreePrediction | null>(null);
  const [premium, setPremium] = useState<PremiumPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!team1 || !team2) {
      setError("Faltan equipos en la URL. Vuelve al inicio.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setFree(null);
    setPremium(null);

    const run = async () => {
      try {
        if (isPremium) {
          const data = await predictStats({ team1, team2, neutral });
          setPremium(data);
          setFree(data); // PremiumPrediction extiende FreePrediction
        } else {
          const data = await predictResult({ team1, team2, neutral });
          setFree(data);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [team1, team2, neutral, isPremium]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent" />
        <p className="text-slate-600 mt-4">Calculando predicción...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-6">
          <h2 className="font-semibold text-lg">Error</h2>
          <p className="mt-2">{error}</p>
          <Link to="/" className="inline-block mt-4 text-brand-600 hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (!free) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
          ← Nueva predicción
        </Link>
        {neutral && (
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
            Sede neutral
          </span>
        )}
      </div>

      {/* Cards de los dos equipos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TeamCard team={free.team1} accent="brand" />
        <TeamCard team={free.team2} accent="rose" />
      </div>

      {/* Predicción W/D/L */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h2 className="font-display font-bold text-2xl text-slate-900 mb-1">
          Probabilidad de resultado
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Modelo: <span className="font-mono">{(free.model_info?.model_name as string) ?? "—"}</span>
        </p>
        <ProbabilityBar
          team1Name={free.team1.name}
          team2Name={free.team2.name}
          probabilities={free.probabilities}
        />
      </section>

      {/* Head-to-Head */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h2 className="font-display font-bold text-2xl text-slate-900 mb-1">
          Últimos enfrentamientos
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Historial directo desde la perspectiva de {free.team1.name}
        </p>
        <HeadToHeadList team1={free.team1.name} matches={free.head_to_head_recent} />
      </section>

      {/* Capa premium o lock */}
      {premium ? (
        <section className="bg-white rounded-2xl shadow-sm border-2 border-amber-200 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">⭐</span>
            <h2 className="font-display font-bold text-2xl text-slate-900">Análisis Premium</h2>
          </div>
          <PremiumStatsPanel prediction={premium} />
        </section>
      ) : (
        <PremiumLockedCard />
      )}
    </div>
  );
}
