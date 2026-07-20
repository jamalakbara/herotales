import { FloatingNav } from "@/components/floating-nav";
import { RevealMain } from "@/components/motion/RevealMain";
import { Hero } from "@/components/hero";
import { Statement } from "@/components/statement";
import { FeatureTrack } from "@/components/feature-track";
import { Blueprints } from "@/components/blueprints";
import { Pricing } from "@/components/pricing";
import { Faq } from "@/components/faq";
import { Footer } from "@/components/footer";

export default function LandingPage() {
  return (
    <>
      <FloatingNav variant="marketing" />
      <RevealMain>
        <Hero />
        <Statement />
        <FeatureTrack />
        <Blueprints />
        <Pricing />
        <Faq />
      </RevealMain>
      {/* Fixed behind the content — revealed as the page scrolls past the FAQ. */}
      <div className="u-footer-reveal">
        <Footer />
      </div>
    </>
  );
}
