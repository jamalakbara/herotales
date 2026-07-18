"use client";
import Link from "next/link";
import { useEffect, useMemo, useState, CSSProperties } from "react";
import { FloatingNav } from "@/components/floating-nav";
import { DeleteMyDataLink } from "@/components/delete-data-link";
import { BookCover, coverAccent, accentColors, type CoverAccent } from "@/components/book-cover";

type APIKid = { id: string; nickname: string; tales: number; favorites: number };
type APIStory = {
  id: string;
  child_id: string;
  blueprint: string;
  status: "pending" | "generating" | "ready" | "failed";
  progress: number;
  title: string | null;
  favorite: boolean;
  created_at: string;
  children: { nickname: string } | { nickname: string }[] | null;
};
const THEME_STAR: Record<string, string> = { Bravery: "★", Honesty: "✦", Patience: "⟲", Kindness: "♡", Persistence: "↑" };
function splitTitleWords(t: string) {
  const words = t.split(" ");
  if (words.length <= 3) return { line1: t, line2: "" };
  const mid = Math.ceil(words.length / 2);
  return { line1: words.slice(0, mid).join(" "), line2: words.slice(mid).join(" ") };
}
function timeAgo(iso: string) {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.round(days / 7)} weeks ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function pickName(c: APIStory["children"]) {
  if (!c) return "";
  return Array.isArray(c) ? c[0]?.nickname ?? "" : c.nickname;
}
function toBook(s: APIStory, i: number, opts?: { badgeForced?: string; badgeCls?: string }): Book {
  const t = s.title ?? "Untitled tale";
  const { line1, line2 } = splitTitleWords(t);
  const badgeText = opts?.badgeForced ?? (s.status !== "ready" ? "In progress" : s.favorite ? "Favorite ♡" : undefined);
  const badgeKey = opts?.badgeCls ?? (s.status !== "ready" ? "berry" : undefined);
  const badgeAccent: "berry" | "sage" | "moon" = badgeKey === "berry" ? "berry" : badgeKey === "sage" ? "sage" : "moon";
  return {
    accent: coverAccent(i),
    badge: badgeText ? { text: badgeText, accent: badgeAccent } : undefined,
    label: s.status === "ready" ? "5 chapters" : `Conjuring · ${s.progress}%`,
    title: line1,
    script: line2,
    theme: s.blueprint,
    star: THEME_STAR[s.blueprint] ?? "✦",
    infoTitle: t,
    forKid: pickName(s.children),
    when: timeAgo(s.created_at),
    href: `/stories/${s.id}`,
  };
}

type Book = { accent: CoverAccent; badge?: { text: string; accent: "berry" | "sage" | "moon" }; label: string; title: string; script: string; theme: string; star: string; infoTitle: string; forKid: string; when?: string; href: string };

function BookCard({ b, index }: { b: Book; index: number }) {
  const styleVars = { "--i": index } as CSSProperties;
  return (
    <Link href={b.href} className="dash-book-card dash-book-card-anim" style={{ ...styleVars, textDecoration: "none", display: "block", position: "relative" }}>
      <BookCover size="md" animated accent={b.accent} badge={b.badge} label={b.label} title={b.title} script={b.script} theme={b.theme} star={b.star} />
      <div>
        <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 14, color: "var(--twilight)", lineHeight: 1.15, marginBottom: 2 }}>{b.infoTitle}</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-soft)", fontWeight: 600, display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "var(--berry)", fontWeight: 800 }}>{b.forKid}</span>
          {b.when && <><span style={{ opacity: 0.4 }}>·</span><span>{b.when}</span></>}
        </div>
      </div>
    </Link>
  );
}

