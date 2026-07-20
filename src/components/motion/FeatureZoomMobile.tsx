"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { LoopVideo } from "./LoopVideo";
import type { FeatureCard } from "./FeatureZoom";

/** Piecewise-linear ramp: `from` at/below `a`, `to` at/above `b`, linear between.
 *  Used inside function-form useTransform so every value stays on the JS/rAF
 *  path (framer only hardware-accelerates the array form, which on this pinned
 *  stage lands on a non-monotonic ViewTimeline — see FeatureZoom's capOpacity). */
const ramp = (p: number, a: number, b: number, from: number, to: number) =>
  p <= a ? from : p >= b ? to : from + (to - from) * ((p - a) / (b - a));

type MCardProps = {
  c: FeatureCard;
  i: number;
  n: number;
  progress: MotionValue<number>;
  isLast: boolean;
  coverScale: number;
  mediaRef?: React.Ref<HTMLDivElement>;
};

/**
 * One feature card in the mobile stage. Each card owns a scroll segment
 * `[i/n, (i+1)/n]`: it scales + slides + un-rotates into centre, holds fully
 * readable, then (unless last) scales + slides out as the next takes over. The
 * caption reveals a beat after the card so the eye lands on the art first. The
 * last card doesn't exit — its media zooms full-bleed and darkens to black,
 * handing off to the dark stories section (mirrors the desktop zoom).
 */
function MCard({ c, i, n, progress, isLast, coverScale, mediaRef }: MCardProps) {
  const seg = 1 / n;
  const enterMid = i * seg; // start of this card's segment = when it finishes arriving
  const exitMid = (i + 1) * seg; // when the NEXT card has fully covered this one
  // Slide-and-cover: each card slides up from below over the tail of the
  // previous segment and sits at rest (higher z-index) covering the one before
  // it, then holds through its own segment until the next card covers it. There
  // is always exactly one opaque card on screen — no blank blink between cards,
  // no double-exposed media. The motion reverses cleanly on scroll-up.
  const W = seg * 0.5; // slide-in occupies the last half of the previous segment

  const y = useTransform(progress, (p) => (i === 0 ? 0 : ramp(p, enterMid - W, enterMid, 480, 0)));
  const opacity = useTransform(progress, (p) => {
    const rise = i === 0 ? 1 : ramp(p, enterMid - W, enterMid - W * 0.5, 0, 1);
    // Once covered by the next card, fade to 0 (invisible behind it) so nothing
    // lurks under the top card — e.g. so the last card's fading caption reveals
    // the page, not the previous card's caption.
    const clear = isLast ? 1 : ramp(p, exitMid + W * 0.15, exitMid + W * 0.6, 1, 0);
    return Math.min(rise, clear);
  });
  const scale = useTransform(progress, (p) => (i === 0 ? 1 : ramp(p, enterMid - W, enterMid, 0.94, 1)));

  // Last card fades its caption out just before the zoom-to-black takes over.
  const zStart = 1 - seg * 0.5;
  const capOpacity = useTransform(progress, (p) =>
    isLast ? ramp(p, zStart - seg * 0.18, zStart, 1, 0) : 1,
  );

  // Last card only: media zooms + rounds off + darkens to black over the tail.
  const mediaScale = useTransform(progress, (p) =>
    isLast ? ramp(p, zStart, 1, 1, coverScale) : 1,
  );
  const mediaRadius = useTransform(progress, (p) =>
    isLast ? ramp(p, zStart, zStart + (1 - zStart) * 0.7, 18, 0) : 18,
  );
  // Color needs the array form (framer interpolates real colors); the media's
  // own scroll progress is monotonic through the zoom, so no flicker here.
  const mediaBg = useTransform(
    progress,
    isLast ? [zStart, zStart + (1 - zStart) * 0.7] : [0, 1],
    isLast ? ["#ffffff", "#0C0B0F"] : ["#ffffff", "#ffffff"],
  );
  const videoOpacity = useTransform(progress, (p) =>
    isLast ? ramp(p, 0.9, 0.99, 1, 0) : 1,
  );

  return (
    <motion.div
      className="u-fzoom-m-card"
      style={{ opacity, scale, y, zIndex: i + 1 /* later cards cover earlier ones */ }}
    >
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
      <motion.div className="u-fzoom-m-cap" style={{ opacity: capOpacity }}>
        <div className="u-hcard-title">
          <span style={{ color: c.tint, fontSize: 20 }}>{c.icon}</span>
          {c.title}
        </div>
        <p className="u-hcard-desc">{c.desc}</p>
      </motion.div>
    </motion.div>
  );
}

/** A progress dot; the one whose segment holds the current scroll is filled + grown. */
function Dot({ i, n, progress }: { i: number; n: number; progress: MotionValue<number> }) {
  const seg = 1 / n;
  const center = (i + 0.5) * seg;
  const opacity = useTransform(progress, (p) => (Math.abs(p - center) < seg * 0.5 ? 1 : 0.28));
  const scale = useTransform(progress, (p) => (Math.abs(p - center) < seg * 0.5 ? 1.4 : 1));
  return <motion.span className="u-fzoom-m-dot" style={{ opacity, scale }} />;
}

/**
 * Mobile replacement for the desktop pinned pan+zoom. Phones can't hold a
 * horizontal row (cards overflow, captions clip), so instead the section pins
 * and deals ONE full-width card at a time: each slides up from below to cover
 * the previous one, holds fully readable, then is covered by the next — with
 * the last card zooming to black into the dark stories section. Progress dots
 * track position; an ambient orange glow warms the stage. Rendered only for
 * narrow && !reduced-motion (FeatureZoom keeps the static scroll-row fallback
 * for reduced motion).
 */
export function FeatureZoomMobile({ cards, head }: { cards: FeatureCard[]; head: React.ReactNode }) {
  const ref = useRef<HTMLElement | null>(null);
  const lastMediaRef = useRef<HTMLDivElement | null>(null);
  const [coverScale, setCoverScale] = useState(8);
  const n = cards.length;

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
  const headOpacity = useTransform(scrollYProgress, (p) => ramp(p, 1 - 1 / n + 0.02, 1 - 1 / n + 0.1, 1, 0));

  return (
    <section id="how" ref={ref} className="u-fzoom-m" style={{ height: `${n * 100}vh` }}>
      <div className="u-fzoom-m-sticky">
        <motion.div className="u-fzoom-m-head" style={{ opacity: headOpacity }}>
          {head}
        </motion.div>
        <div className="u-fzoom-m-stage">
          {cards.map((c, i) => (
            <MCard
              key={c.title}
              c={c}
              i={i}
              n={n}
              progress={scrollYProgress}
              isLast={i === n - 1}
              coverScale={coverScale}
              mediaRef={i === n - 1 ? lastMediaRef : undefined}
            />
          ))}
        </div>
        <motion.div className="u-fzoom-m-dots" style={{ opacity: headOpacity }}>
          {cards.map((c, i) => (
            <Dot key={c.title} i={i} n={n} progress={scrollYProgress} />
          ))}
        </motion.div>
        <motion.div className="u-fzoom-veil" style={{ opacity: veilOpacity }} aria-hidden />
      </div>
    </section>
  );
}
