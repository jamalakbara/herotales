"use client";
import Link from "next/link";
import { useState } from "react";
import { DashboardNav } from "@/components/dashboard-nav";

function covStyle(cls: string): React.CSSProperties {
  const bg: Record<string, string> = {
    "bc-1": "var(--berry)", "bc-2": "var(--twilight)", "bc-3": "var(--moon)",
    "bc-4": "var(--sage)", "bc-5": "var(--lilac)", "bc-6": "var(--cream)",
  };
  const col: Record<string, string> = {
    "bc-1": "var(--cream)", "bc-2": "var(--cream)", "bc-3": "var(--twilight)",
    "bc-4": "var(--cream)", "bc-5": "var(--twilight)", "bc-6": "var(--twilight)",
  };
  return { background: bg[cls] ?? "var(--cream)", color: col[cls] ?? "var(--ink)" };
}

const books = [
  { id: 1, cls: "bc-2", badge: "In progress", badgeBerry: true, label: "Chapter 2 of 5", title: "Maya & the", script: "Brave Lantern", theme: "Bravery", star: "★", infoTitle: "Maya & the Brave Lantern", forKid: "Ada", when: "Last night", href: "/stories/1" },
  { id: 2, cls: "bc-3", badge: "Favorite ♡", badgeBerry: false, label: "Complete · 5 chapters", title: "The Garden That", script: "Grew Slowly", theme: "Patience", star: "☾", infoTitle: "The Garden That Grew Slowly", forKid: "Ada", when: "3 nights ago", href: "#" },
  { id: 3, cls: "bc-1", badge: "", badgeBerry: false, label: "Complete · 5 chapters", title: "Ada & the", script: "Honest Fox", theme: "Honesty", star: "✦", infoTitle: "Ada & the Honest Fox", forKid: "Ada", when: "Last Tuesday", href: "#" },
  { id: 4, cls: "bc-4", badge: "Printed ✦", badgeBerry: false, label: "Complete · 5 chapters", title: "The Smallest", script: "Friend at School", theme: "Kindness", star: "♡", infoTitle: "The Smallest Friend at School", forKid: "Ada", when: "12 days ago", href: "#" },
  { id: 5, cls: "bc-5", badge: "", badgeBerry: false, label: "Complete · 5 chapters", title: "Theo & the", script: "Long Climb", theme: "Persistence", star: "↑", infoTitle: "Theo & the Long Climb", forKid: "Theo", when: "Last Saturday", href: "#" },
  { id: 6, cls: "bc-6", badge: "", badgeBerry: false, label: "Complete · 5 chapters", title: "The Quiet Stage", script: "& the Deep Breath", theme: "Bravery", star: "★", infoTitle: "The Quiet Stage & the Deep Breath", forKid: "Ada", when: "3 weeks ago", href: "#" },
  { id: 7, cls: "bc-2", badge: "", badgeBerry: false, label: "Complete · 5 chapters", title: "Noor & the", script: "Patient Seed", theme: "Patience", star: "☾", infoTitle: "Noor & the Patient Seed", forKid: "Noor", when: "last month", href: "#" },
];

const kids = [
  { name: "Ada", age: "5 years · she/her", avBg: "var(--berry)", avCol: "var(--cream)", tales: 14, favs: 5, printed: 1 },
  { name: "Theo", age: "3 years · he/him", avBg: "var(--lilac)", avCol: "var(--twilight)", tales: 9, favs: 3, printed: 0 },
  { name: "Noor", age: "7 years · they/them", avBg: "var(--sage)", avCol: "var(--cream)", tales: 5, favs: 2, printed: 0 },
];

const filters = ["All", "Favorites ♡", "Bravery", "Kindness", "Patience", "Sort: Recent ▾"];

