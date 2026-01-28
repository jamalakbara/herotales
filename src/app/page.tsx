import HeroScrollAnimation from "@/components/hero-scroll-animation";
import HeroOverlay from "@/components/hero-overlay";
import FeaturesSection from "@/components/features-section";
import HowItWorksSection from "@/components/how-it-works-section";
import SafetySection from "@/components/safety-section";
import CallToActionSection from "@/components/call-to-action-section";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-soft">
      <Navbar />

      {/* Hero Section */}
      <section className="relative">
        <HeroScrollAnimation />

        {/* Overlay Content - Positioned absolutely over the sticky canvas area */}
        <div className="absolute top-0 left-0 w-full h-screen flex flex-col items-center justify-center text-center pointer-events-none z-10 p-4">
          <HeroOverlay />

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
            <span className="text-xs uppercase tracking-widest mb-2 block">Scroll to Explore</span>
          </div>
        </div>
      </section>

      <FeaturesSection />

      <HowItWorksSection />

      <SafetySection />

      <CallToActionSection />

      <Footer />
    </div>
  );
}
