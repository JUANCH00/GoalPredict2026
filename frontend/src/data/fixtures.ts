// Calendario inventado de Mundial 2026 — ilustrativo para FixtureCard.
// Cuando llegue el calendario real podemos cambiar a una fuente live.

export interface Fixture {
  phase: string;
  date: string;
  kick: string;
  /** Nombre que el backend reconoce (en inglés) */
  a: string;
  /** Idem */
  b: string;
  venue: string;
  group: string;
}

export const FIXTURES_2026: Fixture[] = [
  { phase: "Fase de grupos", date: "2026-06-11", kick: "20:00", a: "Mexico",        b: "Portugal",   venue: "Estadio Azteca, CDMX",    group: "A" },
  { phase: "Fase de grupos", date: "2026-06-12", kick: "15:00", a: "Canada",        b: "Belgium",    venue: "BMO Field, Toronto",       group: "B" },
  { phase: "Fase de grupos", date: "2026-06-12", kick: "21:00", a: "United States", b: "England",    venue: "SoFi Stadium, LA",         group: "C" },
  { phase: "Fase de grupos", date: "2026-06-13", kick: "17:00", a: "Argentina",     b: "South Korea",venue: "MetLife, NJ",              group: "D" },
  { phase: "Fase de grupos", date: "2026-06-13", kick: "20:00", a: "Brazil",        b: "Japan",      venue: "AT&T Stadium, Dallas",     group: "E" },
  { phase: "Fase de grupos", date: "2026-06-14", kick: "14:00", a: "France",        b: "Croatia",    venue: "Lincoln Financial, PHI",   group: "F" },
  { phase: "Fase de grupos", date: "2026-06-14", kick: "17:00", a: "Spain",         b: "Morocco",    venue: "Hard Rock, Miami",         group: "G" },
  { phase: "Fase de grupos", date: "2026-06-15", kick: "21:00", a: "Colombia",      b: "Netherlands",venue: "Mercedes-Benz, Atlanta",   group: "H" },
];
