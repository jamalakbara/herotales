import { FeatureZoom, type FeatureCard } from "./motion/FeatureZoom";
import { Reveal } from "./motion/Reveal";
import { cardLoop, cardPoster } from "@/lib/landing-media";

// Seamless-loop card art — Seedream still → Seedance i2v → Cloudinary boomerang
// so the loop has no cut frame. See scripts/gen-card.ts. URLs from landing-media.
const CARDS: FeatureCard[] = [
  {
    icon: "①",
    title: "Meet the hero",
    desc: "Name, age, a photo or a few words. Their character stays consistent — same curls, same brave eyes — across every chapter.",
    tint: "var(--moon)",
    video: cardLoop("card-meet-hero", "1784394621"),
    poster: cardPoster("card-meet-hero", "1784394621"),
  },
  {
    icon: "②",
    title: "Pick tonight's lesson",
    desc: "Bravery for the first sleepover. Patience for waiting on the new baby. Choose one of five gentle blueprints.",
    tint: "var(--berry)",
    video: cardLoop("card-pick-lesson", "1784396872"),
    poster: cardPoster("card-pick-lesson", "1784396872"),
  },
  {
    icon: "✦",
    title: "One consistent face",
    desc: "Character-consistency magic keeps your little hero looking like themselves in every illustration — the same freckles, the same chin.",
    tint: "var(--sage)",
    video: cardLoop("card-consistent-face", "1784397172"),
    poster: cardPoster("card-consistent-face", "1784397172"),
  },
  {
    icon: "♪",
    title: "Warm voice, soft eyelids",
    desc: "Every story arrives with a storyteller's narration — warm, unhurried, tuned to send wiggly listeners gently off to sleep.",
    tint: "var(--lilac)",
    video: cardLoop("card-warm-voice", "1784397664"),
    poster: cardPoster("card-warm-voice", "1784397664"),
  },
  {
    icon: "❑",
    title: "A real hardcover keepsake",
    desc: "Turn any favourite tale into a linen-spined, glossy-page book. Printed on demand, shipped to your door, kept forever.",
    tint: "var(--twilight)",
    video: cardLoop("card-keepsake", "1784397810"),
    poster: cardPoster("card-keepsake", "1784397810"),
  },
];

export function FeatureTrack() {
  return (
    <FeatureZoom
      cards={CARDS}
      head={
        <Reveal>
          <span className="section-kicker">How bedtime becomes magic</span>
          <h2 className="section-title">Three minutes to craft. A lifetime to remember.</h2>
        </Reveal>
      }
    />
  );
}
