"use client";

import { useCallback, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Skeleton } from "@/components/skeleton";

/**
 * Ambient loop video for landing cards. Mirrors the hero scene-video contract
 * (autoplay/muted/loop/poster) and swaps to a still poster `<img>` under
 * `prefers-reduced-motion`. Shared by the hero scene, feature cards and the
 * blueprint fan. Shows a skeleton over the (positioned) parent container
 * until the first frame is ready.
 */
export function LoopVideo({
  video,
  poster,
  className,
}: {
  video: string;
  poster?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  // When a poster is provided the <video poster> attribute handles the visual
  // placeholder — no skeleton needed. Without a poster we need the skeleton
  // until the first frame arrives.
  const [loaded, setLoaded] = useState(!!poster);
  const markLoaded = useCallback(() => setLoaded(true), []);
  // Media can finish loading before hydration attaches event handlers —
  // check readiness when the ref lands too. iOS Safari also gates autoplay on
  // the `muted` *attribute* (React only sets the property) and needs an
  // explicit play() nudge, so force both here.
  const videoRef = useCallback((el: HTMLVideoElement | null) => {
    if (!el) return;
    el.muted = true;
    el.setAttribute("muted", "");
    if (el.readyState >= 2) setLoaded(true);
    const p = el.play();
    if (p) p.catch(() => {});
  }, []);
  const imgRef = useCallback((el: HTMLImageElement | null) => {
    if (el?.complete) setLoaded(true);
  }, []);

  if (reduce) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          className={className}
          src={poster}
          alt=""
          aria-hidden
          onLoad={markLoaded}
        />
        {!loaded && <Skeleton variant="media" />}
      </>
    );
  }
  return (
    <>
      <video
        ref={videoRef}
        className={className}
        src={video}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
        onLoadedData={markLoaded}
      />
      {!loaded && <Skeleton variant="media" />}
    </>
  );
}
