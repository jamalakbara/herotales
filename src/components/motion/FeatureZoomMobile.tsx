"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { LoopVideo } from "./LoopVideo";
import type { FeatureCard } from "./FeatureZoom";

/** Piecewise-linear ramp: `from` at/below `a`, `to` at/above `b`, linear between.
 *  Used inside function-form useTransform so every value stays on the JS/rAF
 *  path (framer only hardware-accelerates the array form, which on this pinned
 *  stage lands on a non-monotonic ViewTimeline and flickers — see FeatureZoom). */
const ramp = (p: number, a: number, b: number, from: number, to: number) =>
  p <= a ? from : p >= b ? to : from + (to - from) * ((p - a) / (b - a));

/**
 * Eased deck position 0..n. Each card `i` owns scroll segment [i/n,(i+1)/n];
 * within it the position DWELLS at `i` for the first ~55% (card held front and
 * readable) then transitions to `i+1` over the last ~45% (the deal). So
 * `pos - i` — a card's signed distance from the front of the deck — sits at 0
 * while you read, then climbs through 1 as the next card takes over.
 */
const deckPos = (p: number, n: number) => {
  const raw = p * n;
  const fl = Math.floor(Math.min(raw, n - 1e-4));
  const frac = raw - fl;
  const s = frac < 0.55 ? 0 : (frac - 0.55) / 0.45;
  return fl + s;
};

type MTileProps = {
  c: FeatureCard;
  i: number;
  n: number;
  progress: MotionValue<number>;
  isLast: boolean;
  zStart: number;
  coverScale: number;
  mediaRef?: React.Ref<HTMLDivElement>;
};

/**
 * One media tile in the 3D deck. `d = deckPos - i` is its distance from the
 * front: d<0 it's still in the deck, receded into depth (small, tilted back,
 * pushed away on Z) and rising toward front as d→0; d=0 it's front & upright;
 * d>0 it's dealt — flips up and tumbles toward the camera (rotateX + +Z) while
 * fading, revealing the next tile popping forward out of depth. preserve-3d on
 * the stage sorts tiles by their translateZ, so the dealt tile passes in front.
 * The last tile doesn't deal — its media zooms full-bleed to black.
 */
