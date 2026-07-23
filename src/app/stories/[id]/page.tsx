"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, useScroll, useReducedMotion } from "framer-motion";
import { AppFooter } from "@/components/app-footer";
import { FloatingNav, ReaderBack } from "@/components/floating-nav";
import { AmbientDecor } from "@/components/motion/AmbientDecor";
import { Reveal } from "@/components/motion/Reveal";
import { Skeleton } from "@/components/skeleton";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Chapter = {
  label: string;
  title: string;
  caption: string;
  chip: string;
  paras: string[];
};

type StoryRow = {
  id: string;
  blueprint: string;
  length: string;
  voice: string | null;
  status: "pending" | "generating" | "ready" | "failed";
  progress: number;
  title: string | null;
  full_text: Chapter[] | null;
  favorite: boolean;
  error: string | null;
  children: { nickname: string; age: number; pronouns: string } | { nickname: string; age: number; pronouns: string }[] | null;
};

type ImageRow = { chapter_index: number; url: string | null };

const SPEEDS = ["0.75×", "1×", "1.25×", "1.5×"];

const STAR_POSITIONS: Array<React.CSSProperties> = [
  { top: 50, left: 60, width: 6, height: 6, animationDelay: "0s" },
  { top: 90, left: 130, width: 4, height: 4, animationDelay: "0.6s" },
  { top: 130, left: 50, width: 5, height: 5, animationDelay: "1.1s" },
  { top: 70, right: 40, width: 4, height: 4, animationDelay: "1.4s" },
  { top: 180, right: 110, width: 5, height: 5, animationDelay: "0.3s" },
  { top: 220, left: 100, width: 3, height: 3, animationDelay: "1.8s" },
];

function pickChild(children: StoryRow["children"]) {
  if (!children) return null;
  return Array.isArray(children) ? children[0] ?? null : children;
}

