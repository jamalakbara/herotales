"use client";
import Link from "next/link";
import { useState, useEffect, useMemo, CSSProperties } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import { DeleteMyDataLink } from "@/components/delete-data-link";
import { BookCover, coverAccent, type CoverAccent } from "@/components/book-cover";

type APIStory = {
  id: string;
  blueprint: string;
  status: string;
  title: string | null;
  created_at: string;
  children?: { nickname: string } | null;
};

type StoryCard = {
  id: string;
  accent: CoverAccent;
  label: string;
  title: string;
  script: string;
  theme: string;
  forKid: string;
  infoTitle: string;
};

function splitTitle(t: string): [string, string] {
  const words = t.trim().split(/\s+/);
  if (words.length <= 2) return [words.join(" "), ""];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

const features = [
  { icon: "⌾", title: "Linen-spined hardcover", sub: "Sturdy 8.5 × 8.5\" square, foil-pressed title, built for small hands and bedtime re-reads." },
  { icon: "✺", title: "Every chapter illustrated", sub: "Five full-page illustrations printed on thick, glossy paper. Your hero stays consistent across every spread." },
  { icon: "✉", title: "A dedication page", sub: "Add a \"For Ada, always brave — Love, Mum\" message on the inside cover. Free." },
  { icon: "✦", title: "Printed in 3 days, shipped in 5", sub: "Carbon-neutral print-on-demand — we wait until you order, so no books sit on a shelf." },
];

// TODO: Phase 3 — Stripe. Real keepsake orders backed by `keepsake_orders` table.
const orders: {
  spineCls: string;
  title: string;
  sub: string;
  status: string;
  statusLabel: string;
  date: string;
  eta: string;
  actions: { label: string; prim: boolean }[];
}[] = [];

const spineBg: Record<string, string> = { s1: "var(--berry)", s2: "var(--sage)", s3: "var(--twilight)" };
const statusStyle: Record<string, { background: string; color: string }> = {
  shipping: { background: "var(--moon)", color: "var(--twilight)" },
  delivered: { background: "var(--sage)", color: "var(--cream)" },
  printing: { background: "var(--berry)", color: "var(--cream)" },
};

const faqs = [
  { q: "How long does a book take to arrive?", a: "Most orders print in 2–3 business days and ship in another 3–4, for a total of 5–7 days in the US and 7–12 days internationally. You'll get a tracking link the moment it's handed to the courier." },
  { q: "Can I edit the story before it's printed?", a: "Yes — every order holds for 4 hours before going to print, and you can tweak text, swap illustrations, or add a dedication page during that window." },
  { q: "What if an illustration has a mistake?", a: "Our character-consistency pass makes illustrations reliable, but if something looks off we'll regenerate any single image for free before print — just tap \"regenerate\" in the order editor." },
  { q: "Can I gift a book to grandparents?", a: "Absolutely. During checkout, enter a different shipping address and we'll tuck a handwritten-style gift note inside the cover at no extra cost." },
  { q: "Is the printing eco-friendly?", a: "Our printer uses FSC-certified paper and vegetable-based inks, and we offset the full shipping footprint on every order — no extra cost to you." },
];

export default function KeepsakeBooksPage() {
  const [selectedStory, setSelectedStory] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [featuredPlan, setFeaturedPlan] = useState(1);
  const [apiStories, setApiStories] = useState<APIStory[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/stories?status=ready&limit=20", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!alive) return;
        setApiStories(json.stories ?? []);
      } catch (e) {
        if (!alive) return;
        setLoadError(e instanceof Error ? e.message : "Failed to load stories");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const stories: StoryCard[] = useMemo(() => {
    return apiStories.slice(0, 5).map((s, i) => {
      const fullTitle = s.title ?? "Untitled tale";
      const [title, script] = splitTitle(fullTitle);
      const kid = s.children?.nickname ?? "—";
      return {
        id: s.id,
        accent: coverAccent(i),
        label: "5 chapters · complete",
        title,
        script,
        theme: s.blueprint,
        forKid: kid,
        infoTitle: fullTitle,
      };
    });
  }, [apiStories]);

  return (
    <>
      <DashboardNav />
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "10px 48px 80px", position: "relative", zIndex: 2 }}>

        {/* HERO */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 40, background: "var(--twilight)", color: "var(--cream)", border: "2.5px solid var(--ink)", borderRadius: 28, boxShadow: "10px 10px 0 var(--ink)", padding: "48px 52px", marginBottom: 48, alignItems: "center", position: "relative", overflow: "hidden" }}>
          <div className="kp-blob" style={{ position: "absolute", top: -60, right: -40, width: 220, height: 220, background: "var(--moon)", borderRadius: "50%", opacity: 0.18 }} />
          <div className="kp-blob-2" style={{ position: "absolute", bottom: -80, left: "30%", width: 180, height: 180, background: "var(--berry)", borderRadius: "50%", opacity: 0.16 }} />
          <div style={{ position: "relative" }}>
            <span className="kp-hero-kicker" style={{ fontFamily: "var(--font-caprasimo), serif", fontSize: 16, color: "var(--moon)", marginBottom: 10, transform: "rotate(-1deg)", display: "inline-block" }}>Printed with care</span>
            <h1 className="kp-hero-fade kp-hero-fade-d1" style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(38px, 4.4vw, 60px)", lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 18 }}>
              Turn tonight&apos;s tale into a <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--moon)" }}>real, hardcover</span> keepsake.
            </h1>
            <p className="kp-hero-fade kp-hero-fade-d2" style={{ fontSize: 17, color: "rgba(251,243,227,0.82)", maxWidth: 480, lineHeight: 1.5, fontWeight: 500, marginBottom: 28 }}>Any story on your shelf becomes a linen-spined, glossy-page book — printed on demand, shipped to your door in 5–7 days, and kept on their shelf forever.</p>
            <div className="kp-hero-fade kp-hero-fade-d3" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="#pick" className="kp-cta" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 999, fontWeight: 800, fontSize: 15, border: "2px solid var(--ink)", background: "var(--moon)", color: "var(--ink)", cursor: "pointer", boxShadow: "3px 3px 0 var(--ink)", textDecoration: "none" }}>Pick a tale →</a>
              <a href="#how" className="kp-cta-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 999, fontWeight: 800, fontSize: 15, border: "1.5px solid rgba(251,243,227,0.4)", background: "transparent", color: "var(--cream)", cursor: "pointer", textDecoration: "none" }}>See what&apos;s inside</a>
            </div>
          </div>
          {/* Book mock stack */}
          <div style={{ position: "relative", height: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {[
              { bg: "var(--berry)", col: "var(--cream)", lbl: "Chapter 1", title: "Ada & the", script: "Honest Fox", meta: "Honesty", star: "✦", t: "rotate(-10deg) translate(-90px, 30px)", z: 2, d: "0s" },
              { bg: "var(--cream)", col: "var(--twilight)", lbl: "Keepsake edition", title: "The Smallest", script: "Friend at School", scriptCol: "var(--berry)", meta: "Kindness · hardcover", star: "♡", t: "rotate(3deg) translate(20px, -10px)", z: 3, d: "-2.3s" },
              { bg: "var(--sage)", col: "var(--cream)", lbl: "Linen spine", title: "The Garden That", script: "Grew Slowly", meta: "Patience", star: "☾", t: "rotate(-2deg) translate(130px, 70px)", z: 1, d: "-4.6s" },
            ].map((bm, i) => {
              const wrapVars = { "--d": bm.d } as CSSProperties;
              return (
                <div key={i} className="kp-book-wrap" style={{ zIndex: bm.z, transform: bm.t }}>
                  <div className="kp-book-inner" style={{ ...wrapVars, border: "2.5px solid var(--ink)", borderRadius: "4px 14px 14px 4px", boxShadow: i === 1 ? "10px 10px 0 var(--ink)" : "8px 8px 0 var(--ink)", padding: "24px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: bm.bg, color: bm.col, position: "relative" }}>
                    <div style={{ position: "absolute", left: 8, top: 16, bottom: 16, width: 4, background: bm.bg === "var(--cream)" ? "rgba(28,21,64,0.15)" : "rgba(255,255,255,0.25)", borderRadius: 2 }} />
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>{bm.lbl}</div>
                      <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 22, lineHeight: 1.05, marginTop: 8 }}>
                        {bm.title}
                        <span style={{ fontFamily: "var(--font-caprasimo), serif", display: "block", fontSize: 20, color: bm.scriptCol || "var(--moon)" }}>{bm.script}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <span>{bm.meta}</span>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: bm.bg === "var(--cream)" ? "rgba(28,21,64,0.1)" : "rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 16 }}>{bm.star}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FEATURES */}
        <div id="how" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 56 }}>
          {features.map((f, i) => {
            const featBg = ["var(--cream)", "var(--moon)", "var(--berry)", "var(--lilac)"][i];
            const isLight = i === 2;
            const styleVars = { "--i": i } as CSSProperties;
            return (
              <div key={i} className="kp-feat kp-stagger" style={{ ...styleVars, background: featBg, border: "2px solid var(--ink)", borderRadius: 18, boxShadow: "4px 4px 0 var(--ink)", padding: 22, color: isLight ? "var(--cream)" : "var(--ink)" }}>
                <div className="kp-feat-ic" style={{ width: 44, height: 44, borderRadius: 12, background: "var(--cream)", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 20, color: isLight ? "var(--berry)" : "var(--twilight)", marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 17, color: isLight ? "var(--cream)" : "var(--twilight)", lineHeight: 1.1, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: isLight ? "rgba(251,243,227,0.85)" : "var(--ink-soft)", fontWeight: 600, lineHeight: 1.4 }}>{f.sub}</div>
              </div>
            );
          })}
        </div>

        {/* PICK A STORY */}
        <div id="pick" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(24px, 2.4vw, 30px)", color: "var(--twilight)", letterSpacing: "-0.01em" }}>
              Pick a tale to <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: "0.9em" }}>print</span>
            </h2>
            <div style={{ fontSize: 13.5, color: "var(--ink-soft)", fontWeight: 600, marginTop: 4 }}>Only completed stories can be printed. Select one, then choose a binding below.</div>
          </div>
          <Link href="/shelf" className="kp-cta" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, fontWeight: 800, fontSize: 13, border: "1.5px solid var(--ink)", background: "transparent", color: "var(--ink)", cursor: "pointer", boxShadow: "none", textDecoration: "none" }}>Browse full shelf →</Link>
        </div>

        {loadError && (
          <div style={{ background: "var(--berry)", color: "var(--cream)", border: "2px solid var(--ink)", borderRadius: 14, padding: "12px 18px", marginBottom: 16, fontSize: 13.5, fontWeight: 700 }}>
            Could not load your library: {loadError}
          </div>
        )}

        {stories.length === 0 ? (
          <div style={{ background: "var(--cream-deep)", border: "2.5px solid var(--ink)", borderRadius: 20, boxShadow: "5px 5px 0 var(--ink)", padding: 36, marginBottom: 56, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 22, color: "var(--twilight)", marginBottom: 6 }}>No printable tales yet</div>
            <div style={{ fontSize: 14, color: "var(--ink-soft)", fontWeight: 600, marginBottom: 18 }}>Finish a story first — every completed tale lands here for keepsake printing.</div>
            <Link href="/stories/new" className="kp-cta" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 999, fontWeight: 800, fontSize: 14, border: "2px solid var(--ink)", background: "var(--moon)", color: "var(--ink)", cursor: "pointer", boxShadow: "3px 3px 0 var(--ink)", textDecoration: "none" }}>
              Start a new tale →
            </Link>
          </div>
        ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18, background: "var(--cream-deep)", border: "2.5px solid var(--ink)", borderRadius: 20, boxShadow: "5px 5px 0 var(--ink)", padding: 22, marginBottom: 56 }}>
          {stories.map((s, i) => {
            const styleVars = { "--i": i } as CSSProperties;
            return (
              <div key={s.id} onClick={() => setSelectedStory(i)} className="kp-pick kp-stagger" style={{ ...styleVars, position: "relative" }}>
                <BookCover
                  size="sm"
                  coverClassName="kp-pick-cov"
                  accent={s.accent}
                  selected={selectedStory === i}
                  label={s.label}
                  title={s.title}
                  script={s.script}
                  theme={s.theme}
                  footerRight={s.forKid}
                  overlay={selectedStory === i ? (
                    <div className="kp-pick-check" style={{ position: "absolute", top: -10, right: -10, width: 34, height: 34, borderRadius: "50%", background: "var(--moon)", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 16, color: "var(--twilight)", zIndex: 3 }}>✓</div>
                  ) : undefined}
                />
                <div>
                  <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 13.5, color: "var(--twilight)", lineHeight: 1.2 }}>{s.infoTitle}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600, marginTop: 2 }}>For {s.forKid} · {s.theme}</div>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* PRICING */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(24px, 2.4vw, 30px)", color: "var(--twilight)", letterSpacing: "-0.01em" }}>
              Choose a <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: "0.9em" }}>binding</span>
            </h2>
            <div style={{ fontSize: 13.5, color: "var(--ink-soft)", fontWeight: 600, marginTop: 4 }}>All editions are printed on thick matte paper with a foil-pressed title. Prices per book.</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 56 }}>
          {[
            { name: "Softcover", price: "$18", per: "/ book", tag: "Lovely, light, and great for grandparents' coffee tables.", feats: ["8.5 × 8.5\" square", "Perfect-bound softcover", "Free dedication page", "5–7 day shipping"], cta: "Choose softcover", ctaVariant: "", badge: "" },
            { name: "Hardcover keepsake", price: "$32", per: "/ book", tag: "The bedtime-shelf classic. Linen spine, foil title.", feats: ["Linen-wrapped hardcover", "Gold-foil pressed title", "Glossy illustration pages", "Free dedication page", "Lantern plan: 20% off"], cta: "Choose hardcover", ctaVariant: "berry", badge: "Most loved" },
            { name: "Collector's box", price: "$98", per: "/ 3 books", tag: "Three hardcovers in a linen-covered slipcase.", feats: ["Three linen hardcovers", "Matching slipcase", "Mix & match any titles", "Engraved spine numbers"], cta: "Build a collection", ctaVariant: "", badge: "" },
          ].map((plan, i) => {
            const styleVars = { "--i": i } as CSSProperties;
            const isFeatured = featuredPlan === i;
            return (
              <div key={i} onClick={() => setFeaturedPlan(i)} className={`kp-price-card kp-stagger${isFeatured ? " kp-price-featured" : ""}`} style={{ ...styleVars, background: isFeatured ? "var(--moon)" : "var(--cream)", border: "2.5px solid var(--ink)", borderRadius: 22, boxShadow: "6px 6px 0 var(--ink)", padding: 28, position: "relative" }}>
                {plan.badge && <div style={{ position: "absolute", top: -14, right: 24, padding: "5px 14px", background: "var(--berry)", color: "var(--cream)", border: "2px solid var(--ink)", borderRadius: 999, fontFamily: "var(--font-caprasimo), serif", fontSize: 13, transform: "rotate(5deg)" }}>{plan.badge}</div>}
                <div style={{ fontFamily: "var(--font-caprasimo), serif", fontSize: 20, color: "var(--berry)", marginBottom: 8 }}>{plan.name}</div>
                <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 44, color: "var(--twilight)", lineHeight: 1, marginBottom: 4 }}>
                  {plan.price}<span style={{ fontSize: 14, fontFamily: "var(--font-nunito), sans-serif", fontWeight: 600, color: "var(--ink-soft)" }}> {plan.per}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-soft)", fontWeight: 600, marginBottom: 20 }}>{plan.tag}</div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
                  {plan.feats.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>
                      <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", background: "var(--sage)", border: "1.5px solid var(--ink)", color: "var(--cream)", fontSize: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, marginTop: 1 }}>✓</span>
                      <span dangerouslySetInnerHTML={{ __html: f.replace("20% off", "<strong>20% off</strong>") }} />
                    </li>
                  ))}
                </ul>
                {/* TODO: Phase 3 — Stripe checkout. Wire to /api/stripe/checkout once subscription/keepsake billing lands. */}
                <button
                  onClick={(e) => e.stopPropagation()}
                  disabled
                  title="Keepsake printing coming soon"
                  className="kp-price-cta"
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 22px", borderRadius: 999, fontWeight: 800, fontSize: 15, border: "2px solid var(--ink)", background: plan.ctaVariant === "berry" ? "var(--berry)" : "var(--moon)", color: plan.ctaVariant === "berry" ? "var(--cream)" : "var(--ink)", cursor: "not-allowed", boxShadow: "3px 3px 0 var(--ink)", opacity: 0.6 }}
                >
                  {plan.cta} (soon)
                </button>
              </div>
            );
          })}
        </div>

        {/* ORDERS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(24px, 2.4vw, 30px)", color: "var(--twilight)", letterSpacing: "-0.01em" }}>
              Your <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: "0.9em" }}>orders</span>
            </h2>
            <div style={{ fontSize: 13.5, color: "var(--ink-soft)", fontWeight: 600, marginTop: 4 }}>
              {orders.length === 0 ? "No keepsake orders yet — printing arrives once checkout opens." : `${orders.length} keepsake${orders.length === 1 ? "" : "s"} ordered`}
            </div>
          </div>
          {/* TODO: Phase 3 — Stripe. Receipts download wired post-billing. */}
          <button disabled title="Available once keepsake checkout opens" className="kp-cta" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, fontWeight: 800, fontSize: 13, border: "1.5px solid var(--ink)", background: "transparent", color: "var(--ink)", cursor: "not-allowed", opacity: 0.5 }}>Download receipts</button>
        </div>

        <div style={{ background: "var(--cream)", border: "2.5px solid var(--ink)", borderRadius: 20, boxShadow: "5px 5px 0 var(--ink)", overflow: "hidden", marginBottom: 56 }}>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1.4fr 1fr 1fr 140px", gap: 16, alignItems: "center", padding: "14px 22px", background: "var(--cream-deep)", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-soft)" }}>
            <div /><div>Book</div><div>Status</div><div>Ordered</div><div />
          </div>
          {orders.length === 0 && (
            <div style={{ padding: "28px 22px", textAlign: "center", fontSize: 13.5, color: "var(--ink-soft)", fontWeight: 600 }}>
              Keepsake printing is launching soon. Pick a tale + binding above and we&apos;ll let you know the moment orders open.
            </div>
          )}
          {orders.map((o, i) => {
            const styleVars = { "--i": i } as CSSProperties;
            return (
              <div key={i} className="kp-order-row" style={{ ...styleVars, display: "grid", gridTemplateColumns: "60px 1.4fr 1fr 1fr 140px", gap: 16, alignItems: "center", padding: "18px 22px", borderBottom: i < orders.length - 1 ? "1.5px dashed var(--paper-line)" : "none" }}>
                <div style={{ width: 44, height: 56, background: spineBg[o.spineCls], border: "2px solid var(--ink)", borderRadius: "3px 6px 6px 3px", position: "relative", flexShrink: 0 }}>
                  <div style={{ position: "absolute", left: 4, top: 6, bottom: 6, width: 2, background: "rgba(251,243,227,0.3)" }} />
                  <span style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", color: "var(--moon)", fontFamily: "var(--font-caprasimo), serif", fontSize: 12 }}>✦</span>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 17, color: "var(--twilight)", lineHeight: 1.1 }}>{o.title}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600, marginTop: 2 }}>{o.sub}</div>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", border: "1.5px solid var(--ink)", borderRadius: 999, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", ...statusStyle[o.status] }}>
                    <span className={o.status !== "delivered" ? "kp-status-dot" : ""} style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />{o.statusLabel}
                  </span>
                </div>
                <div style={{ fontSize: 13.5, color: "var(--ink-soft)", fontWeight: 600 }}>
                  {o.date}{o.eta && <><br /><span style={{ fontSize: 11, opacity: 0.7 }}>{o.eta}</span></>}
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  {/* TODO: Phase 3 — Stripe. Wire order actions when checkout lands. */}
                  {o.actions.map(a => (
                    <button key={a.label} disabled className="kp-ord-btn" style={{ padding: "7px 14px", border: "1.5px solid var(--ink)", borderRadius: 999, background: a.prim ? "var(--twilight)" : "transparent", fontWeight: 700, fontSize: 12, color: a.prim ? "var(--cream)" : "var(--twilight)", cursor: "not-allowed", opacity: 0.55 }}>{a.label}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(24px, 2.4vw, 30px)", color: "var(--twilight)", letterSpacing: "-0.01em" }}>
              Little <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: "0.9em" }}>questions</span>
            </h2>
            <div style={{ fontSize: 13.5, color: "var(--ink-soft)", fontWeight: 600, marginTop: 4 }}>Tap any question to read the answer.</div>
          </div>
        </div>

        <div style={{ background: "var(--cream)", border: "2.5px solid var(--ink)", borderRadius: 22, boxShadow: "6px 6px 0 var(--ink)", padding: "28px 32px" }}>
          {faqs.map((f, i) => (
            <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} className={`kp-faq-item${openFaq === i ? " kp-faq-open" : ""}`} style={{ padding: "16px 0", borderBottom: i < faqs.length - 1 ? "1.5px dashed var(--paper-line)" : "none", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 17, color: "var(--twilight)", lineHeight: 1.3 }}>{f.q}</div>
                <div className="kp-faq-answer" style={{ fontSize: 14, color: "var(--ink-soft)", fontWeight: 500, lineHeight: 1.5, maxWidth: 680 }}>{f.a}</div>
              </div>
              <div className="kp-faq-toggle" style={{ fontFamily: "var(--font-caprasimo), serif", fontSize: 22, color: "var(--berry)", flexShrink: 0 }}>+</div>
            </div>
          ))}
        </div>

      </main>

      <footer style={{ maxWidth: 1400, margin: "40px auto 0", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--ink-soft)", fontWeight: 600, borderTop: "2px dashed var(--paper-line)", position: "relative", zIndex: 2 }}>
        <div>© 2026 TellTales · Sweet dreams guaranteed.</div>
        <div>
          <Link href="#" style={{ marginLeft: 20, color: "inherit", textDecoration: "none" }}>Privacy (COPPA)</Link>
          <DeleteMyDataLink style={{ marginLeft: 20 }} />
          <Link href="#" style={{ marginLeft: 20, color: "inherit", textDecoration: "none" }}>Help</Link>
        </div>
      </footer>
    </>
  );
}
