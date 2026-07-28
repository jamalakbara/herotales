"use client";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";
import { AppFooter } from "@/components/app-footer";
import { BookCard, NewTaleCard } from "@/components/book-card";
import { ErrorAlert } from "@/components/error-alert";
import { FilterChips } from "@/components/filter-chips";
import { FloatingNav } from "@/components/floating-nav";
import { MobileCarousel } from "@/components/mobile-carousel";
import { ShelfPlankGrid } from "@/components/shelf-grid";
import { HeadAccent, SectionHeader } from "@/components/section-header";
import { SectionKicker } from "@/components/section-kicker";
import { AmbientDecor } from "@/components/motion/AmbientDecor";
import { Reveal } from "@/components/motion/Reveal";
import { Skeleton, SkeletonBookItem, SkeletonKidCard } from "@/components/skeleton";
import { useFetchJson } from "@/components/use-fetch-json";
import { getErrorMessage } from "@/lib/errors";
import { KID_PALETTES } from "@/lib/hero-palette";
import { BLUEPRINT_ICONS, pickName, storyToBook, timeAgo, type StoryListItem } from "@/lib/story-view";
import { BLUEPRINTS } from "@/lib/types";
import { SparklesIcon } from "@/components/ui/sparkles";
import { PlayIcon } from "@/components/ui/play";
import { ArrowUpIcon } from "@/components/ui/arrow-up";
import { ArrowRightIcon } from "@/components/ui/arrow-right";
import { DeleteIcon } from "@/components/ui/delete";
import { PlusIcon } from "@/components/ui/plus";
import { AxeIcon } from "@/components/ui/axe";
import { HeartHandshakeIcon } from "@/components/ui/heart-handshake";
import { FishSymbolIcon } from "@/components/ui/fish-symbol";
import { BicepsFlexedIcon } from "@/components/ui/biceps-flexed";
import { HeartIcon } from "@/components/ui/heart";

const BLUEPRINT_ICON_COMPONENTS: Record<string, ReactNode> = {
  Bravery: <AxeIcon size={20} />,
  Honesty: <HeartHandshakeIcon size={20} />,
  Patience: <FishSymbolIcon size={20} />,
  Kindness: <HeartIcon size={20} />,
  Persistence: <BicepsFlexedIcon size={20} />,
};

