"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type Chapter = {
  label: string;
  title: string;
  caption: string;
  chip: string;
  paras: string[];
};

const CHAPTERS: Chapter[] = [
  {
    label: "Chapter 1 — Before the woods",
    title: "The night lantern",
    caption: "[ ILLUSTRATION · CH.1 · GRANDMOTHER'S HANDS AROUND THE LANTERN ]",
    chip: "Chapter 1",
    paras: [
      "On the evening Maya turned five-and-a-half, her grandmother put a small brass lantern into her hands and said, \"This is for the nights that feel a little too big.\"",
      "The lantern was heavy in the way that important things are heavy. Maya turned it over once, twice. Inside, a flame the size of a walnut wobbled gently, as if it was also a little bit nervous.",
      "\"Will it always stay lit?\" Maya whispered.",
      "\"Only if you keep walking,\" her grandmother said. And then she kissed the top of her head and opened the garden gate.",
    ],
  },
  {
    label: "Chapter 2 — The little light",
    title: "Into the Whispering Woods",
    caption: "[ ILLUSTRATION · CH.2 · MAYA AT THE WOODS' EDGE ]",
    chip: "Chapter 2",
    paras: [
      "The path through the Whispering Woods was darker than <strong>Maya</strong> expected. But in her small hand, the lantern her grandmother had given her glowed a steady, stubborn gold — the kind of gold that doesn't shout, only says <em>I am here, I am here, I am here</em>.",
      "Maya took one step. Then another. Somewhere, very far away, an owl said hello to the moon. The stuffed fox in her backpack — his name was Pip — peeked out to see what was happening.",
      "\"You carry a warm little sun,\" Pip seemed to say. And Maya, for the first time all evening, smiled a small private smile. Being scared and being brave, she was discovering, could happen at the very same time.",
    ],
  },
  {
    label: "Chapter 3 — A whisper in the dark",
    title: "Something in the ferns",
    caption: "[ ILLUSTRATION · CH.3 · FERNS RUSTLING, EYES IN THE DARK ]",
    chip: "Chapter 3",
    paras: [
      "Something rustled beyond the ferns. Maya froze. Pip froze. Even the lantern seemed to hold its little breath.",
      "But Maya remembered what her grandmother had said: <em>Only if you keep walking</em>. So she held the lantern a little higher — not because she wasn't scared, but because sometimes holding your light higher is the same as being brave.",
      "Two eyes blinked in the dark. They were not scary eyes, it turned out. They were <strong>kind eyes</strong>.",
    ],
  },
  {
    label: "Chapter 4 — The owl with kind eyes",
    title: "A friend in the canopy",
    caption: "[ ILLUSTRATION · CH.4 · OWL PERCHED ABOVE MAYA ]",
    chip: "Chapter 4",
    paras: [
      "The owl tilted his head. \"You carry a warm little sun,\" he said softly, almost the same as Pip had. \"Where are you going with it?\"",
      "\"Home,\" said Maya. And then, because being honest and being brave are first cousins, she added: \"But I don't quite know the way.\"",
      "The owl smiled the slow smile of someone who has been lost many times. \"Then follow the brightest star,\" he said. \"It will walk you there.\"",
    ],
  },
  {
    label: "Chapter 5 — Home by lantern light",
    title: "The porch light waiting",
    caption: "[ ILLUSTRATION · CH.5 · MAYA AT THE GARDEN GATE, GRANDMOTHER SMILING ]",
    chip: "Chapter 5",
    paras: [
      "When Maya stepped out of the woods, the garden gate was open, and a porch light was burning — a bigger, older cousin of the little lantern in her hand.",
      "Her grandmother was already standing there, the way grandmothers always somehow are. \"Well?\" she said. \"Was the night a little too big?\"",
      "\"It was,\" said Maya, climbing into her arms. \"But I kept walking.\"",
      "And her grandmother nodded, as if she'd known it all along. Because, of course, she had.",
    ],
  },
];

const SPEEDS = ["0.75×", "1×", "1.25×", "1.5×"];
const FILL_PCTS = [10, 32, 58, 74, 96];
const TIMES = ["0:14", "0:47", "1:23", "1:46", "2:18"];
const TOTAL = "2:24";

