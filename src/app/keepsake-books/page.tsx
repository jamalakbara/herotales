"use client";
import Link from "next/link";
import { useState, useMemo, type CSSProperties, type ReactNode } from "react";
import { AppFooter } from "@/components/app-footer";
import { BookCard } from "@/components/book-card";
import { EmptyState } from "@/components/empty-state";
import { FloatingNav } from "@/components/floating-nav";
import { HeadAccent, SectionHeader } from "@/components/section-header";
import { MobileCarousel } from "@/components/mobile-carousel";
import { AmbientDecor } from "@/components/motion/AmbientDecor";
import { FannedCards } from "@/components/motion/FannedCards";
import { PinnedPanel } from "@/components/motion/PinnedPanel";
import { PlanCard, type PlanCardProps } from "@/components/plan-card";
import { Reveal } from "@/components/motion/Reveal";
import { SkeletonBookItem } from "@/components/skeleton";
import { useFetchJson } from "@/components/use-fetch-json";
import { storyToBook, type BookView, type StoryListItem } from "@/lib/story-view";
import { BookTextIcon } from "@/components/ui/book-text";
import { ChevronDownIcon } from "@/components/ui/chevron-down";
import { ChevronUpIcon } from "@/components/ui/chevron-up";
import { SnowflakeIcon } from "@/components/ui/snowflake";
import { SendIcon } from "@/components/ui/send";
import { SparklesIcon } from "@/components/ui/sparkles";
import { ArrowRightIcon } from "@/components/ui/arrow-right";