type APIChild = {
  id: string;
  nickname: string;
  age: number;
  pronouns: string;
  detail_tags: string[];
  character_description: string | null;
  portrait_url: string | null;
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

// Local to the dashboard stats row — promote to src/components only if a
// second page grows stat cards.
function StatCard({ variant, label, value, unit, children }: {
  variant: "orange" | "card" | "dark";
  label: string;
  value: ReactNode;
  unit?: string;
  children?: ReactNode;
}) {
  const s = {
    orange: { cls: "dash-stat-orange", kicker: "rgba(20,9,6,0.72)", val: "var(--ink-warm)", unitCol: "rgba(20,9,6,0.7)" },
    card: { cls: "u-card", kicker: "var(--u-orange)", val: "var(--twilight)", unitCol: "var(--ink-soft)" },
    dark: { cls: "u-panel-dark", kicker: "var(--u-orange)", val: "#fff", unitCol: "rgba(255,255,255,0.7)" },
  }[variant];
  return (
    <div className={s.cls} style={{ borderRadius: 22, padding: "24px 26px" }}>
      <div style={{ fontFamily: "var(--font-caprasimo), serif", fontSize: 13, color: s.kicker, marginBottom: 6 }}>{label}</div>
      {variant !== "dark" ? (
        <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 46, color: s.val, lineHeight: 1, letterSpacing: "-0.02em", display: "flex", alignItems: "baseline", gap: 8 }}>
          {value}
          {unit && <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-nunito), sans-serif", color: s.unitCol }}>{unit}</span>}
        </div>
      ) : (
        <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 28, color: s.val, lineHeight: 1.2, marginTop: 8 }}>{value}</div>
      )}
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { data, error: loadError, loading } = useFetchJson<APIDashboard>("/api/dashboard", "Dashboard load failed");
  const [activeKid, setActiveKid] = useState(0);
  const [showAllKids, setShowAllKids] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Client-side removal: useFetchJson is single-shot with no refetch, so a
  // deleted hero is hidden by filtering the loaded list rather than re-hitting
  // the API. Server invalidates its Redis caches on DELETE for the next load.
  const kids = useMemo(
    () => (data?.kids ?? []).filter((k) => !deletedIds.has(k.id)),
    [data, deletedIds],
  );

  async function handleDeleteHero(id: string, name: string) {
    if (deletingId) return;
    const ok = window.confirm(
      `Delete ${name}? This permanently removes their character sketch and every story and picture made for them. This cannot be undone.`,
    );
    if (!ok) return;
    setDeletingId(id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/children/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setDeletedIds((prev) => new Set([...prev, id]));
      setActiveKid(0);
    } catch (err) {
      setDeleteError(getErrorMessage(err, "Couldn't delete that hero. Please try again."));
    } finally {
      setDeletingId(null);
    }
  }
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
    idx: i,
    id: k.id,
    name: k.nickname,
    age: `${k.age} years · ${k.pronouns}`,
    avBg: KID_PALETTES[i % KID_PALETTES.length].bg,
    avCol: KID_PALETTES[i % KID_PALETTES.length].color,
    portrait: k.portrait_url,
    tales: k.tales,
    favs: k.favorites,
    printed: 0,
  }));

  const booksView = filteredStories.map((s, i) => storyToBook(s, i));

  // Keep the hero row tidy when a parent has many kids: show the first row
  // collapsed, reveal the rest on demand. Active hero is always pinned in.
  const HERO_CAP = 7;
  const overCap = kidsView.length > HERO_CAP;
  const visibleKids = !overCap || showAllKids
    ? kidsView
    : (() => {
        const head = kidsView.slice(0, HERO_CAP);
        if (activeKid >= HERO_CAP) head[HERO_CAP - 1] = kidsView[activeKid];
        return head;
      })();

  return (
    <>
      <FloatingNav variant="app" />
      <main className="dash-page app-main" style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 48px 80px", position: "relative", zIndex: 2 }}>

        {loadError && <ErrorAlert>{loadError}</ErrorAlert>}
        {deleteError && <ErrorAlert>{deleteError}</ErrorAlert>}

        {/* GREETING — grid on desktop, swipe carousel on mobile */}
        <Reveal className="dash-sec-gap" style={{ marginBottom: 48 }}>
        <MobileCarousel className="dash-greet" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 36, alignItems: "stretch" }}>
          <div className="u-card-lg" style={{ padding: "40px 44px", position: "relative", overflow: "hidden" }}>
            <span style={{ position: "absolute", top: 20, right: 32, color: "var(--moon)", transform: "rotate(14deg)", opacity: 0.85, pointerEvents: "none" }}><SparklesIcon size={64} /></span>
            <SectionKicker style={{ marginBottom: 10 }}>{getGreetingTime()}</SectionKicker>
            <h1 style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(36px, 3.6vw, 50px)", lineHeight: 1.02, letterSpacing: "-0.02em", color: "var(--twilight)", maxWidth: 560, marginBottom: 14 }}>
              Welcome back, <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)" }}>{greetingFirstName}</span>. The woods are ready when you are.
            </h1>
            {loading ? (
              <div style={{ maxWidth: 500, marginBottom: 28 }} aria-hidden>
                <Skeleton variant="text" style={{ width: "100%", marginBottom: 9 }} />
                <Skeleton variant="text" style={{ width: "68%" }} />
              </div>
            ) : (
              <p style={{ fontSize: 17, color: "var(--ink-soft)", fontWeight: 500, maxWidth: 500, marginBottom: 28, lineHeight: 1.5 }}>
                {recent.length === 0
                  ? "Ready to spin your first tale? Pick a hero, pick a value — the woods will do the rest."
                  : `You've ${recent.length === 1 ? "read 1 bedtime tale" : `read ${recent.length} bedtime tales`} together. Tonight feels like a good night for another chapter.`}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href={newStoryHref} className="dash-btn dash-btn-berry" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>Start tonight&apos;s story <ArrowRightIcon size={14} /></Link>
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
            {loading ? (
              <div style={{ position: "relative", zIndex: 1 }} aria-hidden>
                <Skeleton variant="text" style={{ width: 150, marginBottom: 12, background: "rgba(255,255,255,0.16)" }} />
                <Skeleton variant="text" className="lg" style={{ width: "80%", marginBottom: 14, background: "rgba(255,255,255,0.16)" }} />
                <Skeleton variant="text" style={{ width: "90%", marginBottom: 7, background: "rgba(255,255,255,0.12)" }} />
                <Skeleton variant="text" style={{ width: "55%", background: "rgba(255,255,255,0.12)" }} />
              </div>
            ) : (
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
            )}
            <div style={{ display: "flex", gap: 14, alignItems: "center", position: "relative", zIndex: 1, visibility: loading ? "hidden" : "visible" }}>
              <div className="dash-play-icon" style={{ width: 56, height: 56, borderRadius: 14, background: "var(--u-orange)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><PlayIcon size={22} /></div>
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
        </MobileCarousel>
        </Reveal>

        {/* KIDS SECTION HEADER */}
        <Reveal inView={false}>
        <SectionHeader
          title={<>Your little <HeadAccent>heroes</HeadAccent></>}
          sub="Each child has their own character sketch and story shelf."
          action={
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {overCap && (
                <button type="button" onClick={() => setShowAllKids((v) => !v)} className="dash-stat-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {showAllKids ? <>Show fewer <ArrowUpIcon size={12} /></> : <>Show all {kidsView.length} <ArrowRightIcon size={12} /></>}
                </button>
              )}
              <Link href="/shelf" className="dash-stat-link" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>See all stories <ArrowRightIcon size={12} /></Link>
            </div>
          }
        />

        {/* KIDS ROW — grid on desktop, swipe carousel on mobile */}
        <MobileCarousel className="dash-kids-row" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 56 }}>
          {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonKidCard key={i} />)}
          {visibleKids.map((kid) => (
            <div key={kid.id} className={`dash-kid-card${activeKid === kid.idx ? " is-active" : ""}`} onClick={() => setActiveKid(kid.idx)} style={{ position: "relative", borderRadius: 20, padding: 22 }}>
              <button
                type="button"
                aria-label={`Delete ${kid.name}`}
                aria-busy={deletingId === kid.id}
                onClick={(e) => { e.stopPropagation(); handleDeleteHero(kid.id, kid.name); }}
                className="dash-kid-del"
                disabled={deletingId === kid.id}
                style={{ position: "absolute", top: 12, right: 12 }}
              >
                {deletingId === kid.id ? "…" : <DeleteIcon size={14} />}
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ position: "relative", overflow: "hidden", width: 54, height: 54, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 24, background: kid.avBg, color: kid.avCol, flexShrink: 0 }}>
                  {kid.portrait ? <Image src={kid.portrait} alt="" fill sizes="54px" style={{ objectFit: "cover" }} /> : kid.name[0]}
                </div>
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
          <Link href="/heroes/new" className="dash-kid-add" style={{ background: "transparent", border: "2.5px dashed var(--paper-line)", borderRadius: 20, padding: "22px 16px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", color: "var(--ink-soft)", textDecoration: "none" }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream-deep)", color: "var(--ink-soft)" }}><PlusIcon size={28} /></div>
            <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 18, color: "var(--twilight)", marginTop: 12 }}>Add another hero</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4, fontWeight: 600 }}>Up to 3 on your Lantern plan</div>
          </Link>
        </MobileCarousel>
        </Reveal>

        {/* SHELF HEADER */}
        <Reveal inView={false}>
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

        {/* STATS ROW — grid on desktop, swipe carousel on mobile */}
        <Reveal inView={false} className="dash-sec-gap" style={{ marginBottom: 56 }}>
        <MobileCarousel className="dash-stats-row" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 20 }}>
          <StatCard
            variant="orange"
            label="Bedtime streak"
            value={profile?.streak_nights ?? 0}
            unit={(profile?.streak_nights ?? 0) === 1 ? "night so far" : "nights in a row"}
          >
            <div style={{ marginTop: 14, display: "flex", gap: 4 }}>
              {["M","T","W","T","F","S"].map((d, i) => (
                <div key={i} style={{ flex: 1, height: 26, borderRadius: 4, background: "var(--twilight)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 11, color: "var(--u-orange)" }}>{d}</div>
              ))}
              <div style={{ flex: 1, height: 26, borderRadius: 4, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 11, color: "var(--u-orange)" }}>S</div>
            </div>
            <div style={{ fontSize: 13, color: "rgba(20,9,6,0.72)", fontWeight: 600, marginTop: 8, maxWidth: 280, lineHeight: 1.4 }}>Tonight keeps it going — your little ones are learning that stories show up, every single night.</div>
          </StatCard>
          <StatCard
            variant="card"
            label="This month"
            value={quota?.used ?? 0}
            unit={`of ${quota?.quota ?? 0} stories used`}
          >
            <div style={{ fontSize: 13, color: "var(--ink-soft)", fontWeight: 600, marginTop: 8, maxWidth: 280, lineHeight: 1.4 }}>
              {quota ? `${quota.remaining} ${quota.remaining === 1 ? "story" : "stories"} left this period.` : "Loading…"}
            </div>
            <span className="dash-stat-link" style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 4, opacity: 0.6 }} title="Upgrades arrive in a future update">Upgrades coming soon <ArrowRightIcon size={12} /></span>
          </StatCard>
          <StatCard variant="dark" label="Keepsake book" value="Coming soon">
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.75, marginTop: 8, lineHeight: 1.4, maxWidth: 240 }}>
              Turn your stories into a printed keepsake book — available soon.
            </div>
            <Link href="/keepsake-books" className="dash-stat-link" style={{ color: "var(--u-orange)", marginTop: 14, display: "inline-flex", alignItems: "center", gap: 4 }}>Learn more <ArrowRightIcon size={12} /></Link>
          </StatCard>
        </MobileCarousel>
        </Reveal>

        {/* BLUEPRINT NUDGE */}
        {activeKidObj && (
        <Reveal inView={false}>
        <div className="dash-nudge" style={{ borderRadius: 28, padding: "36px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 28, flexWrap: "wrap", position: "relative", overflow: "hidden", marginBottom: 40 }}>
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
                <Link key={label} href={newStoryHref} className="dash-bpc" style={{ padding: "12px 14px", borderRadius: 14, fontFamily: "var(--font-young-serif), serif", fontSize: 13, textAlign: "center", minWidth: 84 }}>
                  <span style={{ display: "flex", justifyContent: "center", color: "var(--u-orange)", marginBottom: 4 }}>{BLUEPRINT_ICON_COMPONENTS[label]}</span>
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
