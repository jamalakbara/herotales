"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { LoopVideo } from "./LoopVideo";
import { useMediaQuery } from "../use-media-query";

export type FeatureCard = {
  icon: string;
  title: string;
  desc: string;
  tint: string;
  /** Seamless-loop card video (Cloudinary boomerang mp4). */
  video?: string;
  /** Poster / reduced-motion still for the video. */
  poster?: string;
};

type FeatureZoomProps = {
  cards: FeatureCard[];
  /** Section heading block (kicker + title), pinned above the track. */
  head: React.ReactNode;
};

/**
 * Card media: a seamless-loop video when the card provides one (still poster
 * under reduced motion), otherwise the accent glyph. Mirrors the hero scene
 * video's autoplay/loop/poster contract.
 */
function CardMedia({ c }: { c: FeatureCard }) {
  if (!c.video) {
    return <span style={{ fontSize: 68, color: c.tint }}>{c.icon}</span>;
  }
  return <LoopVideo video={c.video} poster={c.poster} className="u-hcard-video" />;
}

function Card({ c }: { c: FeatureCard }) {
  return (
    <div className="u-hcard">
      <div className="u-hcard-media">
        <CardMedia c={c} />
      </div>
      <div className="u-hcard-title">
        <span style={{ color: c.tint, fontSize: 20 }}>{c.icon}</span>
        {c.title}
      </div>
      <p className="u-hcard-desc">{c.desc}</p>
    </div>
  );
}

/**
 * Pinned feature row that hands itself into the dark stories section, in one
 * scroll timeline: the row pans left until the FINAL card is centred, then that
 * same card's media zooms to full-bleed and darkens to --twilight-deep →
 * seamless black into `.u-stories` (umano's "last card zooms into the next
 * section"). The centre offset + cover scale are measured from layout so the
 * real last card is the zoom target (no duplicate). Degrades to a plain
 * horizontal-scroll row under reduced motion.
 */
