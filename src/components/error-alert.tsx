import type { CSSProperties, ReactNode } from "react";

/**
 * Inline load/submit error banner for app pages.
 * Colors predate the umano skin (berry on pink) — kept for now; revisit
 * with the skin's error treatment if one lands.
 */
export function ErrorAlert({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ marginBottom: 24, padding: "14px 18px", background: "rgba(180,60,90,0.08)", border: "2px solid var(--berry)", borderRadius: 16, color: "var(--berry)", fontWeight: 700, fontSize: 13.5, ...style }}>
      {children}
    </div>
  );
}