function ShelfSection({ label, count, books }: { label: string; count: string; books: Book[] }) {
  const craftIdx = books.length;
  const craftStyle = { "--i": craftIdx } as CSSProperties;
  return (
    <>
      <div className="dash-shelf-label-anim" style={{ fontFamily: "var(--font-caprasimo), serif", fontSize: 18, color: "var(--twilight)", marginTop: 28, marginBottom: 14, display: "flex", alignItems: "baseline", gap: 12 }}>
        {label} <span style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: 13, color: "var(--ink-soft)" }}>· {count}</span>
      </div>
      <div className="dash-shelf-plank-anim" style={{ height: 14, background: "var(--ink)", borderRadius: 3, marginBottom: -2 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "24px 20px", padding: "28px 22px 40px", background: "var(--cream-deep)", border: "2.5px solid var(--ink)", borderRadius: "4px 4px 24px 24px", borderTop: "none", boxShadow: "5px 8px 0 var(--ink)", marginBottom: 26 }}>
        {books.map((b, i) => <BookCard key={i} b={b} index={i} />)}
        {label === "Earlier this month" && (
          <Link href="/stories/new" className="dash-book-card dash-book-card-anim" style={{ ...craftStyle, textDecoration: "none", display: "block", position: "relative" }}>
            <div className="dash-new-cover-anim" style={{ aspectRatio: "5/6.4", borderRadius: "6px 12px 12px 6px", border: "2.5px dashed var(--ink)", background: "var(--cream)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "var(--twilight)", textAlign: "center", marginBottom: 10 }}>
              <div className="dash-plus-anim" style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--moon)", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 24, color: "var(--twilight)", marginBottom: 10 }}>+</div>
              <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 16 }}>Craft a new tale</div>
              <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600, marginTop: 4, padding: "0 12px", lineHeight: 1.35 }}>~40 seconds to conjure.</div>
            </div>
          </Link>
        )}
      </div>
    </>
  );
}

