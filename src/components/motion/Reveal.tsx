"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

type RevealProps = {
  children: React.ReactNode;
  /** Delay in seconds before the reveal starts. */
  delay?: number;
  /** Stagger index — multiplies a small base delay for lists/grids. */
  index?: number;
  /** Travel distance in px (default 22, matches kpFadeRise). */
  y?: number;
  /**
   * Play when scrolled into view instead of on mount. Use for below-the-fold
   * sections, where a mount-based entrance would finish before the user
   * arrives. Uses framer-motion's own viewport observer (StrictMode-safe).
   */
  inView?: boolean;
} & Omit<HTMLMotionProps<"div">, "children">;

/**
 * Fade + slide-up entrance that plays once and always settles to fully
 * visible. Default is mount-based (rather than hand-rolled observer-gated, so
 * it can't get stuck under React StrictMode's dev double-mount); pass `inView`
 * for below-the-fold content. The signature scroll-linked effects live in
 * ScrollHighlightText / HorizontalScroll / FannedCards, which use useScroll.
 * Collapses to a static element under reduced motion.
 */
export function Reveal({ children, delay = 0, index = 0, y = 22, inView = false, ...rest }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={rest.className} style={rest.style as React.CSSProperties}>
        {children}
      </div>
    );
  }

  const target = { opacity: 1, y: 0 };

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      {...(inView
        ? { whileInView: target, viewport: { once: true, amount: 0.25 } }
        : { animate: target })}
      transition={{ duration: 0.6, delay: delay + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
