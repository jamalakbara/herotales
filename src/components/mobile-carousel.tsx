"use client";

import { Children, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * A section that renders as its passed grid/flex layout on desktop and a native
 * scroll-snap swipe carousel on mobile (behaviour keyed to `.m-carousel` in
 * globals.css at ≤640px — the browser drives the swipe; JS only reads the
 * snapped index to drive the dot rail). Pass the desktop layout via `className`
 * + `style`; the mobile rules override with `!important`. See the "Mobile swipe
 * carousel + dot rail" entry in docs/DESIGN_SYSTEM.md.
 */
export function MobileCarousel({ id, className, style, children }: {
  id?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const count = Children.count(children);

  const slideWidth = () => {
    const el = ref.current;
    if (!el) return 0;
    const first = el.firstElementChild as HTMLElement | null;
    return first ? first.offsetWidth + 20 : el.clientWidth;
  };
  const onScroll = () => {
    const w = slideWidth();
    if (w) setSlide(Math.round((ref.current?.scrollLeft ?? 0) / w));
  };
  const go = (i: number) => {
    ref.current?.scrollTo({ left: i * slideWidth(), behavior: "smooth" });
  };

  return (
    <>
      <div ref={ref} id={id} onScroll={onScroll} className={`m-carousel${className ? ` ${className}` : ""}`} style={style}>
        {children}
      </div>
      <div className="m-carousel-dots">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type="button"
            className={`m-carousel-dot${slide === i ? " active" : ""}`}
            onClick={() => go(i)}
            aria-label={`Show card ${i + 1}`}
          />
        ))}
      </div>
    </>
  );
}
