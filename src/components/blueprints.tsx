import { FannedCards } from "./motion/FannedCards";
import { Reveal } from "./motion/Reveal";

const STORIES = [
  { icon: "★", name: "Bravery", line: "Facing what goes bump in the dark — and the classroom.", scene: "var(--berry)" },
  { icon: "⟲", name: "Patience", line: "Waiting, watching, letting good things grow slowly.", scene: "var(--sage)" },
  { icon: "♡", name: "Kindness", line: "Seeing the lonely friend, helping the smaller one.", scene: "var(--lilac)" },
];

export function Blueprints() {
  return (
    <section id="stories" className="u-stories">
      <Reveal>
        <h2 className="u-stories-head">Stories of children who found their spark.</h2>
        <p style={{ textAlign: "center", color: "rgba(251,243,227,0.78)", maxWidth: 560, margin: "0 auto 8px", fontSize: 16 }}>
          Five gentle blueprints — bravery, honesty, patience, kindness, persistence — woven
          into an adventure your child lives as the main character.
        </p>
      </Reveal>

      <FannedCards>
        {STORIES.map((s) => (
          <div key={s.name} className="u-story-card">
            <div
              style={{
                height: 120,
                borderRadius: 14,
                border: "2px solid var(--ink)",
                background: `linear-gradient(160deg, ${s.scene}, var(--twilight-deep))`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                color: "var(--cream)",
                marginBottom: 16,
              }}
            >
              {s.icon}
            </div>
            <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 22, color: "var(--cream)" }}>
              {s.name}
            </div>
            <p style={{ fontSize: 13.5, color: "rgba(251,243,227,0.7)", margin: "8px 0 16px", lineHeight: 1.5 }}>
              {s.line}
            </p>
            <span className="u-story-ribbon">Read this tale →</span>
          </div>
        ))}
      </FannedCards>
    </section>
  );
}
