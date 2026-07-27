"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, CSSProperties, ReactNode } from "react";
import { AppFooter } from "@/components/app-footer";
import { BookCard, NewTaleCard } from "@/components/book-card";
import { accentColors } from "@/components/book-cover";
import { EmptyState } from "@/components/empty-state";
import { ErrorAlert } from "@/components/error-alert";
import { FilterChips } from "@/components/filter-chips";
import { FloatingNav } from "@/components/floating-nav";
import { ShelfPlankGrid } from "@/components/shelf-grid";
import { SectionKicker } from "@/components/section-kicker";
import { Reveal } from "@/components/motion/Reveal";
import { Skeleton, SkeletonBookItem } from "@/components/skeleton";
import { getErrorMessage } from "@/lib/errors";
import { KID_PALETTES } from "@/lib/hero-palette";
import { pickName, storyToBook, type BookView, type StoryListItem } from "@/lib/story-view";
import { BLUEPRINTS } from "@/lib/types";

type APIKid = { id: string; nickname: string; tales: number; favorites: number };

function ShelfSection({ label, count, books, order = 0, trailing }: { label: string; count: string; books: BookView[]; order?: number; trailing?: ReactNode }) {
  return (
    // Mount-based (not inView): these grids are tall, so an inView gate at
    // amount 0.25 leaves the top section invisible until the user scrolls —
    // reading as a late blank-then-pop. Firing on mount (right after data
    // lands) plus the per-card bookRise stagger keeps the entrance immediate.
    <Reveal delay={order * 0.08}>
      <div className="dash-shelf-label-anim" style={{ fontFamily: "var(--font-caprasimo), serif", fontSize: 18, color: "var(--twilight)", marginTop: 28, marginBottom: 14, display: "flex", alignItems: "baseline", gap: 12 }}>
        {label} <span style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: 13, color: "var(--ink-soft)" }}>· {count}</span>
      </div>
      <ShelfPlankGrid plankClassName="dash-shelf-plank-anim">
        {books.map((b, i) => <BookCard key={b.id} book={b} size="md" index={i} />)}
        {trailing}
      </ShelfPlankGrid>
    </Reveal>
  );
}

function BookRow({ b, index }: { b: BookView; index: number }) {
  const styleVars = { "--i": index } as CSSProperties;
  const cover = accentColors(b.accent);
  return (
    <Link href={b.href} className="dash-book-card-anim dash-list-row" style={{ ...styleVars, textDecoration: "none", display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", borderRadius: 16 }}>
      <div style={{ width: 44, height: 56, flexShrink: 0, borderRadius: "4px 8px 8px 4px", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 18, ...cover }}>{b.star}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 16, color: "var(--twilight)", lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.infoTitle}</div>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600, display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
          <span style={{ color: "var(--berry)", fontWeight: 800 }}>{b.forKid}</span>
          <span style={{ opacity: 0.4 }}>·</span><span>{b.theme}</span>
          {b.when && <><span style={{ opacity: 0.4 }}>·</span><span>{b.when}</span></>}
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-soft)", flexShrink: 0 }}>{b.label}</span>
    </Link>
  );
}

type KidTab = { id: string; paletteIdx: number; nm: string; ct: number; label: string };

function tabPalette(paletteIdx: number) {
  return paletteIdx >= 0 ? KID_PALETTES[paletteIdx % KID_PALETTES.length] : { bg: "var(--twilight)", color: "#fff" };
}