function MTile({ c, i, n, progress, isLast, zStart, coverScale, mediaRef }: MTileProps) {
  const opacity = useTransform(progress, (p) => {
    const d = deckPos(p, n) - i;
    if (d <= 0) return ramp(d, -1.4, -0.5, 0, 1);
    return isLast ? 1 : ramp(d, 0.1, 0.7, 1, 0);
  });
  const scale = useTransform(progress, (p) => {
    const d = deckPos(p, n) - i;
    if (d <= 0) return ramp(d, -1.4, 0, 0.68, 1);
    return isLast ? 1 : ramp(d, 0, 0.8, 1, 1.15);
  });
  const y = useTransform(progress, (p) => {
    const d = deckPos(p, n) - i;
    if (d <= 0) return ramp(d, -1.4, 0, 60, 0);
    return isLast ? 0 : ramp(d, 0, 0.8, 0, -260);
  });
  const z = useTransform(progress, (p) => {
    const d = deckPos(p, n) - i;
    if (d <= 0) return ramp(d, -1.4, 0, -520, 0);
    return isLast ? 0 : ramp(d, 0, 0.8, 0, 260);
  });
  const rotateX = useTransform(progress, (p) => {
    const d = deckPos(p, n) - i;
    if (d <= 0) return ramp(d, -1.4, 0, 18, 0);
    return isLast ? 0 : ramp(d, 0, 0.8, 0, -42);
  });

  // Last tile only: media zooms + rounds off + darkens to black over the tail.
  const mediaScale = useTransform(progress, (p) => (isLast ? ramp(p, zStart, 1, 1, coverScale) : 1));
  const mediaRadius = useTransform(progress, (p) =>
    isLast ? ramp(p, zStart, zStart + (1 - zStart) * 0.7, 18, 0) : 18,
  );
  // Color needs the array form (framer interpolates real colors); the media's
  // own zoom progress is monotonic, so no flicker here.
  const mediaBg = useTransform(
    progress,
    isLast ? [zStart, zStart + (1 - zStart) * 0.7] : [0, 1],
    isLast ? ["#ffffff", "#0C0B0F"] : ["#ffffff", "#ffffff"],
  );
  const videoOpacity = useTransform(progress, (p) => (isLast ? ramp(p, 0.9, 0.99, 1, 0) : 1));

  return (
    <motion.div className="u-fzoom-m-tile" style={{ opacity, scale, y, z, rotateX }}>
      <motion.div
        ref={mediaRef}
        className="u-hcard-media u-fzoom-m-media"
        style={{ scale: mediaScale, borderRadius: mediaRadius, background: mediaBg }}
      >
        {c.video ? (
          <motion.div style={{ opacity: videoOpacity, width: "100%", height: "100%" }}>
            <LoopVideo video={c.video} poster={c.poster} className="u-hcard-video" />
          </motion.div>
        ) : (
          <span style={{ fontSize: 68, color: c.tint }}>{c.icon}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

/**
 * The caption for card `i`, living in a fixed slot below the deck (NOT riding
 * the 3D tiles — that's what kept the captions from colliding). Visible only
 * while its card is at/near the front; during the flip between two cards no
 * caption shows for a beat (the eye is on the tumbling media). A small
 * upward-settle gives it life as it appears.
 */
function MCaption({ c, i, n, progress, isLast, zStart }: {
  c: FeatureCard; i: number; n: number; progress: MotionValue<number>; isLast: boolean; zStart: number;
}) {
  const opacity = useTransform(progress, (p) => {
    const ad = Math.abs(deckPos(p, n) - i);
    const reveal = ramp(ad, 0.14, 0.42, 1, 0); // full near front, gone during the deal
    // Last card also clears just before its media zooms to black.
    return isLast ? Math.min(reveal, ramp(p, zStart - 0.05, zStart - 0.01, 1, 0)) : reveal;
  });
  const y = useTransform(progress, (p) => {
    const d = deckPos(p, n) - i;
    return d <= 0 ? ramp(d, -0.42, -0.06, 18, 0) : 0;
  });
  return (
    <motion.div className="u-fzoom-m-cap" style={{ opacity, y }}>
      <div className="u-hcard-title">
        <span style={{ color: c.tint, fontSize: 20 }}>{c.icon}</span>
        {c.title}
      </div>
      <p className="u-hcard-desc">{c.desc}</p>
    </motion.div>
  );
}

/**
 * Mobile replacement for the desktop pinned pan+zoom. Phones can't hold a
 * horizontal row (cards overflow, captions clip), so the section pins and
 * plays a 3D card deck: one media tile front and upright at a time, each
 * dealing up-and-away toward the camera as the next pops forward out of depth,
 * with a clean caption swapping in a fixed slot beneath. The last tile zooms
 * to black into the dark stories section; an ambient orange glow warms the
 * stage. Rendered only for narrow && !reduced-motion (FeatureZoom keeps the
 * static scroll-row fallback for reduced motion).
 */
export function FeatureZoomMobile({ cards, head }: { cards: FeatureCard[]; head: React.ReactNode }) {
  const ref = useRef<HTMLElement | null>(null);
  const lastMediaRef = useRef<HTMLDivElement | null>(null);
  const [coverScale, setCoverScale] = useState(8);
  const n = cards.length;
  const zStart = (n - 1) / n + (1 / n) * 0.5; // middle of the last segment

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useLayoutEffect(() => {
    const compute = () => {
      const m = lastMediaRef.current;
      if (!m) return;
      setCoverScale(
        Math.max(window.innerWidth / m.offsetWidth, window.innerHeight / m.offsetHeight) * 1.2,
      );
    };
    compute();
    const raf = requestAnimationFrame(compute);
    window.addEventListener("resize", compute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", compute);
    };
  }, []);

  const veilOpacity = useTransform(scrollYProgress, (p) => ramp(p, 0.96, 1, 0, 1));
  // Head fades out as the last card takes the stage so the zoom-to-black is clean.
  const headOpacity = useTransform(scrollYProgress, (p) =>
    ramp(p, 1 - 1 / n + 0.02, 1 - 1 / n + 0.1, 1, 0),
  );

  return (
    <section id="how" ref={ref} className="u-fzoom-m" style={{ height: `${n * 100}vh` }}>
      <div className="u-fzoom-m-sticky">
        <motion.div className="u-fzoom-m-head" style={{ opacity: headOpacity }}>
          {head}
        </motion.div>
        <div className="u-fzoom-m-stage">
          {cards.map((c, i) => (
            <MTile
              key={c.title}
              c={c}
              i={i}
              n={n}
              progress={scrollYProgress}
              isLast={i === n - 1}
              zStart={zStart}
              coverScale={coverScale}
              mediaRef={i === n - 1 ? lastMediaRef : undefined}
            />
          ))}
        </div>
        <div className="u-fzoom-m-capslot">
          {cards.map((c, i) => (
            <MCaption
              key={c.title}
              c={c}
              i={i}
              n={n}
              progress={scrollYProgress}
              isLast={i === n - 1}
              zStart={zStart}
            />
          ))}
        </div>
        <motion.div className="u-fzoom-veil" style={{ opacity: veilOpacity }} aria-hidden />
      </div>
    </section>
  );
}
