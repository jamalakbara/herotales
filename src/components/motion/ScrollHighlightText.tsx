"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";

type ScrollHighlightTextProps = {
  /** The full statement. Split into words and revealed one at a time. */
  text: string;
  className?: string;
};

/**
 * Big statement whose words fade from --paper-line to --ink as the block
 * scrolls through the viewport (umano's scroll-linked word reveal).
 * Under reduced motion the whole line renders solid --ink.
 */
export function ScrollHighlightText({ text, className }: ScrollHighlightTextProps) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.25"],
  });

  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]} reduce={!!reduce}>
            {word}
          </Word>
        );
      })}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
  reduce,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  reduce: boolean;
}) {
  const color = useTransform(
    progress,
    range,
    ["var(--paper-line)", "var(--ink)"],
  );
  return (
    <>
      <motion.span style={reduce ? { color: "var(--ink)" } : { color }}>
        {children}
      </motion.span>
      {" "}
    </>
  );
}
