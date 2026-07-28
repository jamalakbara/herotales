"use client";

import Image from "next/image";
import HTMLFlipBook from "react-pageflip";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AmbientDecor } from "@/components/motion/AmbientDecor";
import { Skeleton } from "@/components/skeleton";
import { SparklesIcon } from "@/components/ui/sparkles";
import { ArrowLeftIcon } from "@/components/ui/arrow-left";
import { ArrowRightIcon } from "@/components/ui/arrow-right";

export type FlipChapter = {
  label: string;
  title: string;
  caption: string;
  chip: string;
  paras: string[];
};

type Props = {
  chapters: FlipChapter[];
  imageByIndex: Map<number, string>;
  reduce: boolean;
  onEnd?: () => void;
  onChapter?: (chapterIdx: number) => void;
};

// Ambient starfield reused for chapters that have no illustration yet.
const STAR_POSITIONS: Array<React.CSSProperties> = [
  { top: 50, left: 60, width: 6, height: 6, animationDelay: "0s" },
  { top: 90, left: 130, width: 4, height: 4, animationDelay: "0.6s" },
  { top: 130, left: 50, width: 5, height: 5, animationDelay: "1.1s" },
  { top: 70, right: 40, width: 4, height: 4, animationDelay: "1.4s" },
  { top: 180, right: 110, width: 5, height: 5, animationDelay: "0.3s" },
  { top: 220, left: 100, width: 3, height: 3, animationDelay: "1.8s" },
];

// One spread per chapter: illustration face (left) + a single text face (right)
// holding the whole chapter. The text box scrolls if a chapter overruns the page
// rather than spilling onto extra pages, so image and text always stay paired.
type FBPage =
  | { chapterIdx: number; kind: "illus" }
  | { chapterIdx: number; kind: "text" };

/** Wrap a chapter's paragraphs as HTML for the text face. */
function parasHtml(paras: string[]): string {
  return paras.map((p) => `<p>${p}</p>`).join("") || "";
}

function IllusFace({ chapter, image, onImgLoad, loaded }: {
  chapter: FlipChapter;
  image: string | null;
  onImgLoad: (u: string) => void;
  loaded: boolean;
}) {
  return (
    <div className="illus fb-illus-inner">
      <div className="tag-chap">{chapter.chip}</div>
      {image ? (
        <>
          <Image
            src={image}
            alt={chapter.title}
            fill
            sizes="(max-width: 720px) 100vw, 460px"
            style={{ objectFit: "contain" }}
            onLoad={() => onImgLoad(image)}
          />
          {!loaded && <Skeleton variant="media" />}
        </>
      ) : (
        <>
          <div className="moon-big" />
          {STAR_POSITIONS.map((s, i) => (
            <div key={i} className="star" style={s} />
          ))}
          <div className="tree" style={{ left: "12%" }} />
          <div className="mountain" />
          <AmbientDecor
            variant="dark"
            stars={[]}
            fireflies={[
              { left: "22%", bottom: "26%", delay: "0s", dur: "8s" },
              { left: "72%", bottom: "18%", delay: "1.2s", dur: "7s" },
            ]}
          />
        </>
      )}
    </div>
  );
}

/** Chapter text face that auto-shrinks its type to fit one page (no scroll). */
function TextFace({ chapter, isEnd }: { chapter: FlipChapter; isEnd: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const MIN = 0.62; // don't shrink below ~62% — past this it reads too small
    const fit = () => {
      let s = 1;
      el.style.setProperty("--fb-scale", "1");
      // Font-size drives wrapping, so shrink stepwise and re-measure each pass.
      let guard = 0;
      while (el.scrollHeight > el.clientHeight + 1 && s > MIN && guard < 40) {
        s = Math.max(MIN, s - 0.03);
        el.style.setProperty("--fb-scale", String(s));
        guard += 1;
      }
    };
    fit();
    // Re-fit once web fonts settle (metrics differ from the fallback) …
    document.fonts?.ready.then(fit).catch(() => {});
    // … and whenever the page box resizes (viewport / portrait↔landscape).
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [chapter]);

  return (
    <div className="fb-text-inner" ref={ref}>
      <span className="chap-label">{chapter.label}</span>
      <h2 className="chap-title">{chapter.title}</h2>
      <div
        className="story-text fb-firsttext"
        dangerouslySetInnerHTML={{ __html: parasHtml(chapter.paras) }}
      />
      {isEnd && <div className="fb-end" style={{ display: "flex", alignItems: "center", gap: 6 }}><SparklesIcon size={14} /> The end</div>}
    </div>
  );
}

