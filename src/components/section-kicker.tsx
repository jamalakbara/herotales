import type { CSSProperties, ReactNode } from "react";

/** Rotated Caprasimo kicker line that sits above a page/section heading. */
export function SectionKicker({
  children,
  size = 16,
  className,
  style,
}: {
  children: ReactNode;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={className}
      style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: size, transform: "rotate(-1.5deg)", display: "inline-block", marginBottom: 8, ...style }}
    >
      {children}
    </span>
  );
}
