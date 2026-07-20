import type { CSSProperties, ReactNode } from "react";
import { AmbientDecor } from "@/components/motion/AmbientDecor";

/**
 * Centered no-content panel. `orange` is the decorated u-orange hero panel
 * (shelf), `plain` the quiet cream tray (keepsake picker). Surface styling
 * lives in the `.u-empty` / `.u-empty-orange` classes in globals.css.
 */
export function EmptyState({
  variant,
  title,
  sub,
  cta,
  style,
}: {
  variant: "orange" | "plain";
  title: ReactNode;
  sub: ReactNode;
  cta?: ReactNode;
  style?: CSSProperties;
}) {
  const orange = variant === "orange";
  return (
    <div className={orange ? "u-empty-orange" : "u-empty"} style={style}>
      {orange && <AmbientDecor variant="orange" fireflies={[]} />}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: orange ? 24 : 22, color: orange ? "#140906" : "var(--twilight)", marginBottom: orange ? 8 : 6 }}>
          {title}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: orange ? 16 : 18, color: orange ? undefined : "var(--ink-soft)" }}>
          {sub}
        </div>
        {cta}
      </div>
    </div>
  );
}
