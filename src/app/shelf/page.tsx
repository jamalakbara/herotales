"use client";
import Link from "next/link";
import { useEffect, useMemo, useState, CSSProperties } from "react";
import { AppFooter } from "@/components/app-footer";
import { BookCard, NewTaleCard } from "@/components/book-card";
import { accentColors } from "@/components/book-cover";
import { FloatingNav } from "@/components/floating-nav";
import { AmbientDecor } from "@/components/motion/AmbientDecor";
import { Reveal } from "@/components/motion/Reveal";
import { Skeleton, SkeletonBookItem } from "@/components/skeleton";
import { pickName, storyToBook, type BookView, type StoryListItem } from "@/lib/story-view";

type APIKid = { id: string; nickname: string; tales: number; favorites: number };

function ShelfSection({ label, count, books }: { label: string; count: string; books: BookView[] }) {
  const craftIdx = books.length;
  return (
    <Reveal inView>
      <div className="dash-shelf-label-anim" style={{ fontFamily: "var(--font-caprasimo), serif", fontSize: 18, color: "var(--twilight)", marginTop: 28, marginBottom: 14, display: "flex", alignItems: "baseline", gap: 12 }}>
        {label} <span style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: 13, color: "var(--ink-soft)" }}>· {count}</span>
      </div>
      <div className="dash-shelf-plank-anim" style={{ height: 14, background: "var(--ink)", borderRadius: 3, marginBottom: -2 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "24px 20px", padding: "28px 22px 40px", background: "var(--cream-deep)", borderRadius: "4px 4px 24px 24px", boxShadow: "var(--u-card-shadow)", marginBottom: 26 }}>
        {books.map((b, i) => <BookCard key={b.id} book={b} size="md" index={i} />)}
        {label === "Earlier this month" && <NewTaleCard href="/stories/new" size="md" index={craftIdx} />}
      </div>
    </Reveal>
  );
}

