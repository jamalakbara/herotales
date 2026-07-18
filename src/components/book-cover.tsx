import { CSSProperties, ReactNode } from "react";

/**
 * Shared book-cover primitive — the physical "book spine" rectangle used on the
 * dashboard shelf, the full shelf, and the keepsake picker. Presentational only:
 * pages own their wrapper (Link / selectable div) + the info block below.
 */

export type CoverAccent = "berry" | "twilight" | "sage" | "moon" | "lilac" | "cream";

/** Canonical accent rotation — single source of truth for cover colours. */
export const COVER_ACCENTS: CoverAccent[] = ["twilight", "moon", "berry", "sage", "lilac", "cream"];

/** Pick an accent by list index (rotates through COVER_ACCENTS). */
export function coverAccent(i: number): CoverAccent {
  return COVER_ACCENTS[i % COVER_ACCENTS.length];
}

const ACCENT: Record<CoverAccent, { bg: string; fg: string; light: boolean }> = {
  berry: { bg: "var(--berry)", fg: "var(--cream)", light: false },
  twilight: { bg: "var(--twilight)", fg: "var(--cream)", light: false },
  sage: { bg: "var(--sage)", fg: "var(--cream)", light: false },
  moon: { bg: "var(--moon)", fg: "var(--twilight)", light: true },
  lilac: { bg: "var(--lilac)", fg: "var(--twilight)", light: true },
  cream: { bg: "var(--cream)", fg: "var(--twilight)", light: true },
};

/** Background + foreground tokens for an accent — for mini spine thumbnails. */
export function accentColors(accent: CoverAccent): { background: string; color: string } {
  return { background: ACCENT[accent].bg, color: ACCENT[accent].fg };
}

type SizeKey = "lg" | "md" | "sm";
const SIZE: Record<SizeKey, {
  pad: string; title: number; script: number; label: number; titleMt: number;
  spine: number; star: number; starFont: number; foot: number; footOpacity: number;
  mb: number; shadow: string; badgePad: string; badgeFont: number;
}> = {
  lg: { pad: "18px 16px", title: 22, script: 20, label: 10, titleMt: 6, spine: 6, star: 34, starFont: 14, foot: 11, footOpacity: 1, mb: 12, shadow: "5px 5px 0 var(--ink)", badgePad: "4px 10px", badgeFont: 12 },
  md: { pad: "16px 14px", title: 18, script: 17, label: 9.5, titleMt: 5, spine: 5, star: 30, starFont: 13, foot: 10.5, footOpacity: 1, mb: 10, shadow: "5px 5px 0 var(--ink)", badgePad: "3px 9px", badgeFont: 11 },
  sm: { pad: "14px 12px", title: 15, script: 14, label: 9, titleMt: 4, spine: 5, star: 0, starFont: 0, foot: 10, footOpacity: 0.85, mb: 10, shadow: "4px 4px 0 var(--ink)", badgePad: "3px 9px", badgeFont: 11 },
};

type BadgeAccent = "berry" | "sage" | "moon";
const BADGE: Record<BadgeAccent, { bg: string; fg: string }> = {
  berry: { bg: "var(--berry)", fg: "var(--cream)" },
  sage: { bg: "var(--sage)", fg: "var(--cream)" },
  moon: { bg: "var(--moon)", fg: "var(--twilight)" },
};

export function BookCover({
  accent,
  label,
  title,
  script,
  theme,
  star,
  footerRight,
  size = "md",
  badge,
  overlay,
  selected = false,
  animated = false,
  className,
  coverClassName,
  style,
}: {
  accent: CoverAccent;
  label: string;
  title: string;
  script?: string;
  /** Bottom-left text (usually the blueprint / value). */
  theme?: string;
  /** Bottom-right star glyph, rendered in a circle. Omit for `footerRight`. */
  star?: string;
  /** Bottom-right plain content when there's no star (e.g. child name). */
  footerRight?: ReactNode;
  size?: SizeKey;
  badge?: { text: string; accent: BadgeAccent };
  /** Absolutely-positioned overlay above the cover (e.g. a selection check). */
  overlay?: ReactNode;
  selected?: boolean;
  /** Enable shelf hover animations (twinkle/wiggle/shadow-grow). */
  animated?: boolean;
  /** Extra classes for the outer wrapper (e.g. `dash-book-card-anim`). */
  className?: string;
  /** Extra classes for the cover box itself (e.g. `kp-pick-cov`). */
  coverClassName?: string;
  /** Style for the outer wrapper. */
  style?: CSSProperties;
}) {
  const a = ACCENT[accent];
  const s = SIZE[size];
  const spineCol = a.light ? "rgba(28,21,64,0.2)" : "rgba(255,255,255,0.3)";
  const starBg = a.light ? "rgba(28,21,64,0.12)" : "rgba(255,255,255,0.18)";
  const scriptCol = a.light ? "inherit" : "var(--moon)";
  const bd = badge ? BADGE[badge.accent] : null;

  return (
    <div className={className} style={{ position: "relative", ...style }}>
      {badge && bd && (
        <div
          className={animated ? "dash-bc-badge-anim" : undefined}
          style={{ position: "absolute", top: -8, right: -6, padding: s.badgePad, background: bd.bg, border: "2px solid var(--ink)", borderRadius: 999, fontFamily: "var(--font-caprasimo), serif", fontSize: s.badgeFont, color: bd.fg, transform: "rotate(6deg)", zIndex: 3 }}
        >{badge.text}</div>
      )}
      {overlay}
      <div
        className={[animated ? "dash-book-cover-anim" : "", coverClassName ?? ""].filter(Boolean).join(" ") || undefined}
        style={{ aspectRatio: "5/6.4", borderRadius: "6px 12px 12px 6px", border: selected ? "3px solid var(--moon)" : "2.5px solid var(--ink)", boxShadow: selected ? "6px 6px 0 var(--ink)" : s.shadow, padding: s.pad, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between", marginBottom: s.mb, background: a.bg, color: a.fg }}
      >
        <div style={{ position: "absolute", left: s.spine, top: s.spine * 2, bottom: s.spine * 2, width: 2, background: spineCol, pointerEvents: "none" }} />
        <div>
          <div style={{ fontSize: s.label, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>{label}</div>
          <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: s.title, lineHeight: 1.05, marginTop: s.titleMt }}>
            {title}
            {script ? <span style={{ fontFamily: "var(--font-caprasimo), serif", display: "block", fontSize: s.script, color: scriptCol }}>{script}</span> : null}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: s.foot, fontWeight: 700, opacity: s.footOpacity }}>
          <span>{theme}</span>
          {star ? (
            <div
              className={animated ? "dash-bc-star-anim" : undefined}
              style={{ width: s.star, height: s.star, borderRadius: "50%", background: starBg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: s.starFont }}
            >{star}</div>
          ) : footerRight != null ? <span>{footerRight}</span> : null}
        </div>
      </div>
    </div>
  );
}
