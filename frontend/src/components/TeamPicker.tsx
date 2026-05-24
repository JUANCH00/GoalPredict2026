import { useEffect, useMemo, useRef, useState } from "react";

import { getTeamMeta } from "../data/teams";
import type { Team } from "../types/api";
import { Icons, TeamMark } from "./design";

interface TeamPickerProps {
  value: string;
  onChange: (teamName: string) => void;
  teams: Team[];
  exclude?: string;
  placeholder?: string;
  align?: "left" | "right";
}

/**
 * Selector estilo combobox del diseño editorial:
 *   - botón con TeamMark + nombre + conf · FIFA #rank + chevron
 *   - dropdown con buscador y lista con TeamMark size 26
 *   - click-outside cierra el dropdown
 */
export function TeamPicker({
  value,
  onChange,
  teams,
  exclude,
  placeholder = "Seleccionar selección",
  align = "left",
}: TeamPickerProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const cleaned = q.trim().toLowerCase();
    return teams
      .filter((t) => t.name !== exclude)
      .filter((t) => {
        if (!cleaned) return true;
        const meta = getTeamMeta(t.name);
        return (
          t.name.toLowerCase().includes(cleaned) ||
          meta?.code.toLowerCase().includes(cleaned) ||
          meta?.name.toLowerCase().includes(cleaned)
        );
      })
      .slice(0, 100);
  }, [teams, q, exclude]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQ("");
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const selectedMeta = value ? getTeamMeta(value) : null;

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 16px",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-md)",
          background: open ? "var(--bg-soft)" : "var(--bg-card)",
          cursor: "pointer",
          fontFamily: "inherit",
          color: "var(--ink)",
          textAlign: "left",
          transition: "background .15s, border-color .15s",
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.borderColor = "var(--ink)";
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.borderColor = "var(--line)";
        }}
      >
        {selectedMeta ? (
          <TeamMark team={selectedMeta} size={32} />
        ) : (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1px dashed var(--line)",
              flexShrink: 0,
            }}
          />
        )}
        <div className="col" style={{ gap: 2, flex: 1, minWidth: 0 }}>
          {selectedMeta ? (
            <>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {selectedMeta.name}
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 11,
                  color: "var(--ink-mute)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {selectedMeta.conf}
                {selectedMeta.rank < 999 && ` · FIFA #${selectedMeta.rank}`}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 15, color: "var(--ink-mute)" }}>
              {placeholder}
            </div>
          )}
        </div>
        <Icons.arrowDown s={14} />
      </button>

      {open && (
        <div
          className="fade-in"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            [align === "right" ? "right" : "left"]: 0,
            width: "100%",
            minWidth: 320,
            background: "var(--bg-card)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 12px 32px -8px rgba(0,0,0,.12)",
            zIndex: 20,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: 8, borderBottom: "1px solid var(--line-soft)" }}>
            <input
              ref={inputRef}
              className="input"
              placeholder="Buscar selección..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{
                borderColor: "transparent",
                padding: "8px 10px",
                fontSize: 13,
              }}
            />
          </div>
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div
                style={{
                  padding: 18,
                  fontSize: 13,
                  color: "var(--ink-mute)",
                  textAlign: "center",
                }}
              >
                Sin resultados
              </div>
            )}
            {filtered.map((t) => {
              const meta = getTeamMeta(t.name);
              if (!meta) return null;
              const isSelected = t.name === value;
              return (
                <button
                  type="button"
                  key={t.name}
                  onClick={() => {
                    onChange(t.name);
                    setOpen(false);
                    setQ("");
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "9px 12px",
                    border: 0,
                    background: isSelected ? "var(--bg-soft)" : "transparent",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: "var(--ink)",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-soft)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = isSelected
                      ? "var(--bg-soft)"
                      : "transparent")
                  }
                >
                  <TeamMark team={meta} size={26} />
                  <div className="col" style={{ gap: 0, flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>
                      {meta.name}
                    </div>
                  </div>
                  {meta.rank < 999 && (
                    <div
                      className="mono tabnum"
                      style={{ fontSize: 11, color: "var(--ink-mute)" }}
                    >
                      #{meta.rank}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
