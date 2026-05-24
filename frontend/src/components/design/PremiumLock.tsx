import { Icons } from "./Icons";

interface PremiumLockProps {
  onUnlock: () => void;
}

/** Overlay con blur + CTA "Ver planes". Posicionar el contenedor padre como relative. */
export function PremiumLock({ onUnlock }: PremiumLockProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "color-mix(in oklab, var(--bg) 80%, transparent)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "inherit",
        zIndex: 5,
      }}
    >
      <div
        className="center col gap-3"
        style={{ textAlign: "center", padding: 24 }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 10px",
            border: "1px solid var(--line)",
            borderRadius: 999,
            background: "var(--bg-card)",
          }}
        >
          <Icons.lock s={12} />
          <span
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Premium
          </span>
        </div>
        <div style={{ fontSize: 15, color: "var(--ink)", maxWidth: 240 }}>
          Desbloquea estadísticas avanzadas con GoalPredict Pro
        </div>
        <button className="btn sm accent" onClick={onUnlock}>
          Iniciar sesión Premium
          <Icons.arrow s={12} />
        </button>
      </div>
    </div>
  );
}
