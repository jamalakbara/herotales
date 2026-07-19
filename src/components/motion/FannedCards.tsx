"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

type FannedCardsProps = {
  /** One node per card. Middle card stays upright; outer cards fan out. */
  children: React.ReactNode[];
  className?: string;
  /** Container height; default fits the landing blueprint cards. */
  minHeight?: number;
  /** Multiplier on the fan's x/y offsets for tighter spreads (default 1). */
  spread?: number;
  /**
   * Render the fan fully spread with no scroll scrubbing (hover lift still
   * active). Required inside pinned sections — the container never moves
   * through the viewport there, so scroll progress would stay at 0.
   */
  staticSpread?: boolean;
};

/** Per-card resting rotation/offset for the fanned "hand of cards" look
 * (umano's client-stories spread): outer cards swing wide and tilt, the middle
 * card sits lower and upright at the front. Spacing tightens as the count grows
 * so a 5-card hand still fits. */
function fanTransform(i: number, count: number, spread: number) {
  const mid = (count - 1) / 2;
  const offset = i - mid;
  const wide = count <= 3;
  const xStep = wide ? 320 : 200;
  const rotStep = wide ? 12 : 8;
  const yStep = wide ? 100 : 50;
  return {
    rotate: offset * rotStep,
    x: offset * xStep * spread,
    y: (72 - Math.abs(offset) * yStep) * spread, // centre dips forward, outers arc up
  };
}

/**
 * Cards start stacked/flat and fan out into a tilted spread as the section
 * scrolls into view (umano's client-stories fan). Hovering a card lifts it out
 * of the hand — straightens, scales up, and brings it to the front. Static
 * spread with no hover under reduced motion.
 */
export function FannedCards({ children, className, minHeight = 620, spread = 1, staticSpread = false }: FannedCardsProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "center 0.55"],
  });
  const count = children.length;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight,
      }}
    >
      {children.map((child, i) => (
        <FannedCard
          key={i}
          i={i}
          count={count}
          spread={spread}
          progress={scrollYProgress}
          reduce={!!reduce}
          staticSpread={staticSpread}
          hovered={hovered === i}
          onHover={setHovered}
        >
          {child}
        </FannedCard>
      ))}
    </div>
  );
}

function FannedCard({
  children,
  i,
  count,
  spread,
  progress,
  reduce,
  staticSpread,
  hovered,
  onHover,
}: {
  children: React.ReactNode;
  i: number;
  count: number;
  spread: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  reduce: boolean;
  staticSpread: boolean;
  hovered: boolean;
  onHover: (i: number | null) => void;
}) {
  const target = fanTransform(i, count, spread);
  // Outer wrapper: scroll-driven fan position (rotate / x / y).
  const rotate = useTransform(progress, [0, 1], [0, target.rotate]);
  const x = useTransform(progress, [0, 1], [0, target.x]);
  const y = useTransform(progress, [0, 1], [40, target.y]);

  const base = i === Math.floor(count / 2) ? count : i;

  const outer = reduce || staticSpread
    ? { rotate: target.rotate, x: target.x, y: target.y }
    : { rotate, x, y };

  return (
    <motion.div
      style={{ position: "absolute", ...outer, zIndex: hovered ? 999 : base }}
    >
      {/* Inner wrapper: hover lift — cancels the fan tilt, scales up, rises. */}
      <motion.div
        onHoverStart={() => onHover(i)}
        onHoverEnd={() => onHover(null)}
        whileHover={reduce ? undefined : { rotate: -target.rotate, scale: 1.06, y: -36 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        style={{ cursor: "pointer" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
