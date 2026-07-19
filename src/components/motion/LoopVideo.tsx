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
  const [loaded, setLoaded] = useState(false);
  const markLoaded = useCallback(() => setLoaded(true), []);
  // Media can finish loading before hydration attaches event handlers —
  // check readiness when the ref lands too.
  const videoRef = useCallback((el: HTMLVideoElement | null) => {
    if (el && el.readyState >= 2) setLoaded(true);
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
