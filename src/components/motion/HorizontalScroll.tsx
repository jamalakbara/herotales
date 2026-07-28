"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

type HorizontalScrollProps = {
  children: React.ReactNode;
  /** How much of the track scrolls past. Larger track = taller pin. Default 1.4x viewport. */
  heightVh?: number;
  className?: string;
  trackClassName?: string;
};

/**
 * Pins a section while its inner track translates horizontally as you scroll
 * vertically (umano's pinned horizontal card row).
 * Under reduced motion it falls back to a normal horizontally-scrollable row.
 */
export function HorizontalScroll({
  children,
  heightVh = 260,
  className,
  trackClassName,
}: HorizontalScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-58%"]);

  if (reduce) {
    return (
      <div
        className={className}
        style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}
      >
        <div
          className={trackClassName}
          style={{ display: "flex", gap: 28, padding: "0 48px" }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={className} style={{ height: `${heightVh}vh`, position: "relative" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <motion.div
          className={trackClassName}
          style={{ x, display: "flex", gap: 28, paddingLeft: 48, willChange: "transform" }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
