"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useMediaQuery } from "../use-media-query";

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
  // A pinned 100vh panel can't hold content taller than the viewport — on
  // phones (accordion open, tall copy) it clips. Render a flowing section
  // instead, with a light exit scrub (shrink + round as the bottom edge passes
  // the fold) so it still hands off to what follows like the desktop pin.
  const narrow = useMediaQuery("(max-width: 720px)");
  const { scrollYProgress } = useScroll({
    target: ref,
    // narrow: shrink late and fast — minimize the window where the rounded
    // panel and the revealing footer share the screen
    offset: narrow ? ["end 0.9", "end 0.6"] : ["start start", "end end"],
  });
  const scale = useTransform(scrollYProgress, narrow ? [0, 1] : progressRange, narrow ? [1, 0.93] : scaleRange);
  const radius = useTransform(scrollYProgress, narrow ? [0, 1] : progressRange, narrow ? [0, 28] : radiusRange);

  if (reduce) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }

  if (narrow) {
    return (
      <motion.section
        ref={ref as React.RefObject<HTMLElement>}
        id={id}
        className={className}
        style={{ scale, borderRadius: radius, transformOrigin: "center bottom", overflow: "hidden" }}
      >
        {children}
      </motion.section>
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