// Single source for the hero-filter pill (both the pinned row and — its avatar
// — the overflow popover rows), so a style tweak lands once.
function HeroTabPill({ t, active, onSelect }: { t: KidTab; active: boolean; onSelect: () => void }) {
  const palette = tabPalette(t.paletteIdx);
  return (
    <button onClick={onSelect} className={`dash-kid-tab${active ? " dash-kid-tab-active" : ""}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px 10px 10px", borderRadius: 999, color: active ? "#fff" : "var(--ink)" }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: t.id === "all" ? 12 : 14, background: palette.bg, color: palette.color }}>{t.label}</div>
      <span style={{ fontWeight: 800, fontSize: 14 }}>{t.nm}</span>
      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", background: active ? "rgba(255,255,255,0.22)" : "rgba(28,21,64,0.08)", borderRadius: 999 }}>{t.ct}</span>
    </button>
  );
}

// How many hero pills stay pinned in the quick-pick row before the rest fold
// into the searchable "More heroes" popover — keeps the strip one tidy line
// even with hundreds of heroes.
const PINNED_HEROES = 5;

function HeroPicker({ tabs, activeTab, onSelect }: { tabs: KidTab[]; activeTab: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const popRef = useRef<HTMLDivElement>(null);

  const all = tabs[0];
  const heroes = useMemo(() => tabs.slice(1), [tabs]);
  const { pinned, overflow } = useMemo(() => {
    const ranked = [...heroes].sort((a, b) => b.ct - a.ct); // most-told first
    const pinnedIds = new Set(ranked.slice(0, PINNED_HEROES).map((t) => t.id));
    if (heroes.some((t) => t.id === activeTab)) pinnedIds.add(activeTab); // keep active visible
    return {
      pinned: heroes.filter((t) => pinnedIds.has(t.id)),
      overflow: heroes.filter((t) => !pinnedIds.has(t.id)),
    };
  }, [heroes, activeTab]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? overflow.filter((t) => t.nm.toLowerCase().includes(needle)) : overflow;
  }, [overflow, q]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
      {/* Pinned quick-pick pills — scrolls sideways on mobile via .fade-strip */}
      <div className="shelf-kid-tabs fade-strip" style={{ flex: "1 1 auto", minWidth: 0, marginBottom: 0 }}>
        {all && <HeroTabPill t={all} active={activeTab === "all"} onSelect={() => onSelect("all")} />}
        {pinned.map((t) => <HeroTabPill key={t.id} t={t} active={activeTab === t.id} onSelect={() => onSelect(t.id)} />)}
      </div>
      {/* Overflow: searchable popover — kept outside the scroll strip so it isn't clipped */}
      {overflow.length > 0 && (
        <div ref={popRef} style={{ position: "relative", flexShrink: 0 }}>
          <button className="dash-kid-tab" onClick={() => setOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 999, color: "var(--ink)", fontWeight: 800, fontSize: 14, whiteSpace: "nowrap" }}>
            More heroes
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", background: "rgba(28,21,64,0.08)", borderRadius: 999 }}>{overflow.length}</span>
            <span style={{ display: "inline-block", transition: "transform 0.15s ease", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
          </button>
          {open && (
            <div className="shelf-hero-pop">
              <div className="shelf-hero-pop-search">
                <span style={{ fontSize: 15, color: "var(--ink-soft)" }}>⌕</span>
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hero…" />
              </div>
              <div className="shelf-hero-pop-list">
                {shown.map((t) => {
                  const palette = tabPalette(t.paletteIdx);
                  return (
                    <button key={t.id} className={`shelf-hero-pop-row${activeTab === t.id ? " is-active" : ""}`} onClick={() => { onSelect(t.id); setOpen(false); setQ(""); }}>
                      <div className="shelf-hero-pop-av" style={{ background: palette.bg, color: palette.color }}>{t.label}</div>
                      <span style={{ flex: 1, textAlign: "left", fontWeight: 800 }}>{t.nm}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)" }}>{t.ct}</span>
                    </button>
                  );
                })}
                {shown.length === 0 && <div className="shelf-hero-pop-empty">No hero matches</div>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// How many tales to reveal per "Load more" press (and the initial page) —
// smaller on mobile where cards are 2-up and scrolling is cheaper.
const PAGE_SIZE_MOBILE = 6;
const PAGE_SIZE_DESKTOP = 12;

const MOBILE_MQ = "(max-width: 640px)";
// Hydration-safe media query (server snapshot = desktop, matching SSR); avoids
// setState-in-effect. Books are client-only (fetched), so no hydration risk.
function useIsMobile() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(MOBILE_MQ);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(MOBILE_MQ).matches,
    () => false,
  );
}

export default function ShelfPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeView, setActiveView] = useState("Shelf");
  const [search, setSearch] = useState("");
  const pageSize = useIsMobile() ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP;
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const [kids, setKids] = useState<APIKid[]>([]);
  const [stories, setStories] = useState<StoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/dashboard", { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject(new Error(`Dashboard ${r.status}`))),
      fetch("/api/stories?limit=100", { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject(new Error(`Stories ${r.status}`))),
    ])
      .then(([dash, list]: [{ kids: APIKid[] }, { stories: StoryListItem[] }]) => {
        if (cancelled) return;
        setKids(dash.kids ?? []);
        setStories(list.stories ?? []);
      })
      .catch((e: unknown) => {
        if (!cancelled) setLoadError(getErrorMessage(e, "Could not load shelf"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filters = ["All", "Favorites ♡", ...BLUEPRINTS];

  const kidTabs = useMemo(() => {
    const total = kids.reduce((acc, k) => acc + k.tales, 0);
    return [
      { id: "all", paletteIdx: -1, nm: "All heroes", ct: total, label: "★" },
      ...kids.map((k, i) => ({ id: k.id, paletteIdx: i, nm: k.nickname, ct: k.tales, label: k.nickname[0]?.toUpperCase() ?? "·" })),
    ];
  }, [kids]);

  // Mobile scroll strips (hero tabs + filter chips): only fade the edge that
  // still has hidden pills, so the first/last pill sits flush at the scroll
  // extremes instead of looking clipped. Applies to every `.fade-strip`.
  const stripHost = useRef<HTMLElement>(null);
  useEffect(() => {
    const host = stripHost.current;
    if (!host) return;
    const strips = Array.from(host.querySelectorAll<HTMLElement>(".fade-strip"));
    const update = () => {
      for (const el of strips) {
        el.classList.toggle("is-start", el.scrollLeft <= 1);
        el.classList.toggle("is-end", el.scrollLeft >= el.scrollWidth - el.clientWidth - 1);
      }
    };
    update();
    strips.forEach((el) => el.addEventListener("scroll", update, { passive: true }));
    window.addEventListener("resize", update);
    return () => {
      strips.forEach((el) => el.removeEventListener("scroll", update));
      window.removeEventListener("resize", update);
    };
  }, [kidTabs, loading]);

  const filtered = useMemo(() => {
    let xs = stories;
    if (activeTab !== "all") xs = xs.filter((s) => s.child_id === activeTab);
    if (activeFilter === "Favorites ♡") xs = xs.filter((s) => s.favorite);
    else if (activeFilter !== "All") xs = xs.filter((s) => s.blueprint === activeFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      xs = xs.filter((s) =>
        (s.title ?? "").toLowerCase().includes(q) ||
        s.blueprint.toLowerCase().includes(q) ||
        pickName(s.children).toLowerCase().includes(q),
      );
    }
    return xs;
  }, [stories, activeTab, activeFilter, search]);

  // Reset the page when the filter/tab/search changes so a new, shorter result
  // set doesn't strand you deep-paged. Adjust-state-during-render (not an
  // effect) — see react.dev "You Might Not Need an Effect".
  // pageSize is in the key too: when the breakpoint flips (e.g. mobile detected
  // after hydration), the page resets to the correct size.
  const filterKey = `${activeTab}|${activeFilter}|${search}|${pageSize}`;
  const [pagedKey, setPagedKey] = useState(filterKey);
  if (pagedKey !== filterKey) {
    setPagedKey(filterKey);
    setVisibleCount(pageSize);
  }

  const hasMore = filtered.length > visibleCount;

  const { recentBooks, favBooks, monthBooks, listBooks } = useMemo(() => {
    const cutoff = nowMs - 14 * 86400000;
    // Page over the whole filtered set newest-first, then bucket only the
    // visible slice into the date sections — "Load more" reveals the next batch.
    const sorted = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const visible = sorted.slice(0, visibleCount);
    const recentList = visible.filter((s) => new Date(s.created_at).getTime() >= cutoff);
    const favList = visible.filter((s) => s.favorite);
    const olderList = visible.filter((s) => new Date(s.created_at).getTime() < cutoff && !s.favorite);
    return {
      recentBooks: recentList.map((s, i) => storyToBook(s, i)),
      favBooks: favList.map((s, i) => storyToBook(s, i, { badge: { text: "♡", accent: "moon" } })),
      monthBooks: olderList.map((s, i) => storyToBook(s, i)),
      listBooks: visible.map((s, i) => storyToBook(s, i)),
    };
  }, [filtered, nowMs, visibleCount]);

  return (
    <>
      <FloatingNav variant="app" />
      <main ref={stripHost} className="app-main" style={{ maxWidth: 1400, margin: "0 auto", padding: "10px 48px 80px", position: "relative", zIndex: 2 }}>

        <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          <div>
            <SectionKicker className="dash-shelf-kicker-anim" size={17}>Every tale you&apos;ve told</SectionKicker>
            <h1 className="dash-shelf-head-anim dash-shelf-head-delay-1" style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(38px, 4vw, 56px)", lineHeight: 1.02, letterSpacing: "-0.02em", color: "var(--twilight)" }}>
              The whole <span style={{ fontFamily: "var(--font-caprasimo), serif", fontStyle: "normal", color: "var(--berry)" }}>shelf</span>
            </h1>
            <div className="dash-shelf-head-anim dash-shelf-head-delay-2" style={{ fontSize: 16, color: "var(--ink-soft)", fontWeight: 500, marginTop: 8, maxWidth: 520 }}>
              {loading
                ? <Skeleton variant="text" style={{ width: 300, marginTop: 6 }} />
                : <>{stories.length} {stories.length === 1 ? "story" : "stories"} across {kids.length} little {kids.length === 1 ? "hero" : "heroes"}. Favorites are always yours to keep.</>}
            </div>
          </div>
          <Link href="/stories/new" className="dash-btn dash-btn-berry dash-shelf-top-btn dash-shelf-head-anim dash-shelf-head-delay-3">+ Craft a new tale</Link>
        </div>

        {/* Hero filter — pinned quick-pick pills + searchable "More heroes" popover */}
        {loading ? (
          <div className="shelf-kid-tabs fade-strip" style={{ marginBottom: 28 }}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="pill" />)}
          </div>
        ) : (
          <HeroPicker tabs={kidTabs} activeTab={activeTab} onSelect={setActiveTab} />
        )}

        {loadError && <ErrorAlert style={{ marginBottom: 16 }}>{loadError}</ErrorAlert>}

        {/* Toolbar */}
        <div className="shelf-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, padding: "14px 18px", borderRadius: 18, marginBottom: 28 }}>
          <div className="shelf-search" style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--cream-deep)", borderRadius: 999, padding: "8px 16px", flex: 1, minWidth: 220, maxWidth: 420 }}>
            <span style={{ fontSize: 15, color: "var(--ink-soft)" }}>⌕</span>
            <input type="text" placeholder="Search by title, hero, or lesson…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: "none", background: "transparent", outline: "none", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 600, fontSize: 13, color: "var(--ink)", flex: 1 }} />
          </div>
          <FilterChips options={filters} active={activeFilter} onSelect={setActiveFilter} size="sm" className="fade-strip shelf-fc-strip" />
          <div className="shelf-viewtoggle" style={{ display: "flex", borderRadius: 999, overflow: "hidden", background: "var(--cream-deep)" }}>
            {["Shelf", "List"].map(v => (
              <button key={v} onClick={() => setActiveView(v)} className="dash-view-btn" style={{ border: "none", background: activeView === v ? "var(--ink)" : "transparent", padding: "8px 14px", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: 13, color: activeView === v ? "#fff" : "var(--ink-soft)", cursor: "pointer" }}>{v}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <ShelfPlankGrid>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonBookItem key={i} />)}
          </ShelfPlankGrid>
        ) : activeView === "List" ? (
          filtered.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {listBooks.map((b, i) => <BookRow key={i} b={b} index={i} />)}
            </div>
          )
        ) : (() => {
          // Terminal "add" tile rides the last populated section's plank so it
          // sits flush beside the final book — one shelf, not a lonely card on
          // its own plank below Load more. Only when everything's revealed
          // (!hasMore) and in Shelf view; while paging, the top "Craft a new
          // tale" button carries the action.
          const showTerminal = activeView !== "List" && !hasMore;
          const lastKey = monthBooks.length > 0 ? "month" : favBooks.length > 0 ? "fav" : "recent";
          const terminal = <NewTaleCard href="/stories/new" size="md" index={0} />;
          return (
            <>
              {recentBooks.length > 0 && (
                <ShelfSection order={0} label="Recently read" count={`${recentBooks.length} ${recentBooks.length === 1 ? "tale" : "tales"} · last 2 weeks`} books={recentBooks} trailing={showTerminal && lastKey === "recent" ? terminal : undefined} />
              )}
              {favBooks.length > 0 && (
                <ShelfSection order={1} label="Favorites" count={`${favBooks.length} ${favBooks.length === 1 ? "keeper" : "keepers"}`} books={favBooks} trailing={showTerminal && lastKey === "fav" ? terminal : undefined} />
              )}
              {monthBooks.length > 0 && (
                <ShelfSection order={2} label="Earlier this month" count={`${monthBooks.length} ${monthBooks.length === 1 ? "tale" : "tales"}`} books={monthBooks} trailing={showTerminal && lastKey === "month" ? terminal : undefined} />
              )}
            </>
          );
        })()}

        {!loading && hasMore && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
            <button className="dash-btn dash-btn-ghost" onClick={() => setVisibleCount((c) => c + pageSize)}>
              Load more <span style={{ fontWeight: 700, color: "var(--ink-soft)" }}>· {filtered.length - visibleCount} left</span>
            </button>
          </div>
        )}

        {filtered.length === 0 && !loading && !loadError && (
          <Reveal inView>
          <EmptyState
            variant="orange"
            title={stories.length === 0 ? "Your shelf is waiting" : "No tales match"}
            sub={stories.length === 0 ? "Spin your first story to begin." : "Try a different filter or hero."}
            cta={stories.length === 0 && (
              <Link href="/stories/new" className="btn" style={{ display: "inline-block" }}>+ Craft a tale</Link>
            )}
          />
          </Reveal>
        )}

      </main>

      <AppFooter />
    </>
  );
}
