"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

type FannedCardsProps = {
  /** One node per card. Middle card stays upright; outer cards fan out. */
  children: React.ReactNode[];
  className?: string;
};

/** Per-card resting rotation/offset for the fanned "hand of cards" look. */
function fanTransform(i: number, count: number) {
  const mid = (count - 1) / 2;
  const offset = i - mid;
  return {
    rotate: offset * 8,
    x: offset * 150,
    y: Math.abs(offset) * 26,
  };
}

/**
 * Cards start stacked/flat and fan out into a tilted spread as the section
 * scrolls into view (umano's client-stories fan). Static spread under
 * reduced motion.
 */
export function FannedCards({ children, className }: FannedCardsProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
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
        minHeight: 460,
      }}
    >
      {children.map((child, i) => (
        <FannedCard key={i} i={i} count={count} progress={scrollYProgress} reduce={!!reduce}>
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
  progress,
  reduce,
}: {
  children: React.ReactNode;
  i: number;
  count: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  reduce: boolean;
}) {
  const target = fanTransform(i, count);
  const rotate = useTransform(progress, [0, 1], [0, target.rotate]);
  const x = useTransform(progress, [0, 1], [0, target.x]);
  const y = useTransform(progress, [0, 1], [40, target.y]);

  const style = reduce
    ? { position: "absolute" as const, rotate: target.rotate, x: target.x, y: target.y }
    : { position: "absolute" as const, rotate, x, y };

  return (
    <motion.div style={{ ...style, zIndex: i === Math.floor(count / 2) ? count : i }}>
      {children}
    </motion.div>
  );
}
