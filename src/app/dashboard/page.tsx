"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppFooter } from "@/components/app-footer";
import { BookCard, NewTaleCard } from "@/components/book-card";
import { ErrorAlert } from "@/components/error-alert";
import { FilterChips } from "@/components/filter-chips";
import { FloatingNav } from "@/components/floating-nav";
import { ShelfPlankGrid } from "@/components/shelf-grid";
import { HeadAccent, SectionHeader } from "@/components/section-header";
import { SectionKicker } from "@/components/section-kicker";
import { AmbientDecor } from "@/components/motion/AmbientDecor";
import { Reveal } from "@/components/motion/Reveal";
import { SkeletonBookItem, SkeletonKidCard } from "@/components/skeleton";
import { getErrorMessage } from "@/lib/errors";
import { KID_PALETTES } from "@/lib/hero-palette";
import { BLUEPRINT_ICONS, pickName, storyToBook, timeAgo, type StoryListItem } from "@/lib/story-view";
import { BLUEPRINTS } from "@/lib/types";

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
type APIDashboard = {
  profile: { display_name: string | null; email: string; streak_nights: number; last_read_date: string | null } | null;
  quota: { quota: number; used: number; remaining: number; periodStart: string };
  kids: APIChild[];
  recent_stories: StoryListItem[];
};

