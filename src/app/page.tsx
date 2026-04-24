import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Blueprints } from "@/components/blueprints";
import { HowItWorks } from "@/components/how-it-works";
import { Features } from "@/components/features";
import { Quote } from "@/components/quote";
import { Pricing } from "@/components/pricing";
import { Cta } from "@/components/cta";
import { Footer } from "@/components/footer";

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Blueprints />
        <HowItWorks />
        <Features />
        <Quote />
        <Pricing />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
