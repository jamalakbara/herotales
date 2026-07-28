"use client";

export type DecorStar = { top: string; left: string };
export type DecorFirefly = { left: string; bottom: string; delay: string; dur: string };

const DEFAULT_STARS: DecorStar[] = [
  { top: "18%", left: "10%" },
  { top: "12%", left: "78%" },
  { top: "32%", left: "26%" },
  { top: "22%", left: "56%" },
  { top: "38%", left: "84%" },
  { top: "14%", left: "40%" },
];
const DEFAULT_FIREFLIES: DecorFirefly[] = [
  { left: "16%", bottom: "24%", delay: "0s", dur: "7s" },
  { left: "48%", bottom: "14%", delay: "1.6s", dur: "8.5s" },
  { left: "80%", bottom: "22%", delay: "0.8s", dur: "7.5s" },
];
const WHEAT = [80, 190, 300, 470, 620, 790, 940, 1080, 1210, 1340];

type AmbientDecorProps = {
  /** Palette: tone-on-tone for the orange hero panel, or cream-on-dark for twilight panels. */
  variant: "orange" | "dark";
  stars?: DecorStar[];
  fireflies?: DecorFirefly[];
  /** Wheat-meadow silhouette along the bottom edge (hero-scale panels only). */
  meadow?: boolean;
  className?: string;
};

/**
 * Sparse, tone-on-tone bedtime decor for colored panels: faint twinkling
 * stars, drifting lantern "fireflies", and optionally a wheat-meadow
 * silhouette. Purely decorative; ambient motion is disabled under
 * prefers-reduced-motion via the .u-bgstar/.u-firefly CSS.
 */
export function AmbientDecor({
  variant,
  stars = DEFAULT_STARS,
  fireflies = DEFAULT_FIREFLIES,
  meadow = false,
  className,
}: AmbientDecorProps) {
  return (
    <div className={`u-decor u-decor-${variant}${className ? ` ${className}` : ""}`} aria-hidden>
      {stars.map((s, i) => (
        <span key={i} className="u-bgstar" style={{ top: s.top, left: s.left }} />
      ))}

      {meadow && (
        <svg className="u-meadow" viewBox="0 0 1440 260" preserveAspectRatio="none">
          {/* back hill */}
          <path d="M0,130 C360,72 1080,82 1440,118 L1440,260 L0,260 Z" fill="#E85A25" />
          {/* wheat stalks rising from the crest */}
          <g fill="none" stroke="#C4430F" strokeWidth="3" strokeLinecap="round">
            {WHEAT.map((x, i) => (
              <use key={i} href="#u-wheat" transform={`translate(${x}, ${150 - (i % 3) * 6}) scale(${0.85 + (i % 4) * 0.12})`} />
            ))}
          </g>
          {/* front hill (covers stalk bases) */}
          <path d="M0,176 C400,138 1040,142 1440,182 L1440,260 L0,260 Z" fill="#C4430F" />
          <defs>
            <g id="u-wheat">
              <path d="M0,0 C-3,-22 3,-42 0,-62" />
              <path d="M0,-62 l-7,-6 M0,-55 l-7,-4 M0,-48 l-7,-3" />
              <path d="M0,-62 l7,-6 M0,-55 l7,-4 M0,-48 l7,-3" />
            </g>
          </defs>
        </svg>
      )}

      {fireflies.map((f, i) => (
        <span
          key={i}
          className="u-firefly"
          style={{ left: f.left, bottom: f.bottom, animationDelay: f.delay, animationDuration: f.dur }}
        />
      ))}
    </div>
  );
}
