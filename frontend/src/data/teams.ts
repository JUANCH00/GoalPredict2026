// Mapeo de selecciones con metadata visual para el TeamMark.
// Las 48 selecciones del Mundial 2026 vienen del bundle de diseño.
//
// El backend devuelve `name` (en inglés, p. ej. "Argentina"). Aquí lo
// resolvemos a TeamMeta con code, conf, rank, primary, secondary.
// Si no hay match, generamos colores y código deterministas desde un hash
// del nombre — esto permite que cualquier selección del CSV de Martj42
// renderice algo razonable aunque no esté en este mapping.

export interface TeamMeta {
  code: string;
  name: string;
  /** Nombre en inglés tal como lo devuelve el backend (puede divergir del display name) */
  backendName: string;
  conf: string;
  rank: number;
  primary: string;
  secondary: string;
}

const RAW: Omit<TeamMeta, "backendName">[] = [
  { code: "ARG", name: "Argentina",        conf: "CONMEBOL", rank: 1,  primary: "#6CACE4", secondary: "#F4D03F" },
  { code: "FRA", name: "Francia",          conf: "UEFA",     rank: 2,  primary: "#1F3A8A", secondary: "#DC2626" },
  { code: "ESP", name: "España",           conf: "UEFA",     rank: 3,  primary: "#C8102E", secondary: "#FFC72C" },
  { code: "BRA", name: "Brasil",           conf: "CONMEBOL", rank: 4,  primary: "#FFCE00", secondary: "#009739" },
  { code: "ENG", name: "Inglaterra",       conf: "UEFA",     rank: 5,  primary: "#FFFFFF", secondary: "#CE1124" },
  { code: "POR", name: "Portugal",         conf: "UEFA",     rank: 6,  primary: "#046A38", secondary: "#DA291C" },
  { code: "NED", name: "Países Bajos",     conf: "UEFA",     rank: 7,  primary: "#F36C21", secondary: "#21468B" },
  { code: "BEL", name: "Bélgica",          conf: "UEFA",     rank: 8,  primary: "#000000", secondary: "#FAE042" },
  { code: "CRO", name: "Croacia",          conf: "UEFA",     rank: 9,  primary: "#FF0000", secondary: "#171796" },
  { code: "ITA", name: "Italia",           conf: "UEFA",     rank: 10, primary: "#0066A1", secondary: "#FFFFFF" },
  { code: "GER", name: "Alemania",         conf: "UEFA",     rank: 11, primary: "#000000", secondary: "#DD0000" },
  { code: "COL", name: "Colombia",         conf: "CONMEBOL", rank: 12, primary: "#FCD116", secondary: "#003893" },
  { code: "URU", name: "Uruguay",          conf: "CONMEBOL", rank: 13, primary: "#7BB3E0", secondary: "#FFFFFF" },
  { code: "MAR", name: "Marruecos",        conf: "CAF",      rank: 14, primary: "#C1272D", secondary: "#006233" },
  { code: "SUI", name: "Suiza",            conf: "UEFA",     rank: 15, primary: "#D52B1E", secondary: "#FFFFFF" },
  { code: "JPN", name: "Japón",            conf: "AFC",      rank: 16, primary: "#BC002D", secondary: "#FFFFFF" },
  { code: "USA", name: "Estados Unidos",   conf: "CONCACAF", rank: 17, primary: "#B22234", secondary: "#3C3B6E" },
  { code: "MEX", name: "México",           conf: "CONCACAF", rank: 18, primary: "#006847", secondary: "#CE1126" },
  { code: "IRN", name: "Irán",             conf: "AFC",      rank: 19, primary: "#239F40", secondary: "#DA0000" },
  { code: "SEN", name: "Senegal",          conf: "CAF",      rank: 20, primary: "#00853F", secondary: "#FDEF42" },
  { code: "DEN", name: "Dinamarca",        conf: "UEFA",     rank: 21, primary: "#C8102E", secondary: "#FFFFFF" },
  { code: "KOR", name: "Corea del Sur",    conf: "AFC",      rank: 22, primary: "#003478", secondary: "#C8102E" },
  { code: "AUS", name: "Australia",        conf: "AFC",      rank: 23, primary: "#012169", secondary: "#FFCD00" },
  { code: "POL", name: "Polonia",          conf: "UEFA",     rank: 24, primary: "#DC143C", secondary: "#FFFFFF" },
  { code: "AUT", name: "Austria",          conf: "UEFA",     rank: 25, primary: "#ED2939", secondary: "#FFFFFF" },
  { code: "EGY", name: "Egipto",           conf: "CAF",      rank: 26, primary: "#CE1126", secondary: "#000000" },
  { code: "TUR", name: "Turquía",          conf: "UEFA",     rank: 27, primary: "#E30A17", secondary: "#FFFFFF" },
  { code: "NGA", name: "Nigeria",          conf: "CAF",      rank: 28, primary: "#008751", secondary: "#FFFFFF" },
  { code: "SRB", name: "Serbia",           conf: "UEFA",     rank: 29, primary: "#C6363C", secondary: "#0C4076" },
  { code: "ECU", name: "Ecuador",          conf: "CONMEBOL", rank: 30, primary: "#FFD100", secondary: "#003893" },
  { code: "CAN", name: "Canadá",           conf: "CONCACAF", rank: 31, primary: "#FF0000", secondary: "#FFFFFF" },
  { code: "CRC", name: "Costa Rica",       conf: "CONCACAF", rank: 32, primary: "#002B7F", secondary: "#CE1126" },
  { code: "PAR", name: "Paraguay",         conf: "CONMEBOL", rank: 33, primary: "#D52B1E", secondary: "#0038A8" },
  { code: "CHI", name: "Chile",            conf: "CONMEBOL", rank: 34, primary: "#D52B1E", secondary: "#0039A6" },
  { code: "NOR", name: "Noruega",          conf: "UEFA",     rank: 35, primary: "#BA0C2F", secondary: "#00205B" },
  { code: "GHA", name: "Ghana",            conf: "CAF",      rank: 36, primary: "#CE1126", secondary: "#FCD116" },
  { code: "KSA", name: "Arabia Saudita",   conf: "AFC",      rank: 37, primary: "#006C35", secondary: "#FFFFFF" },
  { code: "SCO", name: "Escocia",          conf: "UEFA",     rank: 38, primary: "#0065BD", secondary: "#FFFFFF" },
  { code: "PER", name: "Perú",             conf: "CONMEBOL", rank: 39, primary: "#D91023", secondary: "#FFFFFF" },
  { code: "TUN", name: "Túnez",            conf: "CAF",      rank: 40, primary: "#E70013", secondary: "#FFFFFF" },
  { code: "CIV", name: "Costa de Marfil",  conf: "CAF",      rank: 41, primary: "#F77F00", secondary: "#009E60" },
  { code: "QAT", name: "Catar",            conf: "AFC",      rank: 42, primary: "#8A1538", secondary: "#FFFFFF" },
  { code: "PAN", name: "Panamá",           conf: "CONCACAF", rank: 43, primary: "#D21034", secondary: "#005AA7" },
  { code: "JAM", name: "Jamaica",          conf: "CONCACAF", rank: 44, primary: "#FED100", secondary: "#009B3A" },
  { code: "CMR", name: "Camerún",          conf: "CAF",      rank: 45, primary: "#007A5E", secondary: "#CE1126" },
  { code: "NZL", name: "Nueva Zelanda",    conf: "OFC",      rank: 46, primary: "#FFFFFF", secondary: "#012169" },
  { code: "UZB", name: "Uzbekistán",       conf: "AFC",      rank: 47, primary: "#1EB53A", secondary: "#0099B5" },
  { code: "CPV", name: "Cabo Verde",       conf: "CAF",      rank: 48, primary: "#003893", secondary: "#CF2027" },
];

