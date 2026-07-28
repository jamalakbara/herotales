import { PlanCard, type PlanCardProps } from "./plan-card";
import { Reveal } from "./motion/Reveal";

const PLANS: PlanCardProps[] = [
  {
    name: "Firefly",
    price: "Free",
    per: " / forever",
    tag: "For trying us out tonight.",
    feats: [
      "1 story per month",
      "All 5 value blueprints",
      "Read-along illustrations",
      "Save up to 3 favorites",
    ],
    cta: { label: "Start free", href: "#" },
  },
  {
    name: "Lantern",
    price: "$9",
    per: " / month",
    tag: "The nightly bedtime habit.",
    feats: [
      "Unlimited stories",
      "Warm-voice audio narration",
      "Up to 3 child heroes",
      "Unlimited saved favorites",
      "20% off printed keepsake books",
    ],
    badge: "Most loved",
    featured: true,
    cta: { label: "Start 7 days free", href: "#", variant: "berry" },
  },
  {
    name: "Constellation",
    price: "$18",
    per: " / month",
    tag: "For bigger families & grandparents.",
    feats: [
      "Everything in Lantern",
      "Up to 8 child heroes",
      "Voice cloning for family narrators",
      "1 free keepsake book / month",
      "Priority story generation",
    ],
    cta: { label: "Choose Constellation", href: "#" },
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="u-dark-section">
      <div className="u-dark-inner">
        <Reveal inView>
          <span className="section-kicker">Pick your shelf</span>
          <h2 className="section-title">Simple pricing. Unlimited bedtimes.</h2>
          <p className="section-sub">
            Cancel whenever. The stories you&apos;ve made are always yours to keep.
          </p>
        </Reveal>

        <div className="pricing-grid">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} inView index={i} delay={0.1} y={32} className="plan-wrap">
              <PlanCard {...plan} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