export default function StoryReaderPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const [story, setStory] = useState<StoryRow | null>(null);
  const [images, setImages] = useState<ImageRow[]>([]);
  const [loadedImgs, setLoadedImgs] = useState<Set<string>>(new Set());
  const [loadError, setLoadError] = useState<string | null>(null);

  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [spIdx, setSpIdx] = useState(1);
  const [fillPct, setFillPct] = useState(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchStory = useCallback(async () => {
    const res = await fetch(`/api/stories/${id}`, { cache: "no-store" });
    if (res.status === 401) {
      router.push(`/sign-in?next=${encodeURIComponent(`/stories/${id}`)}`);
      return null;
    }
    if (res.status === 404) {
      setLoadError("Story not found.");
      return null;
    }
    if (!res.ok) {
      setLoadError(`Failed to load story (${res.status})`);
      return null;
    }
    const j = (await res.json()) as { story: StoryRow; images: ImageRow[] };
    setStory(j.story);
    setImages(j.images ?? []);
    return j.story;
  }, [id, router]);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      const s = await fetchStory();
      if (cancelled || !s) return;
      if (s.status === "pending" || s.status === "generating") {
        pollTimer.current = setTimeout(tick, 2000);
      }
    }
    tick();
    return () => {
      cancelled = true;
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [fetchStory]);

  const child = pickChild(story?.children ?? null);
  const heroName = child?.nickname ?? "Hero";
  const heroAge = child?.age ?? 5;
  const blueprint = story?.blueprint ?? "Bravery";
  const lengthLabel = story?.length ?? "Bedtime";
  const voice = story?.voice ?? "Juniper";
  const lengthMap: Record<string, string> = { Shortie: "3 min", Bedtime: "7 min", "Long tale": "12 min" };
  const readMins = lengthMap[lengthLabel] ?? "7 min";

  const chapters = story?.full_text ?? [];
  const chapter: Chapter | null = chapters[cur] ?? null;
  const prevIdx = cur > 0 ? cur - 1 : null;
  const nextIdx = chapters.length > 0 && cur < chapters.length - 1 ? cur + 1 : null;
  const ready = story?.status === "ready" && chapters.length > 0;

  const voiceDesc = useMemo(() => {
    const map: Record<string, string> = {
      Juniper: "Warm, unhurried · narration coming soon",
      Atlas: "Soft grandfather · narration coming soon",
      Wren: "Bright, theatrical · narration coming soon",
      "My voice": "Your voice · narration coming soon",
    };
    return map[voice ?? "Juniper"] ?? "Warm, unhurried · narration coming soon";
  }, [voice]);

  const imageByIndex = useMemo(() => {
    const map = new Map<number, string>();
    for (const img of images) if (img.url) map.set(img.chapter_index, img.url);
    return map;
  }, [images]);

  function render(i: number) {
    setCur(i);
    if (chapters.length) setFillPct(((i + 1) / chapters.length) * 100);
  }

  function onProgClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setFillPct(Math.max(0, Math.min(100, pct)));
  }

  async function toggleFavorite() {
    if (!story) return;
    const next = !story.favorite;
    setStory({ ...story, favorite: next });
    try {
      await fetch(`/api/stories/${id}/favorite`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ favorite: next }),
      });
    } catch {
      setStory({ ...story, favorite: !next });
    }
  }

  if (loadError) {
    return (
      <main className="page" style={{ padding: "60px 32px", maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-young-serif), serif", color: "var(--twilight)", fontSize: 32 }}>
          {loadError}
        </h1>
        <Link href="/dashboard" className="btn" style={{ marginTop: 16 }}>← Back to dashboard</Link>
      </main>
    );
  }

  if (!story || !ready) {
    const pct = story?.progress ?? 5;
    const failed = story?.status === "failed";
    return (
      <>
        <FloatingNav variant="reader"
          crumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: failed ? "Something went wrong" : "Conjuring your story…" },
          ]}
        />
        <main className="page" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="u-card wait-card">
            <div style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: 14, marginBottom: 8 }}>
              {failed ? "We tripped on a stone" : "Tonight's tale"}
            </div>
            <h1 style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 30, color: "var(--twilight)", marginBottom: 16, letterSpacing: "-0.02em" }}>
              {failed ? "Story generation failed" : `Spinning ${heroName}'s adventure…`}
            </h1>
            {!failed && (
              <>
                <div className="wait-track">
                  <div className="wait-fill" style={{ width: `${pct}%` }} />
                </div>
                <div style={{ fontSize: 13.5, color: "var(--ink-soft)", fontWeight: 600 }}>
                  {pct < 30
                    ? "Drafting the chapters…"
                    : pct < 95
                      ? `Painting illustration ${Math.max(1, Math.min(5, Math.ceil((pct - 30) / 13)))} of 5…`
                      : "Almost there…"}
                </div>
              </>
            )}
            {failed && story?.error && (
              <div style={{ fontSize: 13, color: "var(--berry)", fontWeight: 700, marginTop: 12 }}>{story.error}</div>
            )}
            <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center" }}>
              <Link href="/dashboard" className="btn btn-ghost">
                Wait on the dashboard
              </Link>
              {failed && (
                <Link href="/stories/new" className="btn btn-berry">
                  Try a new tale →
                </Link>
              )}
            </div>
          </div>
        </main>
      </>
    );
  }

  const heroTitle = story.title ?? `${heroName} & the ${blueprint} Tale`;
  const chapterImage = imageByIndex.get(cur) ?? null;

  const crumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Shelf", href: "/shelf" },
    { label: heroTitle },
  ];

  return (
    <>
      <FloatingNav variant="reader"
        crumbs={crumbs}
        action={
          <button
            className={`btn ${story.favorite ? "btn-berry" : "btn-ghost"}`}
            style={{ padding: "10px 18px", fontSize: 13.5 }}
            onClick={toggleFavorite}
          >
            {story.favorite ? "Saved ♥" : "Save to shelf ♡"}
          </button>
        }
      />

      {!reduce && <motion.div className="read-progress" style={{ scaleX: scrollYProgress }} aria-hidden />}

      <main className="page">
        <ReaderBack crumbs={crumbs} />
        <Reveal className="gen-banner">
          <span className="check">✓</span>
          <span>Your story is ready.</span>
        </Reveal>

        <Reveal className="progress-row" index={1}>
          <div>
            <span className="page-kicker">Tonight&apos;s tale</span>
            <h1 className="story-title">{heroTitle}</h1>
          </div>
          <div className="progress-pill">
            <span className="lbl">Step 2 of 2</span>
            <div className="dots">
              <span className="done" />
              <span className="cur" />
            </div>
            <span style={{ opacity: 0.7 }}>Read or listen</span>
          </div>
        </Reveal>

        <div className="reader">
          {/* LEFT: ILLUSTRATION */}
          <Reveal className="illus-col" index={2}>
            <div className="illus" style={{ position: "relative", overflow: "hidden" }}>
              <div className="tag-chap">{chapter?.chip ?? `Chapter ${cur + 1}`}</div>
              <div className="tag-ai">AI · CHARACTER-CONSISTENT</div>
              <motion.div
                key={cur}
                style={{ position: "absolute", inset: 0 }}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {chapterImage ? (
                  <>
                    <Image
                      src={chapterImage}
                      alt={chapter?.title ?? `Chapter ${cur + 1}`}
                      fill
                      sizes="(max-width: 900px) 100vw, 600px"
                      style={{ objectFit: "cover", borderRadius: "inherit" }}
                      priority={cur === 0}
                      onLoad={() =>
                        setLoadedImgs((prev) =>
                          prev.has(chapterImage) ? prev : new Set(prev).add(chapterImage),
                        )
                      }
                    />
                    {!loadedImgs.has(chapterImage) && <Skeleton variant="media" />}
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
                <div className="caption-strip">{chapter?.caption ?? ""}</div>
              </motion.div>
            </div>

            <div className="illus-thumbs">
              {chapters.map((_, i) => (
                <div
                  key={i}
                  className={`thumb ch${i + 1}${cur === i ? " active" : ""}`}
                  onClick={() => render(i)}
                >
                  <span className="num">{i + 1}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* RIGHT: STORY TEXT */}
          <Reveal className="story-col" index={3}>
            <div className="story-head">
              <div className="chip-row">
                <span className="chip berry">{blueprint}</span>
                <span className="chip moon">For {heroName} · {heroAge}</span>
                <span className="chip">{readMins} read</span>
              </div>
              <div className="head-actions">
                <div
                  className={`icon-btn${story.favorite ? " active" : ""}`}
                  title="Save"
                  onClick={toggleFavorite}
                >
                  ♡
                </div>
                <div className="icon-btn" title="Print">⎙</div>
                <div className="icon-btn" title="Share">↗</div>
              </div>
            </div>

            <span className="chap-label">{chapter?.label}</span>
            <h2 className="chap-title">{chapter?.title}</h2>

            <motion.div
              className="story-text"
              key={cur}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              dangerouslySetInnerHTML={{
                __html: (chapter?.paras ?? []).map((p) => `<p>${p}</p>`).join(""),
              }}
            />

            {/* AUDIO BAR — narration TODO: ElevenLabs (Phase 2) */}
            <div className="audio-bar" style={{ opacity: 0.6 }}>
              <div
                className={`play-btn${playing ? " playing" : ""}`}
                onClick={() => setPlaying((v) => !v)}
                title="Narration arrives in a future update"
              >
                <div className="play-tri" />
              </div>
              <div className="audio-meta">
                <div className="audio-title">Read to {heroName} — {voice}&apos;s voice</div>
                <div className="audio-sub">{voiceDesc}</div>
                <div className="audio-prog" onClick={onProgClick}>
                  <div className="fill" style={{ width: `${fillPct}%` }} />
                </div>
                <div className="audio-time">
                  <span>—</span>
                  <span>—</span>
                </div>
              </div>
              <div className="audio-tools">
                <div
                  className="speed-pill"
                  onClick={() => setSpIdx((i) => (i + 1) % SPEEDS.length)}
                >
                  {SPEEDS[spIdx]}
                </div>
                <div className="speed-pill" title="Sleep timer">⏾ 20m</div>
              </div>
            </div>

            {/* CHAPTER NAV */}
            <div className="chap-nav">
              <div
                className="nav-chip"
                style={{ visibility: prevIdx === null ? "hidden" : "visible" }}
                onClick={() => prevIdx !== null && render(prevIdx)}
              >
                <span className="big">←</span>
                <div className="nv-lbl">
                  Previous
                  <span className="nv-ttl">{prevIdx !== null ? chapters[prevIdx].title : ""}</span>
                </div>
              </div>
              <div className="chap-counter">
                <span className="now">{cur + 1}</span> / {chapters.length}
              </div>
              <div
                className="nav-chip next"
                onClick={() => nextIdx !== null ? render(nextIdx) : router.push('/dashboard')}
              >
                <div className="nv-lbl">
                  {nextIdx !== null ? "Next chapter" : "The end"}
                  <span className="nv-ttl">
                    {nextIdx !== null ? chapters[nextIdx].title : "You finished it ✦"}
                  </span>
                </div>
                <span className="big">→</span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* END CTA — keepsake checkout TODO: Stripe (Phase 3) */}
        <Reveal inView className="end-actions">
          <AmbientDecor variant="orange" fireflies={[]} />
          <div>
            <div className="ea-title">
              Love this one? <em>Keep it forever.</em>
            </div>
            <div className="ea-sub">
              Print {heroName}&apos;s tale as a linen-spined hardcover keepsake book — coming soon.
            </div>
          </div>
          <div className="ea-btns">
            <button className="btn" onClick={toggleFavorite}>
              {story.favorite ? "Saved ♥" : "Save to shelf"}
            </button>
            <span
              className="btn btn-berry"
              style={{ opacity: 0.6, pointerEvents: "none" }}
              title="Keepsake books arrive in a future update"
            >
              Order the keepsake book →
            </span>
          </div>
        </Reveal>
      </main>

      <AppFooter variant="mini" />
    </>
  );
}
