// Pack de iconos line-only del bundle de diseño.
// Tamaño por defecto 14px, ajustable via prop `s`.

interface IconProps {
  s?: number;
  className?: string;
}

const base = (s: number) => ({
  width: s,
  height: s,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor" as const,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const Icons = {
  arrow: ({ s = 14, className }: IconProps = {}) => (
    <svg {...base(s)} strokeWidth={1.6} className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  arrowDown: ({ s = 14, className }: IconProps = {}) => (
    <svg {...base(s)} strokeWidth={1.6} className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  ),
  check: ({ s = 14, className }: IconProps = {}) => (
    <svg {...base(s)} strokeWidth={2} className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  lock: ({ s = 14, className }: IconProps = {}) => (
    <svg {...base(s)} strokeWidth={1.6} className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  user: ({ s = 14, className }: IconProps = {}) => (
    <svg {...base(s)} strokeWidth={1.6} className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),
  star: ({ s = 14, className }: IconProps = {}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
      <polygon points="12 2 14.7 8.6 22 9.3 16.5 14.2 18 21 12 17.5 6 21 7.5 14.2 2 9.3 9.3 8.6" />
    </svg>
  ),
  swap: ({ s = 14, className }: IconProps = {}) => (
    <svg {...base(s)} strokeWidth={1.6} className={className}>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  download: ({ s = 14, className }: IconProps = {}) => (
    <svg {...base(s)} strokeWidth={1.6} className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  sparkles: ({ s = 14, className }: IconProps = {}) => (
    <svg {...base(s)} strokeWidth={1.5} className={className}>
      <path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4" />
    </svg>
  ),
  bolt: ({ s = 14, className }: IconProps = {}) => (
    <svg {...base(s)} strokeWidth={1.6} className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
};