// El backend devuelve los nombres en inglés (Martj42). Mapeamos del nombre
// EN a la metadata. Si el nombre coincide con `name` (display ES) también.
const BACKEND_NAME_ALIASES: Record<string, string> = {
  Argentina: "ARG", France: "FRA", Spain: "ESP", Brazil: "BRA", England: "ENG",
  Portugal: "POR", Netherlands: "NED", Belgium: "BEL", Croatia: "CRO", Italy: "ITA",
  Germany: "GER", Colombia: "COL", Uruguay: "URU", Morocco: "MAR", Switzerland: "SUI",
  Japan: "JPN", "United States": "USA", Mexico: "MEX", Iran: "IRN", Senegal: "SEN",
  Denmark: "DEN", "South Korea": "KOR", Australia: "AUS", Poland: "POL", Austria: "AUT",
  Egypt: "EGY", Turkey: "TUR", "Türkiye": "TUR", Nigeria: "NGA", Serbia: "SRB",
  Ecuador: "ECU", Canada: "CAN", "Costa Rica": "CRC", Paraguay: "PAR", Chile: "CHI",
  Norway: "NOR", Ghana: "GHA", "Saudi Arabia": "KSA", Scotland: "SCO", Peru: "PER",
  Tunisia: "TUN", "Ivory Coast": "CIV", "Côte d'Ivoire": "CIV", Qatar: "QAT",
  Panama: "PAN", Jamaica: "JAM", Cameroon: "CMR", "New Zealand": "NZL",
  Uzbekistan: "UZB", "Cape Verde": "CPV",
};

