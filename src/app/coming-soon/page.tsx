import type { Metadata } from "next";
import { AmbientDecor, type DecorStar, type DecorFirefly } from "@/components/motion/AmbientDecor";
import { SiteLogo } from "@/components/site-logo";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "TellTales — Coming soon",
  description: "Personalised five-chapter bedtime adventures, launching soon. Join the waitlist.",
};

const STARS: DecorStar[] = [
  { top: "16%", left: "12%" },
  { top: "22%", left: "82%" },
  { top: "30%", left: "28%" },
  { top: "13%", left: "58%" },
  { top: "36%", left: "70%" },
  { top: "26%", left: "44%" },
];
const FIREFLIES: DecorFirefly[] = [
  { left: "18%", bottom: "28%", delay: "0s", dur: "7s" },
  { left: "50%", bottom: "16%", delay: "1.5s", dur: "8.5s" },
  { left: "80%", bottom: "24%", delay: "0.8s", dur: "7.5s" },
];

export default function ComingSoonPage() {
  return (
    <main className="cs-shell">
      <div className="u-hero-panel">
        <AmbientDecor variant="orange" meadow stars={STARS} fireflies={FIREFLIES} />
      </div>

      <div className="cs-center">
        <div className="cs-logo">
          <SiteLogo href="/" />
        </div>

        <div className="u-hero-head cs-head">
          <span className="eyebrow">
            <span className="dot" />
            Bedtime, reinvented
          </span>
          <h1 className="hero-title u-hero-title">
            Something magical is <span className="highlight">coming soon</span>.
          </h1>
          <p className="hero-sub u-hero-sub">
            Personalised five-chapter bedtime adventures around your little one —
            their name, their face, their bravery. Join the waitlist and we&apos;ll
            tell you the moment tuck-in time gets its upgrade.
          </p>
          <WaitlistForm />
        </div>
      </div>
    </main>
  );
}
