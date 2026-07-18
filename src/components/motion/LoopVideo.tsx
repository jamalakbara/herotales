"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Ambient loop video for landing cards. Mirrors the hero scene-video contract
 * (autoplay/muted/loop/poster) and swaps to a still poster `<img>` under
 * `prefers-reduced-motion`. Shared by the feature cards and the blueprint fan.
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
  if (reduce) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={poster} alt="" aria-hidden />;
  }
  return (
    <video
      className={className}
      src={video}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      aria-hidden
    />
  );
}