export const TEAMS: TeamMeta[] = RAW.map((t) => {
  // backendName: encontramos la primera key de alias que apunta a este code,
  // o usamos el name display.
  const alias = Object.entries(BACKEND_NAME_ALIASES).find(([, code]) => code === t.code);
  return { ...t, backendName: alias?.[0] ?? t.name };
});

const BY_CODE = new Map(TEAMS.map((t) => [t.code, t]));
const BY_NAME = new Map<string, TeamMeta>();
for (const t of TEAMS) {
  BY_NAME.set(t.name.toLowerCase(), t);
  BY_NAME.set(t.backendName.toLowerCase(), t);
}
for (const [alias, code] of Object.entries(BACKEND_NAME_ALIASES)) {
  const meta = BY_CODE.get(code);
  if (meta) BY_NAME.set(alias.toLowerCase(), meta);
}

// ---------------------------------------------------------------------------
// Fallback determinista para nombres no mapeados (selecciones marginales).
// Genera un code de 3 letras y dos colores con hue derivados de un hash FNV.

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function hsl(h: number, s: number, l: number): string {
  return `hsl(${h} ${s}% ${l}%)`;
}

function fallbackCode(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (cleaned.length <= 3) return cleaned.padEnd(3, "X");
  // Tomar consonantes "fuertes" primero
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0] + (parts[2]?.[0] ?? parts[0][1] ?? "X"))
      .toUpperCase()
      .slice(0, 3)
      .padEnd(3, "X");
  }
  return cleaned.slice(0, 3);
}

function fallbackMeta(name: string): TeamMeta {
  const h = fnv1a(name);
  const hue1 = h % 360;
  const hue2 = (hue1 + 140 + (h % 80)) % 360;
  return {
    code: fallbackCode(name),
    name,
    backendName: name,
    conf: "—",
    rank: 999,
    primary: hsl(hue1, 65, 45),
    secondary: hsl(hue2, 70, 55),
  };
}

// ---------------------------------------------------------------------------
// API pública

/** Resuelve metadata visual desde el `team_name` del backend o el code interno. */
export function getTeamMeta(nameOrCode: string | null | undefined): TeamMeta | null {
  if (!nameOrCode) return null;
  const trimmed = nameOrCode.trim();
  if (!trimmed) return null;
  const byCode = BY_CODE.get(trimmed.toUpperCase());
  if (byCode) return byCode;
  const byName = BY_NAME.get(trimmed.toLowerCase());
  if (byName) return byName;
  return fallbackMeta(trimmed);
}

/** Lista de selecciones del Mundial 2026 (orden por ranking FIFA). */
export const WC2026_TEAMS = TEAMS;