export function FlipReader({ chapters, imageByIndex, reduce, onEnd, onChapter }: Props) {
  // Book init touches the DOM — gate to client after mount to avoid SSR/hydration.
  const [mounted, setMounted] = useState(false);
  const [loadedImgs, setLoadedImgs] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  // Spread mode reports the LEFT page index on flip, so the last page is visible
  // one index early — track orientation to know when we've truly hit the end.
  const [spread, setSpread] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);

  // Client-only mount gate so the DOM-manipulating book never inits during SSR.
  // (A lazy useState initialiser would desync server/client and mismatch hydration.)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const markLoaded = (u: string) =>
    setLoadedImgs((prev) => (prev.has(u) ? prev : new Set(prev).add(u)));

  const pages: FBPage[] = useMemo(() => {
    const out: FBPage[] = [];
    chapters.forEach((_, ci) => {
      out.push({ chapterIdx: ci, kind: "illus" });
      out.push({ chapterIdx: ci, kind: "text" });
    });
    return out;
  }, [chapters]);

  const curChapter = pages[Math.min(page, pages.length - 1)]?.chapterIdx ?? 0;

  useEffect(() => {
    onChapter?.(curChapter);
  }, [curChapter, onChapter]);

  const flip = (dir: 1 | -1) => {
    const api = bookRef.current?.pageFlip?.();
    if (!api) return;
    if (dir === 1) api.flipNext();
    else api.flipPrev();
  };

  // Reduced motion / no-JS-friendly fallback: a plain vertical stack, no flipping.
  if (reduce) {
    return (
      <div className="fb-fallback">
        {chapters.map((ch, ci) => (
          <div key={ci} className="fb-fallback-ch">
            <div className="fb-illus fb-illus-static">
              <IllusFace
                chapter={ch}
                image={imageByIndex.get(ci) ?? null}
                onImgLoad={markLoaded}
                loaded={loadedImgs.has(imageByIndex.get(ci) ?? "")}
              />
            </div>
            <div className="story-col">
              <span className="chap-label">{ch.label}</span>
              <h2 className="chap-title">{ch.title}</h2>
              <div
                className="story-text"
                dangerouslySetInnerHTML={{ __html: parasHtml(ch.paras) }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const total = chapters.length;
  const atStart = page <= 0;
  // In a two-page spread the final page shows one index early (page = left index).
  const atEnd = page >= pages.length - (spread ? 2 : 1);

  return (
    <div className="fb-wrap">
      <div className="fb-stage">
        {mounted && (
          // @ts-expect-error — react-pageflip's types predate React 19 JSX.
          <HTMLFlipBook
            ref={bookRef}
            className="fb-book"
            style={{}}
            width={400}
            height={700}
            minWidth={280}
            maxWidth={460}
            minHeight={490}
            maxHeight={805}
            size="stretch"
            drawShadow
            maxShadowOpacity={0.5}
            flippingTime={800}
            usePortrait
            mobileScrollSupport
            showCover={false}
            onFlip={(e: { data: number }) => setPage(e.data)}
            onInit={() =>
              setSpread(bookRef.current?.pageFlip?.()?.getOrientation?.() === "landscape")
            }
            onChangeOrientation={(e: { data: string }) => setSpread(e.data === "landscape")}
          >
            {pages.map((p, i) => (
              <div className="fb-page" key={i}>
                {p.kind === "illus" ? (
                  <div className="fb-illus">
                    <IllusFace
                      chapter={chapters[p.chapterIdx]}
                      image={imageByIndex.get(p.chapterIdx) ?? null}
                      onImgLoad={markLoaded}
                      loaded={loadedImgs.has(imageByIndex.get(p.chapterIdx) ?? "")}
                    />
                  </div>
                ) : (
                  <div className="fb-text">
                    <TextFace
                      chapter={chapters[p.chapterIdx]}
                      isEnd={p.chapterIdx === chapters.length - 1}
                    />
                  </div>
                )}
                <span className="fb-folio">{p.chapterIdx + 1}</span>
              </div>
            ))}
          </HTMLFlipBook>
        )}
      </div>

      <div className="chap-nav fb-controls">
        <button
          type="button"
          className="nav-chip"
          style={{ visibility: atStart ? "hidden" : "visible" }}
          onClick={() => flip(-1)}
        >
          <span className="big"><ArrowLeftIcon size={24} /></span>
          <div className="nv-lbl">Previous</div>
        </button>
        <div className="chap-counter">
          <span className="now">{curChapter + 1}</span> / {total}
          <span className="swipe-hint">Drag the corner to turn the page</span>
        </div>
        <button
          type="button"
          className="nav-chip next"
          onClick={() => (atEnd ? onEnd?.() : flip(1))}
        >
          <div className="nv-lbl">{atEnd ? "The end" : "Next"}</div>
          <span className="big"><ArrowRightIcon size={24} /></span>
        </button>
      </div>
    </div>
  );
}
