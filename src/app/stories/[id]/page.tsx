"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, useScroll, useReducedMotion } from "framer-motion";
import { AppFooter } from "@/components/app-footer";
import { FloatingNav, ReaderBack } from "@/components/floating-nav";
import { AmbientDecor } from "@/components/motion/AmbientDecor";
import { Reveal } from "@/components/motion/Reveal";
import { FlipReader } from "@/components/flip-reader";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon } from "@/components/ui/check";
import { HeartIcon } from "@/components/ui/heart";
import { ArrowLeftIcon } from "@/components/ui/arrow-left";
import { ArrowRightIcon } from "@/components/ui/arrow-right";
import { ArrowUpRightIcon } from "@/components/ui/arrow-up-right";
import { FolderDownIcon } from "@/components/ui/folder-down";
import { TimerIcon } from "@/components/ui/timer";

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/stories/${id}`, { method: "DELETE" });
      if (res.ok) { router.push("/shelf"); return; }
    } catch { /* fall through */ }
    setDeleting(false);
  }, [id, router]);

  const child = pickChild(story?.children ?? null);
  const heroName = child?.nickname ?? "Hero";
  const heroAge = child?.age ?? 5;
  const blueprint = story?.blueprint ?? "Bravery";
  const lengthLabel = story?.length ?? "Bedtime";
  const voice = story?.voice ?? "Juniper";
  const lengthMap: Record<string, string> = { Shortie: "3 min", Bedtime: "7 min", "Long tale": "12 min" };
  const readMins = lengthMap[lengthLabel] ?? "7 min";

  const chapters = story?.full_text ?? [];
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
        <Link href="/dashboard" className="btn" style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6 }}><ArrowLeftIcon size={14} /> Back to dashboard</Link>
      </main>
    );
  }

  // Initial fetch in-flight — neutral loader, NOT the "generating" progress card.
  if (!story) {
    return (
      <>
        <FloatingNav variant="reader"
          crumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Opening your story…" },
          ]}
        />
        <main className="page" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="u-card wait-card">
            <div style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: 14, marginBottom: 8 }}>
              Tonight&apos;s tale
            </div>
            <h1 style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 30, color: "var(--twilight)", letterSpacing: "-0.02em" }}>
              Opening your story…
            </h1>
          </div>
        </main>
      </>
    );
  }

  if (!ready) {
    const pct = story.progress ?? 5;
    const failed = story.status === "failed";
    return (
      <>
        <FloatingNav variant="reader"
          crumbs={[
            { label: "Home", href: "/dashboard" },
            { label: failed ? "Something went wrong" : "Conjuring your story…" },
          ]}
        />
        <main className="page" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="u-card wait-card">
            <div style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: 13, marginBottom: 6 }}>
              {failed ? "We tripped on a stone" : "Tonight's tale"}
            </div>
            <h1 style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 26, lineHeight: 1.15, color: "var(--twilight)", marginBottom: 16, letterSpacing: "-0.02em" }}>
              {failed ? "Story generation failed" : `Spinning ${heroName}'s adventure…`}
            </h1>
            {!failed && (
              <>
                <div className="wait-track">
                  <div className="wait-fill" style={{ width: `${pct}%` }} />
                </div>
                <div style={{ fontSize: 13.5, color: "var(--ink-soft)", fontWeight: 600 }}>
                  {pct < 33
                    ? "Drafting the chapters…"
                    : pct < 95
                      ? `Painting illustration ${Math.max(1, Math.min(5, Math.ceil((pct - 33) / 12)))} of 5…`
                      : "Almost there…"}
                </div>
              </>
            )}
            {failed && story?.error && (
              <div style={{ fontSize: 12.5, color: "var(--berry)", fontWeight: 700, marginTop: 12 }}>{story.error}</div>
            )}
            <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              <Link href="/dashboard" className="btn btn-ghost" style={{ whiteSpace: "nowrap", fontSize: 14.5 }}>
                Wait on the dashboard
              </Link>
              {failed && (
                <button type="button" onClick={handleDelete} disabled={deleting} className="btn btn-ghost" style={{ whiteSpace: "nowrap", fontSize: 14.5 }}>
                  {deleting ? "Removing…" : "Delete this story"}
                </button>
              )}
              {failed && (
                <Link href="/stories/new" className="btn btn-berry" style={{ whiteSpace: "nowrap", fontSize: 14.5, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  Try a new tale <ArrowRightIcon size={14} />
                </Link>
              )}
            </div>
          </div>
        </main>
      </>
    );
  }

  const heroTitle = story.title ?? `${heroName} & the ${blueprint} Tale`;

  const crumbs = [
    { label: "Home", href: "/dashboard" },
    { label: "Shelf", href: "/shelf" },
    { label: heroTitle },
  ];

  return (
    <>
      <FloatingNav variant="reader"
        crumbs={crumbs}
        action={
          <button
            className={`btn btn-sm ${story.favorite ? "btn-berry" : "btn-ghost"}`}
            onClick={toggleFavorite}
          >
            {story.favorite ? <>Saved <HeartIcon size={14} /></> : <>Save to shelf <HeartIcon size={14} /></>}
          </button>
        }
      />

      {!reduce && <motion.div className="read-progress" style={{ scaleX: scrollYProgress }} aria-hidden />}

      <main className="page">
        <ReaderBack crumbs={crumbs} />
        <Reveal className="gen-banner">
          <span className="check"><CheckIcon size={14} /></span>
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

        <Reveal className="story-head fb-meta" index={2}>
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
              <HeartIcon size={18} />
            </div>
            <div className="icon-btn" title="Download"><FolderDownIcon size={18} /></div>
            <div className="icon-btn" title="Share"><ArrowUpRightIcon size={18} /></div>
          </div>
        </Reveal>

        <FlipReader
          chapters={chapters}
          imageByIndex={imageByIndex}
          reduce={!!reduce}
          onEnd={() => router.push("/shelf")}
        />

        {/* AUDIO BAR — narration TODO: ElevenLabs (Phase 2) */}
        <div className="audio-bar fb-audio" style={{ opacity: 0.6 }}>
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
            <div className="speed-pill" title="Sleep timer" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><TimerIcon size={14} /> 20m</div>
          </div>
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
            <button className="btn" onClick={toggleFavorite} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {story.favorite ? <>Saved <HeartIcon size={14} /></> : <>Save to shelf <HeartIcon size={14} /></>}
            </button>
            <span
              className="btn btn-berry"
              style={{ opacity: 0.6, pointerEvents: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
              title="Keepsake books arrive in a future update"
            >
              Order the keepsake book <ArrowRightIcon size={14} />
            </span>
          </div>
        </Reveal>
      </main>

      <AppFooter variant="mini" />
    </>
  );
}