export function FeatureZoom({ cards, head }: FeatureZoomProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const narrow = useMediaQuery("(max-width: 720px)");
  const [endX, setEndX] = useState(0);
  const [coverScale, setCoverScale] = useState(8);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useLayoutEffect(() => {
    if (reduce) return;
    const compute = () => {
      const card = cardRef.current;
      const media = mediaRef.current;
      const track = trackRef.current;
      if (!card || !media || !track) return;
      // Screen-space centre of the card at rest: getBoundingClientRect() gives
      // true on-screen X, minus whatever translateX the track currently carries
      // (0 at mount, non-zero if we re-measure mid-scroll on resize).
      const rect = card.getBoundingClientRect();
      const tx = new DOMMatrixReadOnly(getComputedStyle(track).transform).m41;
      const restCenterX = rect.left + rect.width / 2 - tx;
      setEndX(window.innerWidth / 2 - restCenterX);
      setCoverScale(
        Math.max(
          window.innerWidth / media.offsetWidth,
          window.innerHeight / media.offsetHeight,
        ) * 1.15,
      );
    };
    compute();
    const raf = requestAnimationFrame(compute); // re-measure after fonts/layout settle
    window.addEventListener("resize", compute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", compute);
    };
  }, [reduce, cards.length]);

  const intro = cards.slice(0, -1);
  const last = cards[cards.length - 1];

  // Row pans left until the last card sits dead-centre, then holds.
  const trackX = useTransform(scrollYProgress, [0, 0.6, 1], [0, endX, endX]);
  // Heading slides up and out (transform never lags) as it fades — guarantees
  // it's gone before the zoom, regardless of any opacity easing.
  const headY = useTransform(scrollYProgress, [0.32, 0.54], [0, -460]);
  const headOpacity = useTransform(scrollYProgress, [0.34, 0.5], [1, 0]);

  // Last card's media zooms + darkens; its caption fades before the zoom. The
  // zoom/darken/veil run all the way to the pin end (progress 1) so there's no
  // dead black tail — the black hands straight into the next section.
  const zoom = useTransform(scrollYProgress, [0.6, 1], [1, coverScale]);
  const radius = useTransform(scrollYProgress, [0.6, 0.92], [16, 0]);
  // Hex literal (not a CSS var) — framer can only interpolate real color values.
  // Keep in sync with --twilight-deep in globals.css.
  const mediaBg = useTransform(scrollYProgress, [0.58, 0.92], ["#ffffff", "#0C0B0F"]);
  // On mobile the pan distance is short so the card centres fast; give the caption
  // more dwell time — fade starts AFTER the pan ends (0.6) not during it.
  //
  // Function form (not the [in]→[out] array form) is deliberate: framer compiles
  // the array form into a native WAAPI animation on a ViewTimeline tied to this
  // element's own viewport progress. That progress is NON-monotonic here (the cap
  // is simultaneously translated by capY, covered by the zooming media, and the
  // row barely pans on mobile) so the baked opacity flickered 1→0→1. The function
  // form stays on the JS/rAF path driven by scrollYProgress (the section
  // timeline), which is monotonic — no flicker.
  const capFade = narrow ? [0.60, 0.76] : [0.46, 0.56];
  const capOpacity = useTransform(scrollYProgress, (p) => {
    const [a, b] = capFade;
    if (p <= a) return 1;
    if (p >= b) return 0;
    return 1 - (p - a) / (b - a);
  });
  const capY = useTransform(scrollYProgress, narrow ? [0.60, 0.78] : [0.46, 0.58], [0, 120]);
  const glyphOpacity = useTransform(scrollYProgress, [0.72, 0.9], [1, 0]);
  // Video fades as the zoom finishes so the darkened media bg (→ black) shows
  // through — screen is black before the next section, not the frozen frame.
  const mediaOpacity = useTransform(scrollYProgress, [0.82, 0.96], [1, 0]);
  // Veil closes to full black right at the pin end (also the ultrawide backstop).
  const veilOpacity = useTransform(scrollYProgress, [0.9, 1], [0, 1]);

  // Phones can't hold the pinned horizontal pan+zoom (cards are ~78vw, the pan is
  // tiny, and the scrubbed caption fade was fragile — see the WAAPI note above).
  // Swap in a swipeable snap carousel: cards snap to centre, the centred one pops
  // full-size while neighbours shrink + dim, with a dot pager. Pure CSS
  // scroll-snap (JS only tracks the active index) — no scroll-scrubbed motion.
  if (narrow) {
    return <FeatureCarousel cards={cards} head={head} />;
  }
  // Reduced motion (wide): a plain horizontal-scroll row.
  if (reduce) {
    return (
      <section id="how" className="u-fzoom-static">
        <div className="u-track-head">{head}</div>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "flex", gap: 28, padding: "0 48px" }}>
            {cards.map((c) => (
              <Card key={c.title} c={c} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="how" ref={ref} className="u-fzoom">
      <div className="u-fzoom-sticky">
        <motion.div className="u-track-head u-fzoom-head" style={{ opacity: headOpacity, y: headY }}>
          {head}
        </motion.div>

        <motion.div ref={trackRef} className="u-fzoom-track" style={{ x: trackX }}>
          {intro.map((c) => (
            <Card key={c.title} c={c} />
          ))}

          {/* Final card — the zoom target (stays in the row, no duplicate) */}
          <div ref={cardRef} className="u-hcard u-fzoom-last">
            <motion.div
              ref={mediaRef}
              className="u-hcard-media u-fzoom-media"
              style={{ scale: zoom, borderRadius: radius, background: mediaBg }}
            >
              {last.video ? (
                <motion.div style={{ opacity: mediaOpacity, width: "100%", height: "100%" }}>
                  <LoopVideo video={last.video} poster={last.poster} className="u-hcard-video" />
                </motion.div>
              ) : (
                <motion.span style={{ fontSize: 68, color: last.tint, opacity: glyphOpacity }}>
                  {last.icon}
                </motion.span>
              )}
            </motion.div>
            <motion.div className="u-fzoom-cap" style={{ opacity: capOpacity, y: capY }}>
              <div className="u-hcard-title">
                <span style={{ color: last.tint, fontSize: 20 }}>{last.icon}</span>
                {last.title}
              </div>
              <p className="u-hcard-desc">{last.desc}</p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div className="u-fzoom-veil" style={{ opacity: veilOpacity }} aria-hidden />
      </div>
    </section>
  );
}

/**
 * Mobile feature carousel (≤720px): a swipeable, centre-snapping row. The
 * centred card pops to full size while its neighbours shrink + dim; a dot pager
 * mirrors the active card and lets you jump. Snapping + focus scaling are pure
 * CSS (`scroll-snap` + a `.is-active` class); an IntersectionObserver watching a
 * thin centre band only tracks which card is active — no scroll-scrubbed motion,
 * so none of the WAAPI/ViewTimeline fragility the pinned zoom hit.
 */
function FeatureCarousel({ cards, head }: FeatureZoomProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.querySelectorAll<HTMLElement>("[data-fc-item]"));
    // Shrink the observer root to a thin central band (10% wide) so the card
    // sitting under the centre is the one reported active.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = items.indexOf(e.target as HTMLElement);
            if (i >= 0) setActive(i);
          }
        }
      },
      { root: track, rootMargin: "0px -45% 0px -45%", threshold: 0 },
    );
    items.forEach((it) => io.observe(it));
    return () => io.disconnect();
  }, [cards.length]);

  const goTo = (i: number) => {
    const track = trackRef.current;
    const item = track?.querySelectorAll<HTMLElement>("[data-fc-item]")[i];
    item?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  return (
    <section id="how" className="u-fzoom-static">
      <div className="u-track-head">{head}</div>
      <div className="u-fcar" ref={trackRef}>
        {cards.map((c, i) => (
          <div
            key={c.title}
            data-fc-item
            className={`u-fcar-item${i === active ? " is-active" : ""}`}
          >
            <Card c={c} />
          </div>
        ))}
      </div>
      <div className="u-fcar-dots" role="tablist" aria-label="Feature cards">
        {cards.map((c, i) => (
          <button
            key={c.title}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={c.title}
            className={`u-fcar-dot${i === active ? " is-active" : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </section>
  );
}
