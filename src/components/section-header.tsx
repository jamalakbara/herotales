import type { CSSProperties, ReactNode } from "react";

/** Caprasimo accent word inside a SectionHeader title. */
export function HeadAccent({ children }: { children: ReactNode }) {
  return (
    <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: "0.9em" }}>
      {children}
    </span>
  );
}

/**
 * App-page section heading: serif h2 (+ optional sub line) on the left,
 * optional action slot (link/button/chips) on the right.
 */
export function SectionHeader({
  title,
  sub,
  action,
  align = "flex-end",
  id,
  style,
}: {
  title: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
  align?: "flex-end" | "center";
  id?: string;
  style?: CSSProperties;
}) {
  return (
    <div id={id} style={{ display: "flex", justifyContent: "space-between", alignItems: align, marginBottom: 20, flexWrap: "wrap", gap: 14, ...style }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(24px, 2.4vw, 30px)", color: "var(--twilight)", letterSpacing: "-0.01em" }}>
          {title}
        </h2>
        {sub && (
          <div style={{ fontSize: 13.5, color: "var(--ink-soft)", fontWeight: 600, marginTop: 4 }}>{sub}</div>
        )}
      </div>
      {action}
    </div>
  );
}
