"use client";
import Link from "next/link";
import { useState, CSSProperties } from "react";
import { DashboardNav } from "@/components/dashboard-nav";

function BookCoverStyle(cls: string) {
  const bg: Record<string, string> = {
    "bc-1": "var(--berry)", "bc-2": "var(--twilight)", "bc-3": "var(--moon)",
    "bc-4": "var(--sage)", "bc-5": "var(--lilac)", "bc-6": "var(--cream)",
  };
  const col: Record<string, string> = {
    "bc-1": "var(--cream)", "bc-2": "var(--cream)", "bc-3": "var(--twilight)",
    "bc-4": "var(--cream)", "bc-5": "var(--twilight)", "bc-6": "var(--twilight)",
  };
  return { background: bg[cls] || "var(--cream)", color: col[cls] || "var(--ink)" };
}

type Book = { cls: string; badge?: string; badgeCls?: string; label: string; title: string; script: string; theme: string; star: string; infoTitle: string; forKid: string; when?: string; href: string };

function BookCard({ b, small, index }: { b: Book; small?: boolean; index: number }) {
  const sz = small ? { fontSize: 18, scriptSz: 17 } : { fontSize: 22, scriptSz: 20 };
  const styleVars = { "--i": index } as CSSProperties;
  return (
    <Link href={b.href} className="dash-book-card dash-book-card-anim" style={{ ...styleVars, textDecoration: "none", display: "block", position: "relative" }}>
      {b.badge && (
        <div className="dash-bc-badge-anim" style={{ position: "absolute", top: -8, right: -6, padding: "3px 9px", background: b.badgeCls === "berry" ? "var(--berry)" : b.badgeCls === "sage" ? "var(--sage)" : "var(--moon)", border: "2px solid var(--ink)", borderRadius: 999, fontFamily: "var(--font-caprasimo), serif", fontSize: 11, color: (b.badgeCls === "berry" || b.badgeCls === "sage") ? "var(--cream)" : "var(--twilight)", transform: "rotate(6deg)", zIndex: 3 }}>{b.badge}</div>
      )}
      <div className="dash-book-cover-anim" style={{ aspectRatio: "5/6.4", borderRadius: "6px 12px 12px 6px", border: "2.5px solid var(--ink)", boxShadow: "5px 5px 0 var(--ink)", padding: "16px 14px", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between", marginBottom: 10, ...BookCoverStyle(b.cls) }}>
        <div style={{ position: "absolute", left: 5, top: 10, bottom: 10, width: 2, background: (b.cls === "bc-3" || b.cls === "bc-5" || b.cls === "bc-6") ? "rgba(28,21,64,0.2)" : "rgba(255,255,255,0.3)" }} />
        <div>
          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>{b.label}</div>
          <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: sz.fontSize, lineHeight: 1.05, marginTop: 5 }}>
            {b.title}
            <span style={{ fontFamily: "var(--font-caprasimo), serif", display: "block", fontSize: sz.scriptSz, color: (b.cls === "bc-2" || b.cls === "bc-1" || b.cls === "bc-4") ? "var(--moon)" : "inherit" }}>{b.script}</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 10.5, fontWeight: 700 }}>
          <span>{b.theme}</span>
          <div className="dash-bc-star-anim" style={{ width: 30, height: 30, borderRadius: "50%", background: (b.cls === "bc-3" || b.cls === "bc-5" || b.cls === "bc-6") ? "rgba(28,21,64,0.12)" : "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 13 }}>{b.star}</div>
        </div>
      </div>
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
        {books.map((b, i) => <BookCard key={i} b={b} small index={i} />)}
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

const recentBooks: Book[] = [
  { cls: "bc-2", badge: "In progress", badgeCls: "berry", label: "Chapter 2 of 5", title: "Maya & the", script: "Brave Lantern", theme: "Bravery", star: "★", infoTitle: "Maya & the Brave Lantern", forKid: "Ada", when: "Last night", href: "/stories/1" },
  { cls: "bc-3", badge: "Favorite ♡", badgeCls: "", label: "5 chapters", title: "The Garden That", script: "Grew Slowly", theme: "Patience", star: "☾", infoTitle: "The Garden That Grew Slowly", forKid: "Ada", when: "3 nights ago", href: "#" },
  { cls: "bc-1", label: "5 chapters", title: "Ada & the", script: "Honest Fox", theme: "Honesty", star: "✦", infoTitle: "Ada & the Honest Fox", forKid: "Ada", when: "Last Tuesday", href: "#" },
  { cls: "bc-5", label: "5 chapters", title: "Theo & the", script: "Long Climb", theme: "Persistence", star: "↑", infoTitle: "Theo & the Long Climb", forKid: "Theo", when: "Last Saturday", href: "#" },
  { cls: "bc-4", badge: "Printed ✦", badgeCls: "sage", label: "5 chapters", title: "The Smallest", script: "Friend at School", theme: "Kindness", star: "♡", infoTitle: "The Smallest Friend at School", forKid: "Ada", when: "12 days ago", href: "#" },
];

const favBooks: Book[] = [
  { cls: "bc-3", badge: "♡", label: "5 chapters", title: "The Garden That", script: "Grew Slowly", theme: "Patience", star: "☾", infoTitle: "The Garden That Grew Slowly", forKid: "Ada", href: "#" },
  { cls: "bc-1", badge: "♡", label: "5 chapters", title: "Ada & the", script: "Honest Fox", theme: "Honesty", star: "✦", infoTitle: "Ada & the Honest Fox", forKid: "Ada", href: "#" },
  { cls: "bc-4", badge: "♡", label: "5 chapters", title: "The Smallest", script: "Friend at School", theme: "Kindness", star: "♡", infoTitle: "The Smallest Friend", forKid: "Ada", href: "#" },
  { cls: "bc-6", badge: "♡", label: "5 chapters", title: "The Quiet Stage", script: "& the Deep Breath", theme: "Bravery", star: "★", infoTitle: "The Quiet Stage", forKid: "Ada", href: "#" },
  { cls: "bc-2", badge: "♡", label: "5 chapters", title: "Noor & the", script: "Patient Seed", theme: "Patience", star: "☾", infoTitle: "Noor & the Patient Seed", forKid: "Noor", href: "#" },
];

const monthBooks: Book[] = [
  { cls: "bc-1", label: "5 chapters", title: "The Tall Slide", script: "at Recess", theme: "Bravery", star: "★", infoTitle: "The Tall Slide at Recess", forKid: "Ada", when: "Apr 6", href: "#" },
  { cls: "bc-5", label: "5 chapters", title: "Theo Meets", script: "the New Puppy", theme: "Kindness", star: "♡", infoTitle: "Theo Meets the New Puppy", forKid: "Theo", when: "Apr 4", href: "#" },
  { cls: "bc-3", label: "5 chapters", title: "The Tooth That", script: "Took Its Time", theme: "Patience", star: "☾", infoTitle: "The Tooth That Took Its Time", forKid: "Ada", when: "Apr 2", href: "#" },
  { cls: "bc-4", label: "5 chapters", title: "Noor Shares", script: "the Last Crayon", theme: "Kindness", star: "♡", infoTitle: "Noor Shares the Last Crayon", forKid: "Noor", when: "Mar 30", href: "#" },
  { cls: "bc-2", label: "5 chapters", title: "Ada Learns", script: "to Float", theme: "Bravery", star: "★", infoTitle: "Ada Learns to Float", forKid: "Ada", when: "Mar 28", href: "#" },
];

export default function ShelfPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeView, setActiveView] = useState("Shelf");

  const kidTabs = [
    { id: "all", av: "all", nm: "All heroes", ct: 28 },
    { id: "ada", av: "a1", nm: "Ada", ct: 14 },
    { id: "theo", av: "a2", nm: "Theo", ct: 9 },
    { id: "noor", av: "a3", nm: "Noor", ct: 5 },
  ];
  const avBg: Record<string, string> = { all: "var(--moon)", a1: "var(--berry)", a2: "var(--lilac)", a3: "var(--sage)" };
  const avColor: Record<string, string> = { all: "var(--twilight)", a1: "var(--cream)", a2: "var(--twilight)", a3: "var(--cream)" };
  const avLabel: Record<string, string> = { all: "★", a1: "A", a2: "T", a3: "N" };

  const filters = ["All", "Favorites ♡", "Bravery", "Honesty", "Patience", "Kindness", "Persistence"];

  return (
    <>
      <DashboardNav />
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "10px 48px 80px", position: "relative", zIndex: 2 }}>

        <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          <div>
            <span className="dash-shelf-kicker-anim" style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: 17, transform: "rotate(-1.5deg)", display: "inline-block", marginBottom: 8 }}>Every tale you&apos;ve told</span>
            <h1 className="dash-shelf-head-anim dash-shelf-head-delay-1" style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(38px, 4vw, 56px)", lineHeight: 1.02, letterSpacing: "-0.02em", color: "var(--twilight)" }}>
              The whole <span style={{ fontFamily: "var(--font-caprasimo), serif", fontStyle: "normal", color: "var(--berry)" }}>shelf</span>
            </h1>
            <div className="dash-shelf-head-anim dash-shelf-head-delay-2" style={{ fontSize: 16, color: "var(--ink-soft)", fontWeight: 500, marginTop: 8, maxWidth: 520 }}>28 stories across 3 little heroes. Favorites are always yours to keep — even after a plan change.</div>
          </div>
          <Link href="/stories/new" className="dash-shelf-top-btn dash-shelf-head-anim dash-shelf-head-delay-3" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 999, fontWeight: 800, fontSize: 15, border: "2px solid var(--ink)", background: "var(--berry)", color: "var(--cream)", cursor: "pointer", boxShadow: "3px 3px 0 var(--ink)", textDecoration: "none" }}>+ Craft a new tale</Link>
        </div>

        {/* Kid tabs */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
          {kidTabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`dash-kid-tab${activeTab === t.id ? " dash-kid-tab-active" : ""}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px 10px 10px", background: activeTab === t.id ? "var(--twilight)" : "var(--cream)", border: "2px solid var(--ink)", borderRadius: 999, color: activeTab === t.id ? "var(--cream)" : "var(--ink)" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: t.id === "all" ? 12 : 14, background: avBg[t.av], color: avColor[t.av] }}>{avLabel[t.av]}</div>
              <span style={{ fontWeight: 800, fontSize: 14 }}>{t.nm}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", background: activeTab === t.id ? "rgba(251,243,227,0.18)" : "rgba(28,21,64,0.08)", borderRadius: 999, opacity: 1 }}>{t.ct}</span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, padding: "14px 18px", background: "var(--cream)", border: "2px solid var(--ink)", borderRadius: 18, boxShadow: "4px 4px 0 var(--ink)", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--cream-deep)", border: "1.5px solid var(--ink)", borderRadius: 999, padding: "8px 16px", flex: 1, minWidth: 220, maxWidth: 420 }}>
            <span style={{ fontSize: 15, color: "var(--ink-soft)" }}>⌕</span>
            <input type="text" placeholder="Search by title, hero, or lesson…" style={{ border: "none", background: "transparent", outline: "none", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 600, fontSize: 14, color: "var(--ink)", flex: 1 }} />
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

        <ShelfSection label="Recently read" count="5 tales · last 2 weeks" books={recentBooks} />
        <ShelfSection label="Favorites" count="5 keepers" books={favBooks} />
        <ShelfSection label="Earlier this month" count="8 tales" books={monthBooks} />

      </main>

      <footer style={{ maxWidth: 1400, margin: "40px auto 0", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--ink-soft)", fontWeight: 600, borderTop: "2px dashed var(--paper-line)", position: "relative", zIndex: 2 }}>
        <div>© 2026 TellTales · Sweet dreams guaranteed.</div>
        <div>
          <Link href="#" style={{ marginLeft: 20, color: "inherit", textDecoration: "none" }}>Privacy (COPPA)</Link>
          <Link href="#" style={{ marginLeft: 20, color: "inherit", textDecoration: "none" }}>Delete all my data</Link>
          <Link href="#" style={{ marginLeft: 20, color: "inherit", textDecoration: "none" }}>Help</Link>
        </div>
      </footer>
    </>
  );
}
