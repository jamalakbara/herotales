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
} & Omit<HTMLMotionProps<"div">, "children">;

/**
 * Fade + slide-up entrance that plays once on mount and always settles to
 * fully visible. (Mount-based rather than scroll-observer-based so it can't get
 * stuck under React StrictMode's dev double-mount.) The signature scroll-linked
 * effects live in ScrollHighlightText / HorizontalScroll / FannedCards, which
 * use useScroll. Collapses to a static element under reduced motion.
 */
export function Reveal({ children, delay = 0, index = 0, y = 22, ...rest }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={rest.className} style={rest.style as React.CSSProperties}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