const features: { icon: ReactNode; title: string; sub: string }[] = [
  { icon: <BookTextIcon size={20} />, title: "Linen-spined hardcover", sub: "Sturdy 8.5 × 8.5\" square, foil-pressed title, built for small hands and bedtime re-reads." },
  { icon: <SnowflakeIcon size={20} />, title: "Every chapter illustrated", sub: "Five full-page illustrations printed on thick, glossy paper. Your hero stays consistent across every spread." },
  { icon: <SendIcon size={20} />, title: "A dedication page", sub: "Add a \"For Ada, always brave — Love, Mum\" message on the inside cover. Free." },
  { icon: <SparklesIcon size={20} />, title: "Printed in 3 days, shipped in 5", sub: "Carbon-neutral print-on-demand — we wait until you order, so no books sit on a shelf." },
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
  const { data, error: loadError, loading } = useFetchJson<{ stories: StoryListItem[] }>(
    "/api/stories?status=ready&limit=20",
    "Failed to load stories",
  );

  const stories: BookView[] = useMemo(
    () => (data?.stories ?? []).slice(0, 5).map((s, i) => storyToBook(s, i)),
    [data],
  );

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
                <a href="#pick" className="btn btn-berry btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>Pick a tale <ArrowRightIcon size={14} /></a>
                <a href="#how" className="btn btn-lg" style={{ background: "rgba(251,243,227,0.12)", color: "var(--cream)" }}>See what&apos;s inside</a>
              </div>
            </div>
            {/* Book mock stack — static fan (scroll never advances inside the
                pinned panel), spring-lifts on hover */}
            <FannedCards className="kp-hero-mocks" minHeight={380} spread={0.55} staticSpread>
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

      <main className="app-main" style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 48px 80px", position: "relative", zIndex: 2 }}>

        {/* FEATURES */}
        <Reveal inView>
        <MobileCarousel id="how" className="kp-how-grid" style={{ marginBottom: 56 }}>
          {features.map((f, i) => {
            // berry/sage fold to orange in the umano skin — rotate distinct surfaces
            const featBg = ["#fff", "var(--u-orange)", "var(--twilight)", "var(--lilac)"][i];
            const isDark = i === 2;
            const isOrange = i === 1;
            const styleVars = { "--i": i } as CSSProperties;
            const titleCol = isDark ? "#fff" : isOrange ? "var(--ink-warm)" : "var(--twilight)";
            const subCol = isDark ? "rgba(251,243,227,0.8)" : isOrange ? "rgba(20,9,6,0.72)" : "var(--ink-soft)";
            return (
              <div key={i} className="kp-feat kp-feat-card kp-stagger" style={{ ...styleVars, background: featBg, borderRadius: 18, padding: 22 }}>
                <div className="kp-feat-ic" style={{ width: 44, height: 44, borderRadius: 12, background: isDark || isOrange ? "rgba(255,255,255,0.16)" : "var(--cream-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 20, color: isDark ? "var(--u-orange)" : isOrange ? "#fff" : "var(--u-orange)", marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 17, color: titleCol, lineHeight: 1.1, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: subCol, fontWeight: 600, lineHeight: 1.4 }}>{f.sub}</div>
              </div>
            );
          })}
        </MobileCarousel>
        </Reveal>

        {/* PICK A STORY */}
        <Reveal inView>
        <SectionHeader
          id="pick"
          title={<>Pick a tale to <HeadAccent>print</HeadAccent></>}
          sub="Only completed stories can be printed. Select one, then choose a binding below."
          action={<Link href="/shelf" className="btn btn-ghost btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>Browse full shelf <ArrowRightIcon size={12} /></Link>}
        />

        {loadError && (
          <div style={{ background: "var(--berry)", color: "var(--cream)", border: "2px solid var(--ink)", borderRadius: 14, padding: "12px 18px", marginBottom: 16, fontSize: 13.5, fontWeight: 700 }}>
            Could not load your library: {loadError}
          </div>
        )}

        {loading ? (
          <div className="kp-pick-grid" style={{ marginBottom: 56 }}>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonBookItem key={i} />)}
          </div>
        ) : stories.length === 0 ? (
          <EmptyState
            variant="plain"
            style={{ marginBottom: 56 }}
            title="No printable tales yet"
            sub="Finish a story first — every completed tale lands here for keepsake printing."
            cta={<Link href="/stories/new" className="btn btn-berry" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>Start a new tale <ArrowRightIcon size={14} /></Link>}
          />
        ) : (
        <div className="kp-pick-grid" style={{ marginBottom: 56 }}>
          {stories.map((s, i) => (
            <BookCard key={s.id} book={s} size="sm" index={i} onClick={() => setSelectedStory(i)} selected={selectedStory === i} />
          ))}
        </div>
        )}
        </Reveal>

        {/* PRICING */}
        <Reveal inView>
        <SectionHeader
          title={<>Choose a <HeadAccent>binding</HeadAccent></>}
          sub="All editions are printed on thick matte paper with a foil-pressed title. Prices per book."
        />
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
        <SectionHeader
          title={<>Your <HeadAccent>orders</HeadAccent></>}
          sub={orders.length === 0 ? "No keepsake orders yet — printing arrives once checkout opens." : `${orders.length} keepsake${orders.length === 1 ? "" : "s"} ordered`}
          action={
            /* TODO: Phase 3 — Stripe. Receipts download wired post-billing. */
            <button disabled title="Available once keepsake checkout opens" className="kp-cta" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, fontWeight: 800, fontSize: 13, border: "none", background: "var(--cream-deep)", color: "var(--ink)", cursor: "not-allowed", opacity: 0.5 }}>Download receipts</button>
          }
        />

        <div className="kp-orders" style={{ borderRadius: 20, overflow: "hidden", marginBottom: 56 }}>
          <div className="kp-order-cols kp-order-head" style={{ padding: "14px 22px", background: "var(--cream-deep)", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-soft)" }}>
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
              <div key={i} className="kp-order-row kp-order-cols" style={{ ...styleVars, padding: "18px 22px", borderBottom: i < orders.length - 1 ? "1.5px dashed var(--paper-line)" : "none" }}>
                <div style={{ width: 44, height: 56, background: spineBg[o.spineCls], border: "2px solid var(--ink)", borderRadius: "3px 6px 6px 3px", position: "relative", flexShrink: 0 }}>
                  <div style={{ position: "absolute", left: 4, top: 6, bottom: 6, width: 2, background: "rgba(251,243,227,0.3)" }} />
                  <span style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", color: "var(--moon)" }}><SparklesIcon size={12} /></span>
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
        <SectionHeader
          title={<>Little <HeadAccent>questions</HeadAccent></>}
          sub="Tap any question to read the answer."
        />

        <div className="kp-faq-card" style={{ borderRadius: 22, padding: "28px 32px" }}>
          {faqs.map((f, i) => (
            <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} className={`kp-faq-item${openFaq === i ? " kp-faq-open" : ""}`} style={{ padding: "16px 0", borderBottom: i < faqs.length - 1 ? "1.5px dashed var(--paper-line)" : "none", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 17, color: "var(--twilight)", lineHeight: 1.3 }}>{f.q}</div>
                <div className="kp-faq-answer" style={{ fontSize: 14, color: "var(--ink-soft)", fontWeight: 500, lineHeight: 1.5, maxWidth: 680 }}>{f.a}</div>
              </div>
              <div className="kp-faq-toggle" style={{ color: "var(--berry)", flexShrink: 0 }}>{openFaq === i ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}</div>
            </div>
          ))}
        </div>
        </Reveal>

      </main>

      <AppFooter />
    </>
  );
}
