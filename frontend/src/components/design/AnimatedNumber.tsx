import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (v: number) => string | number;
  suffix?: string;
}

/** Cuenta de 0 al valor con easing cubic. ~900ms por defecto. */
export function AnimatedNumber({
  value,
  duration = 900,
  format = (v) => v,
  suffix = "",
}: AnimatedNumberProps) {
  const [v, setV] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    startRef.current = performance.now();
    const from = 0;
    const to = value;
    const tick = (now: number) => {
      const t = Math.min(1, (now - (startRef.current ?? now)) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span className="mono tabnum">
      {format(v)}
      {suffix}
    </span>
  );
}
