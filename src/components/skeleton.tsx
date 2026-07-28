import type { CSSProperties } from "react";

type SkeletonVariant = "media" | "text" | "avatar" | "pill" | "cover" | "seat";

/**
 * Loading placeholder primitive — styled by `.skeleton` + variant classes in
 * globals.css (cream-deep surface, white sheen sweep, static under
 * reduced-motion). `media` fills its positioned parent, for videos and
 * fill-images while they load.
 */
export function Skeleton({
  variant,
  className,
  style,
}: {
  variant?: SkeletonVariant;
  className?: string;
  style?: CSSProperties;
}) {
  const cls = ["skeleton", variant ? `skeleton-${variant}` : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return <div className={cls} style={style} aria-hidden />;
}

/** One book-cover placeholder (cover + two caption lines) — drop into an existing shelf grid. */
export function SkeletonBookItem() {
  return (
    <div aria-hidden>
      <Skeleton variant="cover" style={{ marginBottom: 12 }} />
      <Skeleton variant="text" style={{ width: "80%", marginBottom: 7 }} />
      <Skeleton variant="text" style={{ width: "55%" }} />
    </div>
  );
}

/** Kid/hero card placeholder — mirrors the dashboard hero cards (avatar + name + stat strip). */
export function SkeletonKidCard() {
  return (
    <div
      aria-hidden
      className="dash-kid-card"
      style={{ borderRadius: 20, padding: 22 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <Skeleton variant="avatar" />
        <div style={{ flex: 1 }}>
          <Skeleton variant="text" className="lg" style={{ width: "70%", marginBottom: 8 }} />
          <Skeleton variant="text" style={{ width: "50%" }} />
        </div>
      </div>
      <div style={{ paddingTop: 12, borderTop: "1.5px dashed var(--paper-line)" }}>
        <Skeleton variant="text" style={{ width: "85%" }} />
      </div>
    </div>
  );
}
