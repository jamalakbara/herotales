"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

type PinnedPanelProps = {
  /** Scroll room for the pin (wrapper height). 150vh matches the landing FAQ. */
  heightVh?: number;
  scaleRange?: [number, number];
  radiusRange?: [number, number];
  /** scrollYProgress window the scale/radius scrub maps over. */
  progressRange?: [number, number];
  /** Classes for the panel <section> itself (both pinned and static branches). */
  className?: string;
  /** Extra panel classes only when pinned (e.g. full-viewport sizing). */
  pinnedClassName?: string;
  stickyClassName?: string;
  id?: string;
  children: React.ReactNode;
};

/**
 * Hero/FAQ-style pin: a full-viewport panel scales down in place into a
 * rounded inset card as the user scrolls, then holds. Renders a plain static
 * <section> (no pin, no extra scroll room) under reduced motion.
 */
export function PinnedPanel({
  heightVh = 150,
  scaleRange = [1, 0.955],
  radiusRange = [0, 44],
  progressRange = [0.12, 0.72],
  className,
  pinnedClassName,
  stickyClassName,
  id,
  children,
}: PinnedPanelProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const scale = useTransform(scrollYProgress, progressRange, scaleRange);
  const radius = useTransform(scrollYProgress, progressRange, radiusRange);

  if (reduce) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }

  return (
    <div ref={ref} className="u-pin" style={{ height: `${heightVh}vh` }}>
      <div className={`u-pin-sticky${stickyClassName ? ` ${stickyClassName}` : ""}`}>
        <motion.section
          id={id}
          className={[className, pinnedClassName].filter(Boolean).join(" ")}
          style={{ scale, borderRadius: radius, transformOrigin: "center center" }}
        >
          {children}
        </motion.section>
      </div>
    </div>
  );
}
