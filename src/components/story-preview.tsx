"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  {
    chap: "Chapter 2 — The little light",
    body: (
      <>
        The path through the Whispering Woods was darker than{" "}
        <strong>Maya</strong> expected. But in her small hand, the lantern her
        grandmother gave her glowed a steady, stubborn gold…
      </>
    ),
  },
  {
    chap: "Chapter 3 — A whisper in the dark",
    body: (
      <>
        Something rustled beyond the ferns. <strong>Maya</strong> held the
        lantern higher — not because she wasn&apos;t scared, but because being
        scared and brave can happen at the very same time.
      </>
    ),
  },
  {
    chap: "Chapter 4 — The owl with kind eyes",
    body: (
      <>
        &ldquo;You carry a warm little sun,&rdquo; the old owl said softly.{" "}
        <strong>Maya</strong> smiled — and the forest, just for a moment,
        seemed to smile back.
      </>
    ),
  },
];

const SLIDE_MAP = [0, 0, 1, 2, 2];
const CAPTIONS = [
  "[ ILLUSTRATION · CH.1 · MAYA LEAVES HOME ]",
  "[ ILLUSTRATION · CH.2 · THE WHISPERING WOODS ]",
  "[ ILLUSTRATION · CH.3 · FERNS RUSTLING ]",
  "[ ILLUSTRATION · CH.4 · OWL WITH KIND EYES ]",
  "[ ILLUSTRATION · CH.5 · HOME BY LANTERN LIGHT ]",
];
const PAGE_LABELS = [
  "Page 2 of 18",
  "Page 5 of 18",
  "Page 9 of 18",
  "Page 13 of 18",
  "Page 17 of 18",
];

export function StoryPreview() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setI((prev) => (prev + 1) % 5);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const activeSlide = SLIDE_MAP[i];
  const filledCount = i + 1;

  return (
    <div className="story-preview" role="img" aria-label="Example story preview">
      <div className="sp-header">
        <div className="sp-title">Maya &amp; the Brave Lantern</div>
        <div className="sp-chip">Bravery</div>
      </div>
      <div className="sp-illustration">
        <div className="sp-moon" />
        <div className="sp-star" />
        <div className="sp-star" />
        <div className="sp-star" />
        <div className="sp-star" />
        <div className="sp-sparkle" />
        <div className="sp-sparkle" />
        <div className="sp-sparkle" />
        <div className="sp-mountain" />
        <div className="placeholder-label">{CAPTIONS[i]}</div>
      </div>
      <div className="sp-text">
        {SLIDES.map((s, idx) => (
          <div
            key={idx}
            className={`chapter-slide${idx === activeSlide ? " active" : ""}`}
          >
            <span className="chap">{s.chap}</span>
            {s.body}
          </div>
        ))}
      </div>
      <div className="sp-chapters">
        {[0, 1, 2, 3, 4].map((idx) => (
          <span key={idx} className={idx < filledCount ? "filling" : ""} />
        ))}
      </div>
      <div className="sp-controls">
        <div className="sp-play">Read to me</div>
        <div className="sp-pages">{PAGE_LABELS[i]}</div>
      </div>
    </div>
  );
}
