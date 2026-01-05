import Link from "next/link";
import { Sparkles, BookOpen, Shield, Palette, Heart, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-soft">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-periwinkle flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl">HeroTales</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="rounded-xl">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="btn-magic rounded-xl px-6">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Personalized Stories
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Bedtime Stories Where{" "}
            <span className="text-gradient">Your Child is the Hero</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Create magical, personalized stories that teach values like bravery,
            kindness, and honesty. Each story features your child as the main
            character with beautiful AI-generated illustrations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button className="btn-magic h-14 px-8 text-lg rounded-2xl">
                Start Creating Stories
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" className="h-14 px-8 text-lg rounded-2xl">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Stories That Spark{" "}
              <span className="text-gradient">Imagination & Values</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every story is uniquely crafted for your child, teaching important
              life lessons through adventure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-card text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-periwinkle mb-4">
                <Palette className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Personalized Characters</h3>
              <p className="text-muted-foreground">
                Describe your child&apos;s appearance and watch them come to life in
                beautiful AI-generated illustrations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-sage mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">5 Value Blueprints</h3>
              <p className="text-muted-foreground">
                Choose from Bravery, Honesty, Patience, Kindness, or Persistence
                for meaningful stories.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-coral mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Reader Mode Magic</h3>
              <p className="text-muted-foreground">
                Distraction-free reading with beautiful page-flip animations and
                celebration effects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Create a Story in{" "}
              <span className="text-gradient">3 Simple Steps</span>
            </h2>
          </div>

          <div className="space-y-8">
            {[
              {
                step: 1,
                title: "Add Your Child's Profile",
                description:
                  "Enter their nickname, age, and describe their appearance for consistent illustrations.",
              },
              {
                step: 2,
                title: "Choose Today's Lesson",
                description:
                  "Pick from 5 value blueprints: Bravery, Honesty, Patience, Kindness, or Persistence.",
              },
              {
                step: 3,
                title: "Watch the Magic Happen",
                description:
                  "Our AI creates a unique 5-chapter story with beautiful illustrations in minutes.",
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-6">
                <div className="shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sage mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              COPPA Compliant & Safe
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We take your child&apos;s privacy seriously. HeroTales is designed with
              safety in mind.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
              {[
                "Only nicknames, never real names",
                "You can delete all data anytime",
                "No data shared with third parties",
                "Parental gate for reader mode",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-sage shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Create Your First Story?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join parents who are making bedtime magical with personalized stories.
          </p>
          <Link href="/signup">
            <Button className="btn-magic h-16 px-12 text-xl rounded-2xl">
              <Sparkles className="mr-2 h-6 w-6" />
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-periwinkle flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading font-bold">HeroTales</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} HeroTales AI. Made with ❤️ for parents
            and kids.
          </p>
        </div>
      </footer>
    </div>
  );
}
