import { FloatingNav } from "@/components/floating-nav";
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
      <main>
        <Hero />
        <Statement />
        <FeatureTrack />
        <Blueprints />
        <section id="pricing">
          <Pricing />
        </section>
        <Faq />
      </main>
      <Footer />
    </>
  );
}
