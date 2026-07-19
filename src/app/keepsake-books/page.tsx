"use client";
import Link from "next/link";
import { useState, useEffect, useMemo, CSSProperties } from "react";
import { AppFooter } from "@/components/app-footer";
import { BookCover, coverAccent, type CoverAccent } from "@/components/book-cover";
import { FloatingNav } from "@/components/floating-nav";
import { AmbientDecor } from "@/components/motion/AmbientDecor";
import { FannedCards } from "@/components/motion/FannedCards";
import { PinnedPanel } from "@/components/motion/PinnedPanel";
import { PlanCard, type PlanCardProps } from "@/components/plan-card";
import { Reveal } from "@/components/motion/Reveal";
import { SkeletonBookItem } from "@/components/skeleton";

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

// TODO: Phase 3 — Stripe checkout. Wire CTAs to /api/stripe/checkout once subscription/keepsake billing lands.
const bindingPlans: Omit<PlanCardProps, "featured" | "onSelect">[] = [
  {
    name: "Softcover",
    price: "$18",
    per: " / book",
    tag: "Lovely, light, and great for grandparents' coffee tables.",
    feats: ["8.5 × 8.5\" square", "Perfect-bound softcover", "Free dedication page", "5–7 day shipping"],
    cta: { label: "Choose softcover (soon)", disabled: true, title: "Keepsake printing coming soon" },
  },
  {
    name: "Hardcover keepsake",
    price: "$32",
    per: " / book",
    tag: "The bedtime-shelf classic. Linen spine, foil title.",
    feats: [
      "Linen-wrapped hardcover",
      "Gold-foil pressed title",
      "Glossy illustration pages",
      "Free dedication page",
      <>Lantern plan: <strong>20% off</strong></>,
    ],
    badge: "Most loved",
    cta: { label: "Choose hardcover (soon)", disabled: true, title: "Keepsake printing coming soon", variant: "berry" },
  },
  {
    name: "Collector's box",
    price: "$98",
    per: " / 3 books",
    tag: "Three hardcovers in a linen-covered slipcase.",
    feats: ["Three linen hardcovers", "Matching slipcase", "Mix & match any titles", "Engraved spine numbers"],
    cta: { label: "Build a collection (soon)", disabled: true, title: "Keepsake printing coming soon" },
  },
];

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
  const [loading, setLoading] = useState(true);
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
      } finally {
        if (alive) setLoading(false);
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
      <FloatingNav variant="app" />

      {/* HERO — full-bleed pinned panel, scales/rounds on scroll like the landing FAQ */}
      <div className="kp-hero-tuck">
        <PinnedPanel className="kp-hero u-dark-section" pinnedClassName="kp-hero-panel" stickyClassName="kp-hero-sticky">
          <AmbientDecor variant="dark" />
          <div className="u-dark-inner kp-hero-inner">
            <div style={{ position: "relative" }}>
              <span className="kp-hero-kicker" style={{ fontFamily: "var(--font-caprasimo), serif", fontSize: 16, color: "var(--u-orange)", marginBottom: 10, transform: "rotate(-1deg)", display: "inline-block" }}>Printed with care</span>
              <h1 className="kp-hero-fade kp-hero-fade-d1" style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(38px, 4.4vw, 60px)", lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 18 }}>
                Turn tonight&apos;s tale into a <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--u-orange)" }}>real, hardcover</span> keepsake.
              </h1>
              <p className="kp-hero-fade kp-hero-fade-d2" style={{ fontSize: 17, color: "rgba(251,243,227,0.82)", maxWidth: 480, lineHeight: 1.5, fontWeight: 500, marginBottom: 28 }}>Any story on your shelf becomes a linen-spined, glossy-page book — printed on demand, shipped to your door in 5–7 days, and kept on their shelf forever.</p>
              <div className="kp-hero-fade kp-hero-fade-d3" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href="#pick" className="btn btn-berry btn-lg">Pick a tale →</a>
                <a href="#how" className="btn btn-lg" style={{ background: "rgba(251,243,227,0.12)", color: "var(--cream)" }}>See what&apos;s inside</a>
              </div>
            </div>
            {/* Book mock stack — fans out on scroll, spring-lifts on hover */}
            <FannedCards className="kp-hero-mocks" minHeight={380} spread={0.55}>
              {[
                { bg: "var(--u-orange)", col: "#fff", lbl: "Chapter 1", title: "Ada & the", script: "Honest Fox", scriptCol: "#fff", meta: "Honesty", star: "✦", d: "0s" },
                { bg: "var(--cream)", col: "var(--twilight)", lbl: "Keepsake edition", title: "The Smallest", script: "Friend at School", scriptCol: "var(--u-orange)", meta: "Kindness · hardcover", star: "♡", d: "-2.3s" },
                { bg: "var(--twilight)", col: "var(--cream)", lbl: "Linen spine", title: "The Garden That", script: "Grew Slowly", scriptCol: "var(--u-orange)", meta: "Patience", star: "☾", d: "-4.6s" },
              ].map((bm, i) => {
                const wrapVars = { "--d": bm.d } as CSSProperties;
                return (
                  <div key={i} className="kp-book-inner" style={{ ...wrapVars, border: "2.5px solid var(--ink)", borderRadius: "4px 14px 14px 4px", boxShadow: i === 1 ? "10px 10px 0 var(--ink)" : "8px 8px 0 var(--ink)", padding: "24px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: bm.bg, color: bm.col, position: "relative" }}>
                    <div style={{ position: "absolute", left: 8, top: 16, bottom: 16, width: 4, background: bm.bg === "var(--cream)" ? "rgba(28,21,64,0.15)" : "rgba(255,255,255,0.25)", borderRadius: 2 }} />
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>{bm.lbl}</div>
                      <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 22, lineHeight: 1.05, marginTop: 8 }}>
                        {bm.title}
                        <span style={{ fontFamily: "var(--font-caprasimo), serif", display: "block", fontSize: 20, color: bm.scriptCol }}>{bm.script}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <span>{bm.meta}</span>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: bm.bg === "var(--cream)" ? "rgba(28,21,64,0.1)" : "rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 16 }}>{bm.star}</div>
                    </div>
                  </div>
                );
              })}
            </FannedCards>
          </div>
        </PinnedPanel>
      </div>

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 48px 80px", position: "relative", zIndex: 2 }}>

        {/* FEATURES */}
        <Reveal inView>
        <div id="how" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 56 }}>
          {features.map((f, i) => {
            // berry/sage fold to orange in the umano skin — rotate distinct surfaces
            const featBg = ["#fff", "var(--u-orange)", "var(--twilight)", "var(--lilac)"][i];
            const isDark = i === 2;
            const isOrange = i === 1;
            const styleVars = { "--i": i } as CSSProperties;
            const titleCol = isDark ? "#fff" : isOrange ? "#140906" : "var(--twilight)";
            const subCol = isDark ? "rgba(251,243,227,0.8)" : isOrange ? "rgba(20,9,6,0.72)" : "var(--ink-soft)";
            return (
              <div key={i} className="kp-feat kp-stagger" style={{ ...styleVars, background: featBg, borderRadius: 18, boxShadow: "var(--u-card-shadow)", padding: 22 }}>
                <div className="kp-feat-ic" style={{ width: 44, height: 44, borderRadius: 12, background: isDark || isOrange ? "rgba(255,255,255,0.16)" : "var(--cream-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 20, color: isDark ? "var(--u-orange)" : isOrange ? "#fff" : "var(--u-orange)", marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 17, color: titleCol, lineHeight: 1.1, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: subCol, fontWeight: 600, lineHeight: 1.4 }}>{f.sub}</div>
              </div>
            );
          })}
        </div>
        </Reveal>

        {/* PICK A STORY */}
        <Reveal inView>
        <div id="pick" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(24px, 2.4vw, 30px)", color: "var(--twilight)", letterSpacing: "-0.01em" }}>
              Pick a tale to <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: "0.9em" }}>print</span>
            </h2>
            <div style={{ fontSize: 13.5, color: "var(--ink-soft)", fontWeight: 600, marginTop: 4 }}>Only completed stories can be printed. Select one, then choose a binding below.</div>
          </div>
          <Link href="/shelf" className="btn btn-ghost" style={{ fontSize: 13, padding: "8px 16px" }}>Browse full shelf →</Link>
        </div>

        {loadError && (
          <div style={{ background: "var(--berry)", color: "var(--cream)", border: "2px solid var(--ink)", borderRadius: 14, padding: "12px 18px", marginBottom: 16, fontSize: 13.5, fontWeight: 700 }}>
            Could not load your library: {loadError}
          </div>
        )}

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18, background: "var(--cream-deep)", borderRadius: 20, boxShadow: "var(--u-card-shadow)", padding: 22, marginBottom: 56 }}>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonBookItem key={i} />)}
          </div>
        ) : stories.length === 0 ? (
          <div style={{ background: "var(--cream-deep)", borderRadius: 20, boxShadow: "var(--u-card-shadow)", padding: 36, marginBottom: 56, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 22, color: "var(--twilight)", marginBottom: 6 }}>No printable tales yet</div>
            <div style={{ fontSize: 14, color: "var(--ink-soft)", fontWeight: 600, marginBottom: 18 }}>Finish a story first — every completed tale lands here for keepsake printing.</div>
            <Link href="/stories/new" className="btn btn-berry">
              Start a new tale →
            </Link>
          </div>
        ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18, background: "var(--cream-deep)", borderRadius: 20, boxShadow: "var(--u-card-shadow)", padding: 22, marginBottom: 56 }}>
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
                    <div className="kp-pick-check" style={{ position: "absolute", top: -10, right: -10, width: 34, height: 34, borderRadius: "50%", background: "var(--u-orange)", boxShadow: "0 8px 24px rgba(255,105,46,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 16, color: "#fff", zIndex: 3 }}>✓</div>
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
        </Reveal>

        {/* PRICING */}
        <Reveal inView>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(24px, 2.4vw, 30px)", color: "var(--twilight)", letterSpacing: "-0.01em" }}>
              Choose a <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: "0.9em" }}>binding</span>
            </h2>
            <div style={{ fontSize: 13.5, color: "var(--ink-soft)", fontWeight: 600, marginTop: 4 }}>All editions are printed on thick matte paper with a foil-pressed title. Prices per book.</div>
          </div>
        </div>
        </Reveal>

        <div className="pricing-grid" style={{ marginBottom: 56 }}>
          {bindingPlans.map((plan, i) => (
            <Reveal key={plan.name} inView index={i} delay={0.1} y={32} className="plan-wrap">
              <PlanCard {...plan} featured={featuredPlan === i} onSelect={() => setFeaturedPlan(i)} />
            </Reveal>
          ))}
        </div>

        {/* ORDERS */}
        <Reveal inView>
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
          <button disabled title="Available once keepsake checkout opens" className="kp-cta" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, fontWeight: 800, fontSize: 13, border: "none", background: "var(--cream-deep)", color: "var(--ink)", cursor: "not-allowed", opacity: 0.5 }}>Download receipts</button>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "var(--u-card-shadow)", overflow: "hidden", marginBottom: 56 }}>
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
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", ...statusStyle[o.status] }}>
                    <span className={o.status !== "delivered" ? "kp-status-dot" : ""} style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />{o.statusLabel}
                  </span>
                </div>
                <div style={{ fontSize: 13.5, color: "var(--ink-soft)", fontWeight: 600 }}>
                  {o.date}{o.eta && <><br /><span style={{ fontSize: 11, opacity: 0.7 }}>{o.eta}</span></>}
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  {/* TODO: Phase 3 — Stripe. Wire order actions when checkout lands. */}
                  {o.actions.map(a => (
                    <button key={a.label} disabled className="kp-ord-btn" style={{ padding: "7px 14px", border: "none", borderRadius: 999, background: a.prim ? "var(--ink)" : "var(--cream-deep)", fontWeight: 700, fontSize: 12, color: a.prim ? "#fff" : "var(--twilight)", cursor: "not-allowed", opacity: 0.55 }}>{a.label}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        </Reveal>

        {/* FAQ */}
        <Reveal inView>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(24px, 2.4vw, 30px)", color: "var(--twilight)", letterSpacing: "-0.01em" }}>
              Little <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)", fontSize: "0.9em" }}>questions</span>
            </h2>
            <div style={{ fontSize: 13.5, color: "var(--ink-soft)", fontWeight: 600, marginTop: 4 }}>Tap any question to read the answer.</div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 22, boxShadow: "var(--u-card-shadow)", padding: "28px 32px" }}>
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
        </Reveal>

      </main>

      <AppFooter />
    </>
  );
}
