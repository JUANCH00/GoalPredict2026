import { useEffect, useState } from "react";

interface DonutProps {
  /** 0..1 */
  value: number;
  label?: string;
  sublabel?: string;
  size?: number;
  color?: string;
  animate?: boolean;
}

/**
 * Donut SVG con animación de stroke-dasharray. Útil para Over/Under, BTTS.
 */
export function Donut({
  value,
  label,
  sublabel,
  size = 120,
  color,
  animate = true,
}: DonutProps) {
  const [v, setV] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) {
      setV(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, animate]);

  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * v;
  const strokeColor = color ?? "var(--ink)";

  return (
    <div className="center col" style={{ gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--line)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${c}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray .2s" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div
            className="mono tabnum"
            style={{
              fontSize: size * 0.22,
              fontWeight: 500,
              letterSpacing: "-0.04em",
              color: "var(--ink)",
            }}
          >
            {Math.round(v * 100)}
            <span style={{ fontSize: size * 0.12, color: "var(--ink-mute)" }}>
              %
            </span>
          </div>
          {sublabel && (
            <div className="uplabel" style={{ fontSize: 9, marginTop: 2 }}>
              {sublabel}
            </div>
          )}
        </div>
      </div>
      {label && <div className="uplabel" style={{ marginTop: 4 }}>{label}</div>}
    </div>
  );
}
