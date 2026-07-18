"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FloatingNav } from "@/components/floating-nav";
import { DeleteMyDataLink } from "@/components/delete-data-link";
import { BookCover, coverAccent } from "@/components/book-cover";
import { Reveal } from "@/components/motion/Reveal";

type APIChild = {
  id: string;
  nickname: string;
  age: number;
  pronouns: string;
  detail_tags: string[];
  character_description: string | null;
  tales: number;
  favorites: number;
};
type APIStory = {
  id: string;
  child_id: string;
  blueprint: string;
  length: string;
  voice: string | null;
  status: "pending" | "generating" | "ready" | "failed";
  progress: number;
  title: string | null;
  favorite: boolean;
  created_at: string;
  completed_at: string | null;
  children: { nickname: string } | { nickname: string }[] | null;
};
type APIDashboard = {
  profile: { display_name: string | null; email: string; streak_nights: number; last_read_date: string | null } | null;
  quota: { quota: number; used: number; remaining: number; periodStart: string };
  kids: APIChild[];
  recent_stories: APIStory[];
};

const ALL_BLUEPRINTS = ["Bravery", "Honesty", "Patience", "Kindness", "Persistence"];

function getGreetingTime(): string {
  return new Date().toLocaleString("en-US", {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const THEME_STAR: Record<string, string> = {
  Bravery: "★",
  Honesty: "✦",
  Patience: "⟲",
  Kindness: "♡",
  Persistence: "↑",
};
const KID_AVATAR_BG = ["var(--berry)", "var(--lilac)", "var(--sage)", "var(--moon)"];
const KID_AVATAR_FG = ["var(--cream)", "var(--twilight)", "var(--cream)", "var(--twilight)"];

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const wks = Math.round(days / 7);
  if (wks < 4) return `${wks} week${wks === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

function splitTitle(title: string): { line1: string; line2: string } {
  const words = title.split(" ");
  if (words.length <= 3) return { line1: title, line2: "" };
  const mid = Math.ceil(words.length / 2);
  return { line1: words.slice(0, mid).join(" "), line2: words.slice(mid).join(" ") };
}

function pickName(s: APIStory["children"]): string {
  if (!s) return "";
  return Array.isArray(s) ? s[0]?.nickname ?? "" : s.nickname;
}

const filters = ["All", "Favorites ♡", "Bravery", "Kindness", "Patience", "Sort: Recent ▾"];

export default function DashboardPage() {
  const [data, setData] = useState<APIDashboard | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeKid, setActiveKid] = useState(0);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Dashboard load failed (${r.status})`);
        return (await r.json()) as APIDashboard;
      })
      .then((j) => {
        if (!cancelled) setData(j);
      })
      .catch((e: unknown) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Could not load");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const kids = data?.kids ?? [];
  const recent = data?.recent_stories ?? [];
  const profile = data?.profile;
  const quota = data?.quota;

  const activeKidObj = kids[activeKid];

  const filteredStories = useMemo(() => {
    let xs = recent;
    if (activeKidObj) xs = xs.filter((s) => s.child_id === activeKidObj.id);
    if (activeFilter === "Favorites ♡") xs = xs.filter((s) => s.favorite);
    else if (activeFilter !== "All" && !activeFilter.startsWith("Sort:")) xs = xs.filter((s) => s.blueprint === activeFilter);
    return xs;
  }, [recent, activeKidObj, activeFilter]);

  const inProgress = recent.find((s) => s.status === "ready") ?? null;
  const greetingFirstName = profile?.display_name?.split(" ")[0] ?? profile?.email?.split("@")[0] ?? "Friend";

  const kidStories = activeKidObj ? recent.filter((s) => s.child_id === activeKidObj.id) : recent;
  const usedBlueprints = new Set(kidStories.map((s) => s.blueprint));
  const newStoryHref = activeKidObj ? `/stories/new?child_id=${activeKidObj.id}` : "/stories/new";
  const nudgeBlueprint = ALL_BLUEPRINTS.find((b) => !usedBlueprints.has(b)) ?? null;

  const kidsView = kids.map((k, i) => ({
    id: k.id,
    name: k.nickname,
    age: `${k.age} years · ${k.pronouns}`,
    avBg: KID_AVATAR_BG[i % KID_AVATAR_BG.length],
    avCol: KID_AVATAR_FG[i % KID_AVATAR_FG.length],
    tales: k.tales,
    favs: k.favorites,
    printed: 0,
  }));

  const booksView = filteredStories.map((s, i) => {
    const t = s.title ?? `Chapter ${s.progress}%`;
    const { line1, line2 } = splitTitle(t);
    const badge: { text: string; accent: "berry" | "moon" } | undefined =
      s.status !== "ready" ? { text: "In progress", accent: "berry" }
        : s.favorite ? { text: "Favorite ♡", accent: "moon" } : undefined;
    return {
      id: s.id,
      accent: coverAccent(i),
      badge,
      label: s.status === "ready" ? "Complete · 5 chapters" : `Conjuring · ${s.progress}%`,
      title: line1,
      script: line2,
      theme: s.blueprint,
      star: THEME_STAR[s.blueprint] ?? "✦",
      infoTitle: t,
      forKid: pickName(s.children),
      when: timeAgo(s.created_at),
      href: `/stories/${s.id}`,
    };
  });

  return (
    <>
      <FloatingNav variant="app" />
      <main className="dash-page" style={{ maxWidth: 1400, margin: "0 auto", padding: "10px 48px 80px", position: "relative", zIndex: 2 }}>

        {loadError && (
          <div style={{ marginBottom: 24, padding: "14px 18px", background: "rgba(180,60,90,0.08)", border: "2px solid var(--berry)", borderRadius: 16, color: "var(--berry)", fontWeight: 700, fontSize: 13.5 }}>
            {loadError}
          </div>
        )}

        {/* GREETING */}
        <Reveal className="dash-greet" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 36, marginBottom: 48, alignItems: "stretch" }}>
          <div style={{ background: "var(--cream)", border: "2.5px solid var(--ink)", borderRadius: 28, boxShadow: "8px 8px 0 var(--ink)", padding: "40px 44px", position: "relative", overflow: "hidden" }}>
            <span style={{ position: "absolute", top: 20, right: 32, fontFamily: "var(--font-caprasimo), serif", fontSize: 64, color: "var(--moon)", transform: "rotate(14deg)", opacity: 0.85, pointerEvents: "none" }}>✦</span>
            <div style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: 16, transform: "rotate(-1.5deg)", display: "inline-block", marginBottom: 10 }}>{getGreetingTime()}</div>
            <h1 style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(36px, 3.6vw, 50px)", lineHeight: 1.02, letterSpacing: "-0.02em", color: "var(--twilight)", maxWidth: 560, marginBottom: 14 }}>
              Welcome back, <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)" }}>{greetingFirstName}</span>. The woods are ready when you are.
            </h1>
            <p style={{ fontSize: 17, color: "var(--ink-soft)", fontWeight: 500, maxWidth: 500, marginBottom: 28, lineHeight: 1.5 }}>
              {recent.length === 0
                ? "Ready to spin your first tale? Pick a hero, pick a value — the woods will do the rest."
                : `You've ${recent.length === 1 ? "read 1 bedtime tale" : `read ${recent.length} bedtime tales`} together. Tonight feels like a good night for another chapter.`}
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href={newStoryHref} className="dash-btn dash-btn-berry">Start tonight&apos;s story →</Link>
              {inProgress && (
                <Link href={`/stories/${inProgress.id}`} className="dash-btn dash-btn-ghost" style={{ border: "1.5px solid var(--ink)" }}>Re-read last night&apos;s</Link>
              )}
            </div>
          </div>

          <div style={{ background: "var(--twilight)", color: "var(--cream)", border: "2.5px solid var(--ink)", borderRadius: 28, boxShadow: "8px 8px 0 var(--ink)", padding: 32, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "var(--moon)", borderRadius: "50%", opacity: 0.18, pointerEvents: "none" }} />
            <div>
              <div style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--moon)", fontSize: 15, marginBottom: 8 }}>
                {inProgress ? "Pick up where you left off" : "Tonight's first chapter"}
              </div>
              <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 28, lineHeight: 1.1, maxWidth: 320, marginBottom: 14 }}>
                {inProgress?.title ?? "No story yet — let's spin one"}
              </div>
              <div style={{ fontSize: 14, color: "rgba(251,243,227,0.75)", fontWeight: 500, lineHeight: 1.5, maxWidth: 360, marginBottom: 22 }}>
                {inProgress
                  ? `${inProgress.blueprint} · for ${pickName(inProgress.children)} · ${timeAgo(inProgress.created_at)}`
                  : "Pick a hero and a value — your library starts tonight."}
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div className="dash-play-icon" style={{ width: 56, height: 56, borderRadius: 14, background: "var(--berry)", border: "2px solid var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--cream)", fontFamily: "var(--font-caprasimo), serif", fontSize: 22, flexShrink: 0 }}>▶</div>
              <div style={{ flex: 1, minWidth: 0, fontSize: 12, opacity: 0.7 }}>
                <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 18, color: "var(--cream)", opacity: 1, marginBottom: 2 }}>
                  {inProgress ? inProgress.blueprint : "5-chapter bedtime adventure"}
                </div>
                <div>{inProgress ? `${inProgress.length} · ${inProgress.voice ?? "Juniper"}'s voice` : "Takes about 40 seconds to conjure"}</div>
              </div>
              <Link href={inProgress ? `/stories/${inProgress.id}` : newStoryHref} className="dash-resume-btn">
                {inProgress ? "Resume" : "Start"}
              </Link>
            </div>
          </div>
        </Reveal>

        {/* KIDS SECTION HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(24px, 2.4vw, 30px)", color: "var(--twilight)", letterSpacing: "-0.01em" }}>
              Your little <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: "0.9em" }}>heroes</span>
            </h2>
            <div style={{ fontSize: 13.5, color: "var(--ink-soft)", fontWeight: 600, marginTop: 4 }}>Each child has their own character sketch and story shelf.</div>
          </div>
          <Link href="/shelf" className="dash-stat-link">See all stories →</Link>
        </div>

        {/* KIDS ROW */}
        <div className="dash-kids-row" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 56 }}>
          {kidsView.map((kid, i) => (
            <div key={kid.id} className="dash-kid-card" onClick={() => setActiveKid(i)} style={{ background: activeKid === i ? "var(--moon)" : "var(--cream)", border: "2.5px solid var(--ink)", borderRadius: 20, boxShadow: "5px 5px 0 var(--ink)", padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 54, height: 54, borderRadius: 16, border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 24, background: kid.avBg, color: kid.avCol, flexShrink: 0 }}>{kid.name[0]}</div>
                <div>
                  <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 20, color: "var(--twilight)", lineHeight: 1.05 }}>{kid.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 2 }}>{kid.age}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", paddingTop: 12, borderTop: "1.5px dashed var(--paper-line)" }}>
                <div><span style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 22, color: "var(--twilight)", display: "block", lineHeight: 1 }}>{kid.tales}</span>tales told</div>
                <div><span style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 22, color: "var(--twilight)", display: "block", lineHeight: 1 }}>{kid.favs}</span>favorites</div>
                <div><span style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 22, color: "var(--twilight)", display: "block", lineHeight: 1 }}>{kid.printed}</span>printed</div>
              </div>
            </div>
          ))}
          <Link href="/heroes/new" className="dash-kid-add" style={{ background: "transparent", border: "2.5px dashed var(--ink)", borderRadius: 20, boxShadow: "none", padding: "22px 16px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", color: "var(--ink-soft)", textDecoration: "none" }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, border: "2px dashed var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 400, background: "var(--cream-deep)", color: "var(--ink-soft)" }}>+</div>
            <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 18, color: "var(--twilight)", marginTop: 12 }}>Add another hero</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4, fontWeight: 600 }}>Up to 3 on your Lantern plan</div>
          </Link>
        </div>

        {/* SHELF HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(24px, 2.4vw, 30px)", color: "var(--twilight)", letterSpacing: "-0.01em" }}>
              {activeKidObj?.nickname ?? "Your"}<span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: "0.9em" }}>{activeKidObj ? "'s shelf" : " shelf"}</span>
            </h2>
            <div style={{ fontSize: 13.5, color: "var(--ink-soft)", fontWeight: 600, marginTop: 4 }}>
              {activeKidObj
                ? `${activeKidObj.tales} ${activeKidObj.tales === 1 ? "story" : "stories"} · ${activeKidObj.favorites} favorite${activeKidObj.favorites === 1 ? "" : "s"}`
                : "Add a hero to begin"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {filters.map(f => (
              <button
                key={f}
                onClick={() => { if (!f.startsWith("Sort:")) setActiveFilter(f); }}
                className={`dash-filter-chip ${activeFilter === f ? "dash-filter-chip-active" : ""}`}
                style={{ padding: "8px 14px", background: activeFilter === f ? "var(--twilight)" : "var(--cream-deep)", border: "1.5px solid var(--ink)", borderRadius: 999, fontWeight: 700, fontSize: 13, color: activeFilter === f ? "var(--cream)" : "var(--twilight)" }}
              >{f}</button>
            ))}
          </div>
        </div>

        {/* SHELF PLANK + BOOKS */}
        <div style={{ height: 14, background: "var(--ink)", borderRadius: 3, marginBottom: -2, boxShadow: "0 3px 0 rgba(28,21,64,0.4)" }} />
        <div className="dash-shelf-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, padding: "24px 20px 36px", background: "var(--cream-deep)", border: "2.5px solid var(--ink)", borderRadius: "4px 4px 24px 24px", borderTop: "none", boxShadow: "5px 8px 0 var(--ink)", marginBottom: 56 }}>
          {booksView.map(b => (
            <Link key={b.id} href={b.href} className="dash-book-card">
              <BookCover size="lg" accent={b.accent} badge={b.badge} label={b.label} title={b.title} script={b.script} theme={b.theme} star={b.star} />
              <div>
                <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 15.5, color: "var(--twilight)", lineHeight: 1.15, marginBottom: 2 }}>{b.infoTitle}</div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ color: "var(--berry)", fontWeight: 800 }}>For {b.forKid}</span>
                  <span style={{ opacity: 0.4 }}>·</span><span>{b.theme}</span>
                  <span style={{ opacity: 0.4 }}>·</span><span>{b.when}</span>
                </div>
              </div>
            </Link>
          ))}
          {/* New story tile */}
          <Link href={newStoryHref} className="dash-new-tile">
            <div className="dash-new-cover" style={{ aspectRatio: "5/6.4", borderRadius: "6px 12px 12px 6px", border: "2.5px dashed var(--ink)", background: "var(--cream)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "var(--twilight)", textAlign: "center", marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--moon)", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 28, color: "var(--twilight)", marginBottom: 14 }}>+</div>
              <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 18 }}>Craft a new tale</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600, marginTop: 4, padding: "0 16px", lineHeight: 1.35 }}>Takes about 3 minutes. ~40 seconds to conjure.</div>
            </div>
          </Link>
        </div>

        {/* STATS ROW */}
        <div className="dash-stats-row" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 20, marginBottom: 56 }}>
          {/* Streak */}
          <div style={{ background: "var(--moon)", border: "2.5px solid var(--ink)", borderRadius: 22, boxShadow: "6px 6px 0 var(--ink)", padding: "24px 26px" }}>
            <div style={{ fontFamily: "var(--font-caprasimo), serif", fontSize: 13, color: "var(--berry)", marginBottom: 6 }}>Bedtime streak</div>
            <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 46, color: "var(--twilight)", lineHeight: 1, letterSpacing: "-0.02em", display: "flex", alignItems: "baseline", gap: 8 }}>
              {profile?.streak_nights ?? 0}<span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-nunito), sans-serif", color: "var(--ink-soft)" }}>{(profile?.streak_nights ?? 0) === 1 ? "night so far" : "nights in a row"}</span>
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 4 }}>
              {["M","T","W","T","F","S"].map((d, i) => (
                <div key={i} style={{ flex: 1, height: 26, borderRadius: 4, background: "var(--twilight)", border: "1.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 11, color: "var(--moon)" }}>{d}</div>
              ))}
              <div style={{ flex: 1, height: 26, borderRadius: 4, background: "var(--berry)", border: "1.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 11, color: "var(--cream)" }}>S</div>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)", fontWeight: 600, marginTop: 8, maxWidth: 280, lineHeight: 1.4 }}>Tonight keeps it going — your little ones are learning that stories show up, every single night.</div>
          </div>
          {/* Usage */}
          <div style={{ background: "var(--cream)", border: "2.5px solid var(--ink)", borderRadius: 22, boxShadow: "6px 6px 0 var(--ink)", padding: "24px 26px" }}>
            <div style={{ fontFamily: "var(--font-caprasimo), serif", fontSize: 13, color: "var(--berry)", marginBottom: 6 }}>This month</div>
            <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 46, color: "var(--twilight)", lineHeight: 1, letterSpacing: "-0.02em", display: "flex", alignItems: "baseline", gap: 8 }}>
              {quota?.used ?? 0}<span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-nunito), sans-serif", color: "var(--ink-soft)" }}>of {quota?.quota ?? 0} stories used</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)", fontWeight: 600, marginTop: 8, maxWidth: 280, lineHeight: 1.4 }}>
              {quota ? `${quota.remaining} ${quota.remaining === 1 ? "story" : "stories"} left this period.` : "Loading…"}
            </div>
            <span className="dash-stat-link" style={{ marginTop: 12, display: "inline-block", opacity: 0.6 }} title="Upgrades arrive in a future update">Upgrades coming soon →</span>
          </div>
          {/* Keepsake */}
          <div style={{ background: "var(--sage)", color: "var(--cream)", border: "2.5px solid var(--ink)", borderRadius: 22, boxShadow: "6px 6px 0 var(--ink)", padding: "24px 26px" }}>
            <div style={{ fontFamily: "var(--font-caprasimo), serif", fontSize: 13, color: "var(--moon)", marginBottom: 6 }}>Keepsake book</div>
            <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 28, color: "var(--cream)", lineHeight: 1.2, marginTop: 8 }}>Coming soon</div>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.75, marginTop: 8, lineHeight: 1.4, maxWidth: 240 }}>
              Turn your stories into a printed keepsake book — available soon.
            </div>
            <Link href="/keepsake-books" className="dash-stat-link" style={{ color: "var(--moon)", marginTop: 14, display: "inline-block" }}>Learn more →</Link>
          </div>
        </div>

        {/* BLUEPRINT NUDGE */}
        {activeKidObj && (
        <div style={{ background: "var(--berry)", color: "var(--cream)", border: "2.5px solid var(--ink)", borderRadius: 28, boxShadow: "8px 8px 0 var(--ink)", padding: "36px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 28, flexWrap: "wrap", position: "relative", overflow: "hidden", marginBottom: 40 }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, background: "var(--moon)", borderRadius: "50%", opacity: 0.2, pointerEvents: "none" }} />
          <div style={{ position: "relative", maxWidth: 560 }}>
            <div style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--moon)", fontSize: 14, marginBottom: 6 }}>Gentle nudge</div>
            {nudgeBlueprint ? (
              <>
                <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 28, lineHeight: 1.1, marginBottom: 8 }}>
                  {activeKidObj.nickname} hasn&apos;t tried <em>{nudgeBlueprint}</em> yet.
                </div>
                <div style={{ fontSize: 14.5, opacity: 0.88, lineHeight: 1.5 }}>
                  Want to spin a {nudgeBlueprint} tale tonight?
                </div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 28, lineHeight: 1.1, marginBottom: 8 }}>
                  Great variety, {activeKidObj.nickname}!
                </div>
                <div style={{ fontSize: 14.5, opacity: 0.88, lineHeight: 1.5 }}>
                  Every value explored. Keep going — repetition deepens the lesson.
                </div>
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, position: "relative" }}>
            {ALL_BLUEPRINTS.filter((b) => !usedBlueprints.has(b)).slice(0, 3).map((label) => {
              const icons: Record<string, string> = { Bravery: "★", Honesty: "✓", Patience: "⟲", Kindness: "♡", Persistence: "↑" };
              return (
                <Link key={label} href={newStoryHref} className="dash-bpc" style={{ padding: "12px 14px", background: "var(--cream)", color: "var(--twilight)", border: "2px solid var(--ink)", borderRadius: 14, fontFamily: "var(--font-young-serif), serif", fontSize: 13, textAlign: "center", minWidth: 84 }}>
                  <span style={{ display: "block", fontFamily: "var(--font-caprasimo), serif", fontSize: 20, color: "var(--berry)", marginBottom: 4 }}>{icons[label]}</span>
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        )}

      </main>

      <footer style={{ maxWidth: 1400, margin: "40px auto 0", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--ink-soft)", fontWeight: 600, borderTop: "2px dashed var(--paper-line)", position: "relative", zIndex: 2 }}>
        <div>© 2026 TellTales · Sweet dreams guaranteed.</div>
        <div>
          <Link href="#" className="dash-nav-link" style={{ marginLeft: 20 }}>Privacy (COPPA)</Link>
          <DeleteMyDataLink style={{ marginLeft: 20 }} />
          <Link href="#" className="dash-nav-link" style={{ marginLeft: 20 }}>Help</Link>
        </div>
      </footer>
    </>
  );
}