function BookRow({ b, index }: { b: BookView; index: number }) {
  const styleVars = { "--i": index } as CSSProperties;
  const cover = accentColors(b.accent);
  return (
    <Link href={b.href} className="dash-book-card-anim dash-list-row" style={{ ...styleVars, textDecoration: "none", display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "#fff", borderRadius: 16, boxShadow: "var(--u-card-shadow)" }}>
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

// --berry/--sage/--moon all fold to orange in the umano skin — rotate
// through distinct surfaces instead (mirrors the dashboard avatar palette).
const KID_PALETTES = [
  { bg: "var(--u-orange)", color: "#fff" },
  { bg: "var(--lilac)", color: "var(--twilight)" },
  { bg: "var(--twilight)", color: "#fff" },
  { bg: "var(--cream-deep)", color: "var(--twilight)" },
];

export default function ShelfPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeView, setActiveView] = useState("Shelf");
  const [search, setSearch] = useState("");

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
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Could not load shelf");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filters = ["All", "Favorites ♡", "Bravery", "Honesty", "Patience", "Kindness", "Persistence"];

  const kidTabs = useMemo(() => {
    const total = kids.reduce((acc, k) => acc + k.tales, 0);
    return [
      { id: "all", paletteIdx: -1, nm: "All heroes", ct: total, label: "★" },
      ...kids.map((k, i) => ({ id: k.id, paletteIdx: i, nm: k.nickname, ct: k.tales, label: k.nickname[0]?.toUpperCase() ?? "·" })),
    ];
  }, [kids]);

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

  const { recentBooks, favBooks, monthBooks, listBooks } = useMemo(() => {
    const cutoff = nowMs - 14 * 86400000;
    const recentList = filtered.filter((s) => new Date(s.created_at).getTime() >= cutoff);
    const favList = filtered.filter((s) => s.favorite);
    const olderList = filtered.filter((s) => new Date(s.created_at).getTime() < cutoff && !s.favorite);
    const sorted = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return {
      recentBooks: recentList.map((s, i) => storyToBook(s, i)),
      favBooks: favList.map((s, i) => storyToBook(s, i, { badge: { text: "♡", accent: "moon" } })),
      monthBooks: olderList.map((s, i) => storyToBook(s, i)),
      listBooks: sorted.map((s, i) => storyToBook(s, i)),
    };
  }, [filtered, nowMs]);

  return (
    <>
      <FloatingNav variant="app" />
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "10px 48px 80px", position: "relative", zIndex: 2 }}>

        <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          <div>
            <span className="dash-shelf-kicker-anim" style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: 17, transform: "rotate(-1.5deg)", display: "inline-block", marginBottom: 8 }}>Every tale you&apos;ve told</span>
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

        {/* Kid tabs */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
          {loading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="pill" />)}
          {!loading && kidTabs.map(t => {
            const palette = t.paletteIdx >= 0 ? KID_PALETTES[t.paletteIdx % KID_PALETTES.length] : { bg: "var(--twilight)", color: "#fff" };
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`dash-kid-tab${activeTab === t.id ? " dash-kid-tab-active" : ""}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px 10px 10px", background: activeTab === t.id ? "var(--u-orange)" : "#fff", borderRadius: 999, color: activeTab === t.id ? "#fff" : "var(--ink)", boxShadow: activeTab === t.id ? "none" : "var(--u-card-shadow)" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: t.id === "all" ? 12 : 14, background: palette.bg, color: palette.color }}>{t.label}</div>
                <span style={{ fontWeight: 800, fontSize: 14 }}>{t.nm}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", background: activeTab === t.id ? "rgba(255,255,255,0.22)" : "rgba(28,21,64,0.08)", borderRadius: 999, opacity: 1 }}>{t.ct}</span>
              </button>
            );
          })}
        </div>

        {loadError && (
          <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(180,60,90,0.08)", border: "2px solid var(--berry)", borderRadius: 14, color: "var(--berry)", fontWeight: 700, fontSize: 13 }}>
            {loadError}
          </div>
        )}

        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, padding: "14px 18px", background: "#fff", borderRadius: 18, boxShadow: "var(--u-card-shadow)", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--cream-deep)", borderRadius: 999, padding: "8px 16px", flex: 1, minWidth: 220, maxWidth: 420 }}>
            <span style={{ fontSize: 15, color: "var(--ink-soft)" }}>⌕</span>
            <input type="text" placeholder="Search by title, hero, or lesson…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: "none", background: "transparent", outline: "none", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 600, fontSize: 14, color: "var(--ink)", flex: 1 }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`dash-fc${activeFilter === f ? " dash-fc-active" : ""}`} style={{ padding: "7px 14px", background: "var(--cream-deep)", border: "none", borderRadius: 999, fontWeight: 700, fontSize: 12.5, color: "var(--twilight)", cursor: "pointer" }}>{f}</button>
            ))}
          </div>
          <div style={{ display: "flex", borderRadius: 999, overflow: "hidden", background: "var(--cream-deep)" }}>
            {["Shelf", "List"].map(v => (
              <button key={v} onClick={() => setActiveView(v)} className="dash-view-btn" style={{ border: "none", background: activeView === v ? "var(--ink)" : "transparent", padding: "8px 14px", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: 12.5, color: activeView === v ? "#fff" : "var(--ink-soft)", cursor: "pointer" }}>{v}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <>
            <div style={{ height: 14, background: "var(--ink)", borderRadius: 3, marginBottom: -2 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "24px 20px", padding: "28px 22px 40px", background: "var(--cream-deep)", borderRadius: "4px 4px 24px 24px", boxShadow: "var(--u-card-shadow)", marginBottom: 26 }}>
              {Array.from({ length: 5 }).map((_, i) => <SkeletonBookItem key={i} />)}
            </div>
          </>
        ) : activeView === "List" ? (
          filtered.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {listBooks.map((b, i) => <BookRow key={i} b={b} index={i} />)}
            </div>
          )
        ) : (
          <>
            {recentBooks.length > 0 && (
              <ShelfSection label="Recently read" count={`${recentBooks.length} ${recentBooks.length === 1 ? "tale" : "tales"} · last 2 weeks`} books={recentBooks} />
            )}
            {favBooks.length > 0 && (
              <ShelfSection label="Favorites" count={`${favBooks.length} ${favBooks.length === 1 ? "keeper" : "keepers"}`} books={favBooks} />
            )}
            <ShelfSection label="Earlier this month" count={`${monthBooks.length} ${monthBooks.length === 1 ? "tale" : "tales"}`} books={monthBooks} />
          </>
        )}

        {filtered.length === 0 && !loading && !loadError && (
          <Reveal inView>
          <div style={{ position: "relative", overflow: "hidden", textAlign: "center", padding: "60px 20px", background: "var(--u-orange)", borderRadius: 28, boxShadow: "var(--u-card-shadow-lg)", color: "rgba(20,9,6,0.72)" }}>
            <AmbientDecor variant="orange" fireflies={[]} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 24, color: "#140906", marginBottom: 8 }}>
                {stories.length === 0 ? "Your shelf is waiting" : "No tales match"}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
                {stories.length === 0 ? "Spin your first story to begin." : "Try a different filter or hero."}
              </div>
              {stories.length === 0 && (
                <Link href="/stories/new" className="btn" style={{ display: "inline-block" }}>+ Craft a tale</Link>
              )}
            </div>
          </div>
          </Reveal>
        )}

      </main>

      <AppFooter />
    </>
  );
}
