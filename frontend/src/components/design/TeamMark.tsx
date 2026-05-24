import type { TeamMeta } from "../../data/teams";

interface TeamMarkProps {
  team: TeamMeta | null | undefined;
  size?: number;
}

/**
 * Identidad mínima generada: círculo con bandas verticales de dos colores
 * y el código de 3 letras encima. NO una bandera real — placeholder
 * abstracto del país.
 */
export function TeamMark({ team, size = 36 }: TeamMarkProps) {
  if (!team) {
    return (
      <div
        className="team-mark"
        style={{ width: size, height: size, fontSize: size * 0.3 }}
      >
        <span>—</span>
      </div>
    );
  }

  const bg = `linear-gradient(90deg, ${team.primary} 50%, ${team.secondary} 50%)`;

  return (
    <div
      className="team-mark"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.28,
        background: bg,
        border: "1px solid rgba(0,0,0,.12)",
      }}
      aria-label={team.name}
    >
      <span
        style={{
          position: "relative",
          zIndex: 2,
          color: "#fff",
          textShadow: "0 0 1px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.35)",
        }}
      >
        {team.code}
      </span>
    </div>
  );
}
