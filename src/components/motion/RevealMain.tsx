"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import { useMediaQuery } from "../use-media-query";

/**
 * The landing page's `.u-main` curtain (opaque sheet that hides the fixed
 * reveal-footer). As the page bottom passes the fold, its exit edge insets and
 * rounds via a scrubbed clip-path — moving with the FAQ panel's own shrink
 * (same scroll window) so curtain + panel lift off the footer as one gesture
 * instead of ending in a hard square line. The curtain's inset stays a touch
 * smaller than the panel's (≤720: panel ~14px / curtain 12px; wide: panel
 * ~2.25vw / curtain 18px) so a sliver of page-bg frame survives. Static under
 * reduced motion.
 */
export function RevealMain({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const narrow = useMediaQuery("(max-width: 720px)");
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["end 0.9", "end 0.6"], // keep in sync with PinnedPanel's narrow exit scrub
  });
  const inset = useTransform(scrollYProgress, [0, 1], narrow ? [0, 12] : [0, 18]);
  const radius = useTransform(scrollYProgress, [0, 1], narrow ? [0, 28] : [0, 40]);
  const clipPath = useMotionTemplate`inset(0px ${inset}px 0px ${inset}px round 0px 0px ${radius}px ${radius}px)`;

  // Always render motion.main so React never swaps element types — switching
  // between <main> and <motion.main> causes Framer Motion cleanup to call
  // removeChild on an already-detached node. Just skip the clipPath style
  // on narrow/reduced-motion instead.
  return (
    <motion.main
      ref={ref}
      className="u-main"
      style={narrow || reduce ? undefined : { clipPath }}
    >
      {children}
    </motion.main>
  );
}