const STAR_POSITIONS: Array<React.CSSProperties> = [
  { top: 50, left: 60, width: 6, height: 6, animationDelay: "0s" },
  { top: 90, left: 130, width: 4, height: 4, animationDelay: "0.6s" },
  { top: 130, left: 50, width: 5, height: 5, animationDelay: "1.1s" },
  { top: 70, right: 40, width: 4, height: 4, animationDelay: "1.4s" },
  { top: 180, right: 110, width: 5, height: 5, animationDelay: "0.3s" },
  { top: 220, left: 100, width: 3, height: 3, animationDelay: "1.8s" },
];

export default function StoryReaderPage() {
  const params = useSearchParams();
  const heroName = params.get("name") || "Maya";
  const heroAge = params.get("age") || "5";
  const blueprint = params.get("blueprint") || "Bravery";
  const lengthLabel = params.get("length") || "Bedtime";
  const voice = params.get("voice") || "Juniper";
  const lengthMap: Record<string, string> = {
    Shortie: "5 min",
    Bedtime: "12 min",
    "Long tale": "20 min",
  };
  const readMins = lengthMap[lengthLabel] ?? "12 min";

  const [cur, setCur] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [spIdx, setSpIdx] = useState(1);
  const [fillPct, setFillPct] = useState(FILL_PCTS[1]);
  const [saved, setSaved] = useState(false);

  const chapter = CHAPTERS[cur];
  const prevIdx = cur > 0 ? cur - 1 : null;
  const nextIdx = cur < CHAPTERS.length - 1 ? cur + 1 : null;

  const voiceDesc = useMemo(() => {
    const map: Record<string, string> = {
      Juniper: "Warm, unhurried · ElevenLabs narration",
      Atlas: "Soft grandfather · ElevenLabs narration",
      Wren: "Bright, theatrical · ElevenLabs narration",
      "My voice": "Your voice · ElevenLabs clone",
    };
    return map[voice] ?? "Warm, unhurried · ElevenLabs narration";
  }, [voice]);

  function render(i: number) {
    setCur(i);
    setFillPct(FILL_PCTS[i]);
  }

  function onProgClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setFillPct(Math.max(0, Math.min(100, pct)));
  }

  const heroTitle = `${heroName} & the Brave Lantern`;

  return (
    <>
      <header>
        <nav className="nav">
          <Link href="/" className="logo">
            <div className="logo-mark" />
            TellTales
          </Link>
          <div className="nav-crumbs">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <Link href="/stories/new">New story</Link>
            <span className="sep">/</span>
            <span className="cur">{heroTitle}</span>
          </div>
          <a
            href="#"
            className="btn"
            style={{ padding: "10px 18px", fontSize: 13.5 }}
          >
            Save to shelf ♡
          </a>
        </nav>
      </header>

      <main className="page">
        <div className="gen-banner">
          <span className="check">✓</span>
          <span>Your story is ready.</span>
          <span className="time">· conjured in 38 seconds</span>
        </div>

        <div className="progress-row">
          <div>
            <span className="page-kicker">Tonight&apos;s tale</span>
            <h1 className="story-title">
              {heroName} &amp; the{" "}
              <span className="script-em">Brave Lantern</span>
            </h1>
          </div>
          <div className="progress-pill">
            <span className="lbl">Step 2 of 2</span>
            <div className="dots">
              <span className="done" />
              <span className="cur" />
            </div>
            <span style={{ opacity: 0.7 }}>Read or listen</span>
          </div>
        </div>

        <div className="reader">
          {/* LEFT: ILLUSTRATION */}
          <div className="illus-col">
            <div className="illus">
              <div className="tag-chap">{chapter.chip}</div>
              <div className="tag-ai">AI · CHARACTER-CONSISTENT</div>
              <div className="moon-big" />
              {STAR_POSITIONS.map((s, i) => (
                <div key={i} className="star" style={s} />
              ))}
              <div className="tree" style={{ left: "12%" }} />
              <div
                className="tree"
                style={{
                  left: "78%",
                  borderBottomWidth: 70,
                  borderLeftWidth: 20,
                  borderRightWidth: 20,
                }}
              />
              <div
                className="tree"
                style={{
                  left: "28%",
                  bottom: "24%",
                  borderBottomWidth: 48,
                  borderLeftWidth: 14,
                  borderRightWidth: 14,
                  opacity: 0.7,
                }}
              />
              <div className="mountain" />
              <div className="hero-silhouette">
                <div className="head" />
                <div className="body" />
              </div>
              <div className="lantern" />
              <div className="caption-strip">{chapter.caption}</div>
            </div>

            <div className="illus-thumbs">
              {CHAPTERS.map((_, i) => (
                <div
                  key={i}
                  className={`thumb ch${i + 1}${cur === i ? " active" : ""}`}
                  onClick={() => render(i)}
                >
                  <span className="num">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: STORY TEXT */}
          <div className="story-col">
            <div className="story-head">
              <div className="chip-row">
                <span className="chip berry">{blueprint}</span>
                <span className="chip moon">
                  For {heroName} · {heroAge}
                </span>
                <span className="chip">{readMins} read</span>
              </div>
              <div className="head-actions">
                <div
                  className={`icon-btn${saved ? " active" : ""}`}
                  title="Save"
                  onClick={() => setSaved((v) => !v)}
                >
                  ♡
                </div>
                <div className="icon-btn" title="Print">
                  ⎙
                </div>
                <div className="icon-btn" title="Share">
                  ↗
                </div>
              </div>
            </div>

            <span className="chap-label">{chapter.label}</span>
            <h2 className="chap-title">{chapter.title}</h2>

            <div
              className="story-text"
              key={cur}
              dangerouslySetInnerHTML={{
                __html: chapter.paras.map((p) => `<p>${p}</p>`).join(""),
              }}
            />

            {/* AUDIO BAR */}
            <div className="audio-bar">
              <div
                className={`play-btn${playing ? " playing" : ""}`}
                onClick={() => setPlaying((v) => !v)}
              >
                <div className="play-tri" />
              </div>
              <div className="audio-meta">
                <div className="audio-title">
                  Read to {heroName} — {voice}&apos;s voice
                </div>
                <div className="audio-sub">{voiceDesc}</div>
                <div className="audio-prog" onClick={onProgClick}>
                  <div
                    className="fill"
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
                <div className="audio-time">
                  <span>{TIMES[cur]}</span>
                  <span>{TOTAL}</span>
                </div>
              </div>
              <div className="audio-tools">
                <div
                  className="speed-pill"
                  onClick={() => setSpIdx((i) => (i + 1) % SPEEDS.length)}
                >
                  {SPEEDS[spIdx]}
                </div>
                <div className="speed-pill" title="Sleep timer">
                  ⏾ 20m
                </div>
              </div>
            </div>

            {/* CHAPTER NAV */}
            <div className="chap-nav">
              <div
                className="nav-chip"
                style={{ visibility: prevIdx === null ? "hidden" : "visible" }}
                onClick={() => prevIdx !== null && render(prevIdx)}
              >
                <span className="big">←</span>
                <div className="nv-lbl">
                  Previous
                  <span className="nv-ttl">
                    {prevIdx !== null ? CHAPTERS[prevIdx].title : ""}
                  </span>
                </div>
              </div>
              <div className="chap-counter">
                <span className="now">{cur + 1}</span> / {CHAPTERS.length}
              </div>
              <div
                className="nav-chip next"
                onClick={() => nextIdx !== null && render(nextIdx)}
              >
                <div className="nv-lbl">
                  {nextIdx !== null ? "Next chapter" : "The end"}
                  <span className="nv-ttl">
                    {nextIdx !== null
                      ? CHAPTERS[nextIdx].title
                      : "You finished it ✦"}
                  </span>
                </div>
                <span className="big">→</span>
              </div>
            </div>
          </div>
        </div>

        {/* END CTA */}
        <div className="end-actions">
          <div>
            <div className="ea-title">
              Love this one? <em>Keep it forever.</em>
            </div>
            <div className="ea-sub">
              Print {heroName}&apos;s tale as a linen-spined hardcover keepsake
              book — shipped to your door in 5–7 days.
            </div>
          </div>
          <div className="ea-btns">
            <a
              href="#"
              className="btn"
              style={{
                background: "var(--cream)",
                borderColor: "var(--ink)",
              }}
            >
              Save to shelf
            </a>
            <a href="#" className="btn btn-berry">
              Order the keepsake book →
            </a>
          </div>
        </div>
      </main>

      <div className="foot-mini">
        <div>© 2026 TellTales · Sweet dreams guaranteed.</div>
        <div>
          <a href="#">Privacy (COPPA)</a>
          <a href="#">Delete all my data</a>
          <a href="#">Help</a>
        </div>
      </div>
    </>
  );
}
