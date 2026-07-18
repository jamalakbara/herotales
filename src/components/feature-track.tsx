import { HorizontalScroll } from "./motion/HorizontalScroll";
import { Reveal } from "./motion/Reveal";

const CARDS = [
  {
    icon: "①",
    title: "Meet the hero",
    desc: "Name, age, a photo or a few words. Their character stays consistent — same curls, same brave eyes — across every chapter.",
    tint: "var(--moon)",
  },
  {
    icon: "②",
    title: "Pick tonight's lesson",
    desc: "Bravery for the first sleepover. Patience for waiting on the new baby. Choose one of five gentle blueprints.",
    tint: "var(--berry)",
  },
  {
    icon: "✦",
    title: "One consistent face",
    desc: "Character-consistency magic keeps your little hero looking like themselves in every illustration — the same freckles, the same chin.",
    tint: "var(--sage)",
  },
  {
    icon: "♪",
    title: "Warm voice, soft eyelids",
    desc: "Every story arrives with a storyteller's narration — warm, unhurried, tuned to send wiggly listeners gently off to sleep.",
    tint: "var(--lilac)",
  },
  {
    icon: "❑",
    title: "A real hardcover keepsake",
    desc: "Turn any favourite tale into a linen-spined, glossy-page book. Printed on demand, shipped to your door, kept forever.",
    tint: "var(--twilight)",
  },
];

export function FeatureTrack() {
  return (
    <section id="how">
      <div className="u-track-head">
        <Reveal>
          <span className="section-kicker">How bedtime becomes magic</span>
          <h2 className="section-title">Three minutes to craft. A lifetime to remember.</h2>
        </Reveal>
      </div>

      <HorizontalScroll>
        {CARDS.map((c) => (
          <div key={c.title} className="u-hcard">
            <div className="u-hcard-media">
              <span style={{ fontSize: 68, color: c.tint }}>{c.icon}</span>
            </div>
            <div className="u-hcard-title">
              <span style={{ color: c.tint, fontSize: 20 }}>{c.icon}</span>
              {c.title}
            </div>
            <p className="u-hcard-desc">{c.desc}</p>
          </div>
        ))}
      </HorizontalScroll>
    </section>
  );
}
