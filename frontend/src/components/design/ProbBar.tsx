import { useEffect, useState } from "react";

interface ProbBarProps {
  /** P(victoria team1) — 0..1 */
  a: number;
  /** P(empate) — 0..1 */
  draw: number;
  /** P(victoria team2) — 0..1 */
  b: number;
  animate?: boolean;
  height?: number;
  showLabels?: boolean;
}

/**
 * Barra tricolor de probabilidades W/D/L con animación de crecimiento.
 * Estilo apuestas pero refinado.
 */
export function ProbBar({
  a,
  draw,
  b,
  animate = true,
  height = 10,
  showLabels = true,
}: ProbBarProps) {
  const [shown, setShown] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setShown(true), 120);
    return () => clearTimeout(t);
  }, [animate]);

  const pa = Math.round(a * 100);
  const pd = Math.round(draw * 100);
  const pb = 100 - pa - pd;

  return (
    <div>
      <div
        style={{
          display: "flex",
          width: "100%",
          height,
          borderRadius: 999,
          overflow: "hidden",
          background: "var(--line-soft)",
          border: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            width: shown ? `${pa}%` : 0,
            background: "var(--ink)",
            transition: "width 1.1s cubic-bezier(.2,.7,.2,1)",
          }}
        />
        <div
          style={{
            width: shown ? `${pd}%` : 0,
            background: "var(--stone)",
            transition: "width 1.1s cubic-bezier(.2,.7,.2,1) .05s",
          }}
        />
        <div
          style={{
            width: shown ? `${pb}%` : 0,
            background: "var(--accent)",
            transition: "width 1.1s cubic-bezier(.2,.7,.2,1) .1s",
          }}
        />
      </div>
      {showLabels && (
        <div
          className="row between mt-2 mono tabnum"
          style={{ fontSize: 11, color: "var(--ink-mute)" }}
        >
          <span style={{ color: "var(--ink)" }}>{pa}%</span>
          <span>{pd}%</span>
          <span style={{ color: "var(--accent)" }}>{pb}%</span>
        </div>
      )}
    </div>
  );
}
