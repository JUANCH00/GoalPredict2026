import { useEffect, useState } from "react";

import { listTeams } from "../services/api";
import type { Team } from "../types/api";

/**
 * Carga la lista de selecciones desde el backend una sola vez.
 * Filtramos por min_matches=20 para no mostrar selecciones marginales.
 */
export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTeams(undefined, 20)
      .then((data) => {
        // ordenar por win_rate descendente (las mejores arriba)
        data.sort((a, b) => (b.win_rate ?? 0) - (a.win_rate ?? 0));
        setTeams(data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  return { teams, loading, error };
}
