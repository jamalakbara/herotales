import { StoryPreview } from "./story-preview";

const STEPS = [
  {
    title: "Meet the hero",
    desc: "Tell us their name, age, and a few details. Their character stays consistent — same curls, same brave eyes — across every chapter.",
  },
  {
    title: "Pick tonight's lesson",
    desc: "Bravery for the first sleepover. Patience for waiting for the new baby. Choose one of five gentle blueprints.",
  },
  {
    title: "Watch the pages appear",
    desc: "Five hand-illustrated chapters, ready in under a minute. Read together, or press play and listen.",
  },
  {
    title: "Keep the ones you love",
    desc: "Save favorites to your shelf. Order any story as a real, hardcover keepsake book — printed and shipped.",
  },
];

export function HowItWorks() {
  return (
    <section id="how">
      <div className="how">
        <div>
          <span className="section-kicker">How bedtime becomes magic</span>
          <h2 className="section-title">
            Three minutes to craft. A lifetime to remember.
          </h2>
          <p className="section-sub">
            No writing. No subscriptions to streaming apps. Just a handful of
            taps, and the story appears — read aloud in a voice built to be
            listened to under covers.
          </p>

          <div className="steps">
            {STEPS.map((step, i) => (
              <div key={step.title} className="step">
                <div className="step-num">{i + 1}</div>
                <div>
                  <div className="step-title">{step.title}</div>
                  <div className="step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <StoryPreview />
      </div>
    </section>
  );
}
