"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  cubicBezier,
} from "framer-motion";
import { AmbientDecor, type DecorStar, type DecorFirefly } from "./motion/AmbientDecor";
import { LoopVideo } from "./motion/LoopVideo";
import { useMediaQuery } from "./use-media-query";
import { SparklesIcon } from "@/components/ui/sparkles";
import { ArrowRightIcon } from "@/components/ui/arrow-right";
import { AxeIcon } from "@/components/ui/axe";

const easeOut = cubicBezier(0.22, 1, 0.36, 1);

// Sparse, tone-on-tone bedtime decor for the lower orange: a wheat-meadow
// silhouette the card rises out of, drifting lantern "fireflies", faint stars.
const STARS: DecorStar[] = [
  { top: "16%", left: "12%" },
  { top: "22%", left: "82%" },
  { top: "30%", left: "28%" },
  { top: "13%", left: "58%" },
  { top: "36%", left: "70%" },
  { top: "26%", left: "44%" },
  { top: "19%", left: "34%" },
];
const FIREFLIES: DecorFirefly[] = [
  { left: "17%", bottom: "30%", delay: "0s", dur: "7s" },
  { left: "30%", bottom: "20%", delay: "1.4s", dur: "8s" },
  { left: "69%", bottom: "26%", delay: "2.1s", dur: "7.5s" },
  { left: "82%", bottom: "18%", delay: "0.6s", dur: "8.5s" },
  { left: "52%", bottom: "12%", delay: "1.8s", dur: "9s" },
];

/**
 * Pinned, scroll-scrubbed hero (umano pattern). A tall container pins its inner
 * panel; as you scroll: the headline exits upward, the story card rises from the
 * bottom and scales up to centre, its scene swaps night → day, and the orange
 * panel (full-bleed + square at rest) contracts into an inset rounded panel,
 * revealing the off-white page around it. Static under reduced motion.
 */
export function Hero() {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  // On short/narrow screens the headline fills most of the panel, so the
  // desktop start-offset (360) would hide the card entirely and half-clip the
  // notify pill at the fold — start higher so the book top peeks cleanly.
  const mobile = useMediaQuery("(max-width: 960px)");
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Headline exits up fast (physical exit, not opacity-dependent).
  const textY = useTransform(scrollYProgress, [0, 0.26], [0, -520]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);
  // Card: peeks from bottom + small → rises to centre + grows (eased settle).
  const restY = mobile ? 210 : 360;
  const settleY = mobile ? -70 : -76;
  const cardY = useTransform(scrollYProgress, [0, 1], [restY, settleY], { ease: easeOut });
  const cardScale = useTransform(scrollYProgress, [0, 1], [0.85, 1.02], { ease: easeOut });
  // Orange panel: full-bleed + square → inset + rounded.
  const panelScale = useTransform(scrollYProgress, [0, 0.55], [1, 0.955], { ease: easeOut });
  const panelRadius = useTransform(scrollYProgress, [0, 0.5], [0, 44]);

  return (
    <div ref={ref} className="u-hero-pin">
      <div className="u-hero-sticky">
        {/* Orange panel backdrop — insets + rounds on scroll; holds bedtime decor */}
        <motion.div
          className="u-hero-panel"
          style={reduce ? undefined : { scale: panelScale, borderRadius: panelRadius }}
        >
          <AmbientDecor variant="orange" meadow stars={STARS} fireflies={FIREFLIES} />
        </motion.div>

        {/* Headline block */}
        <motion.div
          className="u-hero-head"
          style={reduce ? undefined : { y: textY, opacity: textOpacity }}
        >
          <span className="eyebrow">
            <span className="dot" />
            Bedtime, reinvented
          </span>
          <h1 className="hero-title u-hero-title">
            Tonight, your little one is the{" "}
            <span className="highlight">hero</span> of their own storybook.
          </h1>
          <p className="hero-sub u-hero-sub">
            A fresh five-chapter adventure around your child — their name, their
            face, their bravery — illustrated and narrated in a warm voice.
          </p>
          <div className="hero-ctas u-hero-ctas">
            <Link href="/stories/new" className="btn btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Make tonight&apos;s story <ArrowRightIcon size={16} />
            </Link>
            <a href="#how" className="btn btn-lg u-hero-ghost">
              See how it works
            </a>
          </div>
        </motion.div>

        {/* Rising story card (our "device") */}
        <motion.div
          className="u-hero-stage"
          style={reduce ? { y: settleY, scale: 1 } : { y: cardY, scale: cardScale }}
        >
          <div className="u-notify">
            <div className="u-notify-mark"><SparklesIcon size={16} /></div>
            <div>
              <div className="u-notify-kicker">Tuck-in time</div>
              <div className="u-notify-title">Tonight&apos;s tale is ready</div>
            </div>
          </div>

          <div className="u-hero-book">
            <div className="u-hero-book-label">Chapter one</div>
            <div className="u-hero-book-title">
              Maya &amp; the <span className="script">Brave Lantern</span>
            </div>
            <div className="u-hero-book-scene">
              <LoopVideo
                className="u-hero-scene-video"
                video="https://res.cloudinary.com/dh0spkwh3/video/upload/v1784378165/lantern-night_fcuv8q.mp4"
                poster="https://res.cloudinary.com/dh0spkwh3/image/upload/v1784378180/lantern-poster_oztu72.png"
              />
            </div>
            <div className="u-hero-book-meta">
              <span>Bravery · Ages 4–6</span>
              <span className="u-hero-book-star"><AxeIcon size={18} /></span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
