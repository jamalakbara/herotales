import { FannedCards } from "./motion/FannedCards";
import { Reveal } from "./motion/Reveal";
import { LoopVideo } from "./motion/LoopVideo";
import { cardLoop, cardPoster } from "@/lib/landing-media";

// Ordered so the accent rotation (moon → berry → sage → lilac → twilight) reads
// left-to-right across the fan, with Patience upright at the centre. Each media
// tile is a watercolor loop matching the real story art (see scripts/gen-card.ts).
const STORIES = [
  { id: "blueprint-honesty", v: "1784398584", name: "Honesty", line: "Telling it true, even when the truth is hard." },
  { id: "blueprint-bravery", v: "1784398646", name: "Bravery", line: "Facing what goes bump in the dark — and the classroom." },
  { id: "blueprint-patience", v: "1784398946", name: "Patience", line: "Waiting, watching, letting good things grow slowly." },
  { id: "blueprint-kindness", v: "1784399010", name: "Kindness", line: "Seeing the lonely friend, helping the smaller one." },
  { id: "blueprint-persistence", v: "1784399069", name: "Persistence", line: "Trying once more when it would be easier to stop." },
];

export function Blueprints() {
  return (
    <section id="stories" className="u-stories">
      <div className="u-stories-intro">
        <Reveal>
          <h2 className="u-stories-head">Stories of children who found their spark.</h2>
          <p className="u-stories-sub">
            Five gentle blueprints — bravery, honesty, patience, kindness, persistence — woven
            into an adventure your child lives as the main character.
          </p>
        </Reveal>
      </div>

      <div className="u-stories-fan">
        <Reveal>
          <FannedCards>
            {STORIES.map((s) => (
              <div key={s.name} className="u-story-card">
                <div className="u-story-media">
                  <LoopVideo
                    video={cardLoop(s.id, s.v)}
                    poster={cardPoster(s.id, s.v)}
                    className="u-hcard-video"
                  />
                  {/* Caption overlays the image — the one part of every fanned
                     card that stays visible when neighbours overlap it. */}
                  <div className="u-story-cap">
                    <div className="u-story-cap-name">{s.name}</div>
                    <p className="u-story-cap-line">{s.line}</p>
                  </div>
                </div>
              </div>
            ))}
          </FannedCards>
        </Reveal>
      </div>
    </section>
  );
}