export default function DashboardPage() {
  const [activeKid, setActiveKid] = useState(0);
  const [activeFilter, setActiveFilter] = useState("All");

  const scriptCol = (cls: string) => (cls === "bc-2" || cls === "bc-1" || cls === "bc-4") ? "var(--moon)" : "inherit";
  const starBg = (cls: string) => (cls === "bc-3" || cls === "bc-5" || cls === "bc-6") ? "rgba(28,21,64,0.12)" : "rgba(255,255,255,0.18)";

  return (
    <>
      <DashboardNav />
      <main className="dash-page" style={{ maxWidth: 1400, margin: "0 auto", padding: "10px 48px 80px", position: "relative", zIndex: 2 }}>

        {/* GREETING */}
        <div className="dash-greet" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 36, marginBottom: 48, alignItems: "stretch" }}>
          <div style={{ background: "var(--cream)", border: "2.5px solid var(--ink)", borderRadius: 28, boxShadow: "8px 8px 0 var(--ink)", padding: "40px 44px", position: "relative", overflow: "hidden" }}>
            <span style={{ position: "absolute", top: 20, right: 32, fontFamily: "var(--font-caprasimo), serif", fontSize: 64, color: "var(--moon)", transform: "rotate(14deg)", opacity: 0.85, pointerEvents: "none" }}>✦</span>
            <div style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: 16, transform: "rotate(-1.5deg)", display: "inline-block", marginBottom: 10 }}>Friday evening, 7:14pm</div>
            <h1 style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(36px, 3.6vw, 50px)", lineHeight: 1.02, letterSpacing: "-0.02em", color: "var(--twilight)", maxWidth: 560, marginBottom: 14 }}>
              Welcome back, <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)" }}>Ramona</span>. The woods are ready when you are.
            </h1>
            <p style={{ fontSize: 17, color: "var(--ink-soft)", fontWeight: 500, maxWidth: 500, marginBottom: 28, lineHeight: 1.5 }}>
              You&apos;ve read 28 bedtime tales together. Ada&apos;s shelf is filling up — and tonight feels like a good night for another chapter.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/stories/new" className="dash-btn dash-btn-berry">Start tonight&apos;s story →</Link>
              <button className="dash-btn dash-btn-ghost" style={{ border: "1.5px solid var(--ink)" }}>Re-read last night&apos;s</button>
            </div>
          </div>

          <div style={{ background: "var(--twilight)", color: "var(--cream)", border: "2.5px solid var(--ink)", borderRadius: 28, boxShadow: "8px 8px 0 var(--ink)", padding: 32, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "var(--moon)", borderRadius: "50%", opacity: 0.18, pointerEvents: "none" }} />
            <div>
              <div style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--moon)", fontSize: 15, marginBottom: 8 }}>Pick up where you left off</div>
              <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 28, lineHeight: 1.1, maxWidth: 320, marginBottom: 14 }}>
                Maya &amp; the <span style={{ color: "var(--moon)", fontFamily: "var(--font-caprasimo), serif" }}>Brave Lantern</span>
              </div>
              <div style={{ fontSize: 14, color: "rgba(251,243,227,0.75)", fontWeight: 500, lineHeight: 1.5, maxWidth: 360, marginBottom: 22 }}>You finished Chapter 2 last night. One more and the owl appears with kind eyes.</div>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div className="dash-play-icon" style={{ width: 56, height: 56, borderRadius: 14, background: "var(--berry)", border: "2px solid var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--cream)", fontFamily: "var(--font-caprasimo), serif", fontSize: 22, flexShrink: 0 }}>▶</div>
              <div style={{ flex: 1, minWidth: 0, fontSize: 12, opacity: 0.7 }}>
                <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 18, color: "var(--cream)", opacity: 1, marginBottom: 2 }}>Chapter 3 · A whisper in the dark</div>
                <div>2 min 14 sec · Juniper&apos;s voice</div>
              </div>
              <Link href="/stories/1" className="dash-resume-btn">Resume</Link>
            </div>
          </div>
        </div>

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
          {kids.map((kid, i) => (
            <div key={kid.name} className="dash-kid-card" onClick={() => setActiveKid(i)} style={{ background: activeKid === i ? "var(--moon)" : "var(--cream)", border: "2.5px solid var(--ink)", borderRadius: 20, boxShadow: "5px 5px 0 var(--ink)", padding: 22 }}>
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
          <div className="dash-kid-add" style={{ background: "transparent", border: "2.5px dashed var(--ink)", borderRadius: 20, boxShadow: "none", padding: "22px 16px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", color: "var(--ink-soft)" }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, border: "2px dashed var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 400, background: "var(--cream-deep)", color: "var(--ink-soft)" }}>+</div>
            <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 18, color: "var(--twilight)", marginTop: 12 }}>Add another hero</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4, fontWeight: 600 }}>Up to 3 on your Lantern plan</div>
          </div>
        </div>

        {/* SHELF HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(24px, 2.4vw, 30px)", color: "var(--twilight)", letterSpacing: "-0.01em" }}>
              Ada&apos;s <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: "0.9em" }}>shelf</span>
            </h2>
            <div style={{ fontSize: 13.5, color: "var(--ink-soft)", fontWeight: 600, marginTop: 4 }}>14 stories · 5 favorites · last read last night</div>
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
          {books.map(b => (
            <Link key={b.id} href={b.href} className="dash-book-card">
              {b.badge && (
                <div style={{ position: "absolute", top: -8, right: -6, padding: "4px 10px", background: b.badgeBerry ? "var(--berry)" : "var(--moon)", border: "2px solid var(--ink)", borderRadius: 999, fontFamily: "var(--font-caprasimo), serif", fontSize: 12, color: b.badgeBerry ? "var(--cream)" : "var(--twilight)", transform: "rotate(6deg)", zIndex: 3 }}>{b.badge}</div>
              )}
              <div style={{ aspectRatio: "5/6.4", borderRadius: "6px 12px 12px 6px", border: "2.5px solid var(--ink)", boxShadow: "5px 5px 0 var(--ink)", padding: "18px 16px", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between", marginBottom: 12, ...covStyle(b.cls) }}>
                <div style={{ position: "absolute", left: 6, top: 12, bottom: 12, width: 2, background: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>{b.label}</div>
                  <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 22, lineHeight: 1.05, marginTop: 6 }}>
                    {b.title}
                    <span style={{ fontFamily: "var(--font-caprasimo), serif", display: "block", fontSize: 20, color: scriptCol(b.cls) }}>{b.script}</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 11, fontWeight: 700 }}>
                  <span>{b.theme}</span>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: starBg(b.cls), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 14 }}>{b.star}</div>
                </div>
              </div>
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
          <Link href="/stories/new" className="dash-new-tile">
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
              12<span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-nunito), sans-serif", color: "var(--ink-soft)" }}>nights in a row</span>
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
              28<span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-nunito), sans-serif", color: "var(--ink-soft)" }}>of 31 stories used</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)", fontWeight: 600, marginTop: 8, maxWidth: 280, lineHeight: 1.4 }}>Lantern plan resets on Apr 30. You&apos;re 3 stories away from your monthly cap.</div>
            <Link href="#" className="dash-stat-link" style={{ marginTop: 12, display: "inline-block" }}>Upgrade to Constellation →</Link>
          </div>
          {/* Keepsake */}
          <div style={{ background: "var(--sage)", color: "var(--cream)", border: "2.5px solid var(--ink)", borderRadius: 22, boxShadow: "6px 6px 0 var(--ink)", padding: "24px 26px" }}>
            <div style={{ fontFamily: "var(--font-caprasimo), serif", fontSize: 13, color: "var(--moon)", marginBottom: 6 }}>Keepsake book</div>
            <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 46, color: "var(--cream)", lineHeight: 1, letterSpacing: "-0.02em", display: "flex", alignItems: "baseline", gap: 8 }}>
              1<span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-nunito), sans-serif", color: "rgba(251,243,227,0.75)" }}>on its way</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
              <div style={{ width: 48, height: 58, background: "var(--berry)", border: "2px solid var(--ink)", borderRadius: "3px 6px 6px 3px", position: "relative", flexShrink: 0 }}>
                <div style={{ position: "absolute", left: 4, top: 6, bottom: 6, width: 2, background: "rgba(251,243,227,0.35)" }} />
                <span style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", color: "var(--moon)", fontFamily: "var(--font-caprasimo), serif", fontSize: 12 }}>✦</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                &ldquo;The Smallest Friend at School&rdquo;<br />
                <span style={{ opacity: 0.7 }}>Ships Tuesday · arrives Apr 30</span>
              </div>
            </div>
            <Link href="/keepsake-books" className="dash-stat-link" style={{ color: "var(--moon)", marginTop: 14, display: "inline-block" }}>Track &amp; order more →</Link>
          </div>
        </div>

        {/* BLUEPRINT NUDGE */}
        <div style={{ background: "var(--berry)", color: "var(--cream)", border: "2.5px solid var(--ink)", borderRadius: 28, boxShadow: "8px 8px 0 var(--ink)", padding: "36px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 28, flexWrap: "wrap", position: "relative", overflow: "hidden", marginBottom: 40 }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, background: "var(--moon)", borderRadius: "50%", opacity: 0.2, pointerEvents: "none" }} />
          <div style={{ position: "relative", maxWidth: 560 }}>
            <div style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--moon)", fontSize: 14, marginBottom: 6 }}>Gentle nudge</div>
            <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 28, lineHeight: 1.1, marginBottom: 8 }}>Ada hasn&apos;t met Kindness in a while.</div>
            <div style={{ fontSize: 14.5, opacity: 0.88, lineHeight: 1.5 }}>Her last Kindness tale was 12 days ago. Want to spin one for tonight — or keep building Bravery?</div>
          </div>
          <div style={{ display: "flex", gap: 10, position: "relative" }}>
            {[{ icon: "♡", label: "Kindness" }, { icon: "⟲", label: "Patience" }, { icon: "↑", label: "Persistence" }].map(bp => (
              <Link key={bp.label} href="/stories/new" className="dash-bpc" style={{ padding: "12px 14px", background: "var(--cream)", color: "var(--twilight)", border: "2px solid var(--ink)", borderRadius: 14, fontFamily: "var(--font-young-serif), serif", fontSize: 13, textAlign: "center", minWidth: 84 }}>
                <span style={{ display: "block", fontFamily: "var(--font-caprasimo), serif", fontSize: 20, color: "var(--berry)", marginBottom: 4 }}>{bp.icon}</span>
                {bp.label}
              </Link>
            ))}
          </div>
        </div>

      </main>

      <footer style={{ maxWidth: 1400, margin: "40px auto 0", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--ink-soft)", fontWeight: 600, borderTop: "2px dashed var(--paper-line)", position: "relative", zIndex: 2 }}>
        <div>© 2026 TellTales · Sweet dreams guaranteed.</div>
        <div>
          <Link href="#" className="dash-nav-link" style={{ marginLeft: 20 }}>Privacy (COPPA)</Link>
          <Link href="#" className="dash-nav-link" style={{ marginLeft: 20 }}>Delete all my data</Link>
          <Link href="#" className="dash-nav-link" style={{ marginLeft: 20 }}>Help</Link>
        </div>
      </footer>
    </>
  );
}