function getGreetingTime(): string {
  return new Date().toLocaleString("en-US", {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
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
        if (!cancelled) setLoadError(getErrorMessage(e, "Could not load"));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = !data && !loadError;
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
  const nudgeBlueprint = BLUEPRINTS.find((b) => !usedBlueprints.has(b)) ?? null;

  const kidsView = kids.map((k, i) => ({
    id: k.id,
    name: k.nickname,
    age: `${k.age} years · ${k.pronouns}`,
    avBg: KID_PALETTES[i % KID_PALETTES.length].bg,
    avCol: KID_PALETTES[i % KID_PALETTES.length].color,
    tales: k.tales,
    favs: k.favorites,
    printed: 0,
  }));

  const booksView = filteredStories.map((s, i) => storyToBook(s, i));

  return (
    <>
      <FloatingNav variant="app" />
      <main className="dash-page app-main" style={{ maxWidth: 1400, margin: "0 auto", padding: "10px 48px 80px", position: "relative", zIndex: 2 }}>

        {loadError && <ErrorAlert>{loadError}</ErrorAlert>}

        {/* GREETING */}
        <Reveal className="dash-greet" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 36, marginBottom: 48, alignItems: "stretch" }}>
          <div className="u-card-lg" style={{ padding: "40px 44px", position: "relative", overflow: "hidden" }}>
            <span style={{ position: "absolute", top: 20, right: 32, fontFamily: "var(--font-caprasimo), serif", fontSize: 64, color: "var(--moon)", transform: "rotate(14deg)", opacity: 0.85, pointerEvents: "none" }}>✦</span>
            <SectionKicker style={{ marginBottom: 10 }}>{getGreetingTime()}</SectionKicker>
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
                <Link href={`/stories/${inProgress.id}`} className="dash-btn dash-btn-ghost">Re-read last night&apos;s</Link>
              )}
            </div>
          </div>

          <div className="u-panel-dark" style={{ borderRadius: 28, padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <AmbientDecor
              variant="dark"
              stars={[
                { top: "14%", left: "12%" },
                { top: "24%", left: "72%" },
                { top: "46%", left: "38%" },
                { top: "12%", left: "50%" },
              ]}
              fireflies={[
                { left: "80%", bottom: "18%", delay: "0s", dur: "8s" },
                { left: "14%", bottom: "30%", delay: "1.4s", dur: "7s" },
              ]}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
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
            <div style={{ display: "flex", gap: 14, alignItems: "center", position: "relative", zIndex: 1 }}>
              <div className="dash-play-icon" style={{ width: 56, height: 56, borderRadius: 14, background: "var(--u-orange)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "var(--font-caprasimo), serif", fontSize: 22, flexShrink: 0 }}>▶</div>
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
        <Reveal inView>
        <SectionHeader
          title={<>Your little <HeadAccent>heroes</HeadAccent></>}
          sub="Each child has their own character sketch and story shelf."
          action={<Link href="/shelf" className="dash-stat-link">See all stories →</Link>}
        />

        {/* KIDS ROW */}
        <div className="dash-kids-row" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 56 }}>
          {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonKidCard key={i} />)}
          {kidsView.map((kid, i) => (
            <div key={kid.id} className="dash-kid-card" onClick={() => setActiveKid(i)} style={{ background: activeKid === i ? "var(--u-orange)" : "#fff", borderRadius: 20, boxShadow: activeKid === i ? "var(--u-card-shadow-lg)" : "var(--u-card-shadow)", padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 54, height: 54, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 24, background: kid.avBg, color: kid.avCol, flexShrink: 0 }}>{kid.name[0]}</div>
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
          <Link href="/heroes/new" className="dash-kid-add" style={{ background: "transparent", border: "2.5px dashed var(--paper-line)", borderRadius: 20, boxShadow: "none", padding: "22px 16px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", color: "var(--ink-soft)", textDecoration: "none" }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 400, background: "var(--cream-deep)", color: "var(--ink-soft)" }}>+</div>
            <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 18, color: "var(--twilight)", marginTop: 12 }}>Add another hero</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4, fontWeight: 600 }}>Up to 3 on your Lantern plan</div>
          </Link>
        </div>
        </Reveal>

        {/* SHELF HEADER */}
        <Reveal inView>
        <SectionHeader
          align="center"
          title={<>{activeKidObj?.nickname ?? "Your"}<HeadAccent>{activeKidObj ? "'s shelf" : " shelf"}</HeadAccent></>}
          sub={activeKidObj
            ? `${activeKidObj.tales} ${activeKidObj.tales === 1 ? "story" : "stories"} · ${activeKidObj.favorites} favorite${activeKidObj.favorites === 1 ? "" : "s"}`
            : "Add a hero to begin"}
          action={
            <FilterChips
              options={filters}
              active={activeFilter}
              onSelect={(f) => { if (!f.startsWith("Sort:")) setActiveFilter(f); }}
            />
          }
        />

        {/* SHELF PLANK + BOOKS */}
        <ShelfPlankGrid size="lg">
          {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonBookItem key={i} />)}
          {booksView.map((b, i) => <BookCard key={b.id} book={b} size="lg" index={i} />)}
          {/* New story tile */}
          <NewTaleCard href={newStoryHref} size="lg" index={booksView.length} />
        </ShelfPlankGrid>
        </Reveal>

        {/* STATS ROW */}
        <Reveal inView>
        <div className="dash-stats-row" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 20, marginBottom: 56 }}>
          {/* Streak */}
          <div style={{ background: "var(--u-orange)", borderRadius: 22, boxShadow: "var(--u-card-shadow-lg)", padding: "24px 26px" }}>
            <div style={{ fontFamily: "var(--font-caprasimo), serif", fontSize: 13, color: "rgba(20,9,6,0.72)", marginBottom: 6 }}>Bedtime streak</div>
            <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 46, color: "var(--ink-warm)", lineHeight: 1, letterSpacing: "-0.02em", display: "flex", alignItems: "baseline", gap: 8 }}>
              {profile?.streak_nights ?? 0}<span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-nunito), sans-serif", color: "rgba(20,9,6,0.7)" }}>{(profile?.streak_nights ?? 0) === 1 ? "night so far" : "nights in a row"}</span>
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 4 }}>
              {["M","T","W","T","F","S"].map((d, i) => (
                <div key={i} style={{ flex: 1, height: 26, borderRadius: 4, background: "var(--twilight)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 11, color: "var(--u-orange)" }}>{d}</div>
              ))}
              <div style={{ flex: 1, height: 26, borderRadius: 4, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 11, color: "var(--u-orange)" }}>S</div>
            </div>
            <div style={{ fontSize: 13, color: "rgba(20,9,6,0.72)", fontWeight: 600, marginTop: 8, maxWidth: 280, lineHeight: 1.4 }}>Tonight keeps it going — your little ones are learning that stories show up, every single night.</div>
          </div>
          {/* Usage */}
          <div className="u-card" style={{ borderRadius: 22, padding: "24px 26px" }}>
            <div style={{ fontFamily: "var(--font-caprasimo), serif", fontSize: 13, color: "var(--u-orange)", marginBottom: 6 }}>This month</div>
            <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 46, color: "var(--twilight)", lineHeight: 1, letterSpacing: "-0.02em", display: "flex", alignItems: "baseline", gap: 8 }}>
              {quota?.used ?? 0}<span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-nunito), sans-serif", color: "var(--ink-soft)" }}>of {quota?.quota ?? 0} stories used</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)", fontWeight: 600, marginTop: 8, maxWidth: 280, lineHeight: 1.4 }}>
              {quota ? `${quota.remaining} ${quota.remaining === 1 ? "story" : "stories"} left this period.` : "Loading…"}
            </div>
            <span className="dash-stat-link" style={{ marginTop: 12, display: "inline-block", opacity: 0.6 }} title="Upgrades arrive in a future update">Upgrades coming soon →</span>
          </div>
          {/* Keepsake */}
          <div className="u-panel-dark" style={{ borderRadius: 22, padding: "24px 26px" }}>
            <div style={{ fontFamily: "var(--font-caprasimo), serif", fontSize: 13, color: "var(--u-orange)", marginBottom: 6 }}>Keepsake book</div>
            <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 28, color: "#fff", lineHeight: 1.2, marginTop: 8 }}>Coming soon</div>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.75, marginTop: 8, lineHeight: 1.4, maxWidth: 240 }}>
              Turn your stories into a printed keepsake book — available soon.
            </div>
            <Link href="/keepsake-books" className="dash-stat-link" style={{ color: "var(--u-orange)", marginTop: 14, display: "inline-block" }}>Learn more →</Link>
          </div>
        </div>
        </Reveal>

        {/* BLUEPRINT NUDGE */}
        {activeKidObj && (
        <Reveal inView>
        <div style={{ background: "var(--u-orange)", color: "var(--ink-warm)", borderRadius: 28, boxShadow: "var(--u-card-shadow-lg)", padding: "36px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 28, flexWrap: "wrap", position: "relative", overflow: "hidden", marginBottom: 40 }}>
          <AmbientDecor variant="orange" fireflies={[]} />
          <div style={{ position: "relative", maxWidth: 560 }}>
            <div style={{ fontFamily: "var(--font-caprasimo), serif", color: "rgba(20,9,6,0.72)", fontSize: 14, marginBottom: 6 }}>Gentle nudge</div>
            {nudgeBlueprint ? (
              <>
                <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 28, lineHeight: 1.1, marginBottom: 8 }}>
                  {activeKidObj.nickname} hasn&apos;t tried <em style={{ color: "#fff" }}>{nudgeBlueprint}</em> yet.
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
            {BLUEPRINTS.filter((b) => !usedBlueprints.has(b)).slice(0, 3).map((label) => {
              return (
                <Link key={label} href={newStoryHref} className="dash-bpc" style={{ padding: "12px 14px", background: "#fff", color: "var(--twilight)", borderRadius: 14, boxShadow: "var(--u-card-shadow)", fontFamily: "var(--font-young-serif), serif", fontSize: 13, textAlign: "center", minWidth: 84 }}>
                  <span style={{ display: "block", fontFamily: "var(--font-caprasimo), serif", fontSize: 20, color: "var(--u-orange)", marginBottom: 4 }}>{BLUEPRINT_ICONS[label]}</span>
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        </Reveal>
        )}

      </main>

      <AppFooter />
    </>
  );
}
