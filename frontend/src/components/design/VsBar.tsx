import { useEffect, useState } from "react";

interface VsBarProps {
  a: number;
  b: number;
  max?: number;
  format?: (v: number) => string;
  animate?: boolean;
}

/**
 * Par de barras enfrentadas (team1 a la izquierda, team2 a la derecha)
 * con un divisor central. Usado para stats como posesión, corners, etc.
 */
export function VsBar({
  a,
  b,
  max,
  format = (v) => String(v),
  animate = true,
}: VsBarProps) {
  const [shown, setShown] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setShown(true), 100);
    return () => clearTimeout(t);
  }, [animate]);

  const m = max || Math.max(a, b);
  const wa = shown ? (a / m) * 100 : 0;
  const wb = shown ? (b / m) * 100 : 0;

  return (
    <div
      className="row gap-3"
      style={{ alignItems: "center", width: "100%" }}
    >
      <div
        className="mono tabnum"
        style={{
          width: 44,
          textAlign: "right",
          fontSize: 13,
          color: "var(--ink)",
        }}
      >
        {format(a)}
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        <div
          style={{
            height: 6,
            background: "var(--ink)",
            borderRadius: 999,
            width: `${wa}%`,
            transition: "width 1s cubic-bezier(.2,.7,.2,1)",
          }}
        />
      </div>
      <div style={{ width: 1, height: 14, background: "var(--line)" }} />
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: 6,
            background: "var(--accent)",
            borderRadius: 999,
            width: `${wb}%`,
            transition: "width 1s cubic-bezier(.2,.7,.2,1) .05s",
          }}
        />
      </div>
      <div
        className="mono tabnum"
        style={{ width: 44, fontSize: 13, color: "var(--ink)" }}
      >
        {format(b)}
      </div>
    </div>
  );
}