function BookRow({ b, index }: { b: Book; index: number }) {
  const styleVars = { "--i": index } as CSSProperties;
  const cover = accentColors(b.accent);
  return (
    <Link href={b.href} className="dash-book-card-anim dash-list-row" style={{ ...styleVars, textDecoration: "none", display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "var(--cream)", border: "2px solid var(--ink)", borderRadius: 16, boxShadow: "3px 3px 0 var(--ink)" }}>
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

const KID_PALETTES = [
  { bg: "var(--berry)", color: "var(--cream)" },
  { bg: "var(--lilac)", color: "var(--twilight)" },
  { bg: "var(--sage)", color: "var(--cream)" },
  { bg: "var(--moon)", color: "var(--twilight)" },
];

export default function ShelfPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeView, setActiveView] = useState("Shelf");
  const [search, setSearch] = useState("");

  const [kids, setKids] = useState<APIKid[]>([]);
  const [stories, setStories] = useState<APIStory[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/dashboard", { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject(new Error(`Dashboard ${r.status}`))),
      fetch("/api/stories?limit=100", { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject(new Error(`Stories ${r.status}`))),
    ])
      .then(([dash, list]: [{ kids: APIKid[] }, { stories: APIStory[] }]) => {
        if (cancelled) return;
        setKids(dash.kids ?? []);
        setStories(list.stories ?? []);
      })
      .catch((e: unknown) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Could not load shelf");
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
      recentBooks: recentList.map((s, i) => toBook(s, i)) as Book[],
      favBooks: favList.map((s, i) => toBook(s, i, { badgeForced: "♡", badgeCls: "" })) as Book[],
      monthBooks: olderList.map((s, i) => toBook(s, i)) as Book[],
      listBooks: sorted.map((s, i) => toBook(s, i)) as Book[],
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
              {stories.length} {stories.length === 1 ? "story" : "stories"} across {kids.length} little {kids.length === 1 ? "hero" : "heroes"}. Favorites are always yours to keep.
            </div>
          </div>
          <Link href="/stories/new" className="dash-shelf-top-btn dash-shelf-head-anim dash-shelf-head-delay-3" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 999, fontWeight: 800, fontSize: 15, border: "2px solid var(--ink)", background: "var(--berry)", color: "var(--cream)", cursor: "pointer", boxShadow: "3px 3px 0 var(--ink)", textDecoration: "none" }}>+ Craft a new tale</Link>
        </div>

        {/* Kid tabs */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
          {kidTabs.map(t => {
            const palette = t.paletteIdx >= 0 ? KID_PALETTES[t.paletteIdx % KID_PALETTES.length] : { bg: "var(--moon)", color: "var(--twilight)" };
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`dash-kid-tab${activeTab === t.id ? " dash-kid-tab-active" : ""}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px 10px 10px", background: activeTab === t.id ? "var(--twilight)" : "var(--cream)", border: "2px solid var(--ink)", borderRadius: 999, color: activeTab === t.id ? "var(--cream)" : "var(--ink)" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: t.id === "all" ? 12 : 14, background: palette.bg, color: palette.color }}>{t.label}</div>
                <span style={{ fontWeight: 800, fontSize: 14 }}>{t.nm}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", background: activeTab === t.id ? "rgba(251,243,227,0.18)" : "rgba(28,21,64,0.08)", borderRadius: 999, opacity: 1 }}>{t.ct}</span>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, padding: "14px 18px", background: "var(--cream)", border: "2px solid var(--ink)", borderRadius: 18, boxShadow: "4px 4px 0 var(--ink)", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--cream-deep)", border: "1.5px solid var(--ink)", borderRadius: 999, padding: "8px 16px", flex: 1, minWidth: 220, maxWidth: 420 }}>
            <span style={{ fontSize: 15, color: "var(--ink-soft)" }}>⌕</span>
            <input type="text" placeholder="Search by title, hero, or lesson…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: "none", background: "transparent", outline: "none", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 600, fontSize: 14, color: "var(--ink)", flex: 1 }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`dash-fc${activeFilter === f ? " dash-fc-active" : ""}`} style={{ padding: "7px 14px", background: activeFilter === f ? "var(--twilight)" : "var(--cream-deep)", border: "1.5px solid var(--ink)", borderRadius: 999, fontWeight: 700, fontSize: 12.5, color: activeFilter === f ? "var(--cream)" : "var(--twilight)", cursor: "pointer", boxShadow: activeFilter === f ? "2px 2px 0 var(--ink)" : "none" }}>{f}</button>
            ))}
          </div>
          <div style={{ display: "flex", border: "1.5px solid var(--ink)", borderRadius: 999, overflow: "hidden", background: "var(--cream-deep)" }}>
            {["Shelf", "List"].map(v => (
              <button key={v} onClick={() => setActiveView(v)} className="dash-view-btn" style={{ border: "none", background: activeView === v ? "var(--twilight)" : "transparent", padding: "8px 14px", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: 12.5, color: activeView === v ? "var(--moon)" : "var(--ink-soft)", cursor: "pointer" }}>{v}</button>
            ))}
          </div>
        </div>

        {activeView === "List" ? (
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

        {filtered.length === 0 && !loadError && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-soft)" }}>
            <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 24, color: "var(--twilight)", marginBottom: 8 }}>
              {stories.length === 0 ? "Your shelf is waiting" : "No tales match"}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              {stories.length === 0 ? "Spin your first story to begin." : "Try a different filter or hero."}
            </div>
            {stories.length === 0 && (
              <Link href="/stories/new" className="btn btn-berry" style={{ display: "inline-block" }}>+ Craft a tale</Link>
            )}
          </div>
        )}

      </main>

      <footer style={{ maxWidth: 1400, margin: "40px auto 0", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--ink-soft)", fontWeight: 600, borderTop: "2px dashed var(--paper-line)", position: "relative", zIndex: 2 }}>
        <div>© 2026 TellTales · Sweet dreams guaranteed.</div>
        <div>
          <Link href="#" style={{ marginLeft: 20, color: "inherit", textDecoration: "none" }}>Privacy (COPPA)</Link>
          <DeleteMyDataLink />
          <Link href="#" style={{ marginLeft: 20, color: "inherit", textDecoration: "none" }}>Help</Link>
        </div>
      </footer>
    </>
  );
}
