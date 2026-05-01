"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const BLUEPRINTS = [
  { name: "Bravery", icon: "★", desc: "Facing the dark", hook: "Brave Lantern" },
  { name: "Honesty", icon: "✓", desc: "Owning the truth", hook: "Honest Fox" },
  { name: "Patience", icon: "⟲", desc: "Letting it grow", hook: "Patient Seed" },
  { name: "Kindness", icon: "♡", desc: "Seeing others", hook: "Little Kindness" },
  { name: "Persistence", icon: "↑", desc: "Try, tumble, try", hook: "Long Climb" },
] as const;

const AGES = ["2", "3", "4", "5", "6", "7", "8"] as const;
const PRONOUNS = ["she / her", "he / him", "they / them", "let me type"] as const;
const DETAIL_TAGS = [
  "curly hair",
  "loves dinosaurs",
  "has a stuffed fox",
  "learning to swim",
  "new baby sibling",
  "shy at parties",
  "wears glasses",
] as const;

const VOICES = [
  { name: "Juniper", desc: "Warm, unhurried · great for bedtime" },
  { name: "Atlas", desc: "Soft grandfather · slow & kind" },
  { name: "Wren", desc: "Bright, theatrical · lively tales" },
  { name: "My voice", desc: "Clone with a 30-second sample" },
] as const;

const LENGTHS = [
  { title: "Shortie", mins: "5 min" },
  { title: "Bedtime", mins: "12 min" },
  { title: "Long tale", mins: "20 min" },
] as const;

const SUGGESTIONS = [
  "first day of school",
  "doctor's visit tomorrow",
  "new baby sibling",
  "losing a tooth",
];

const DEFAULT_HOOK =
  "She's nervous about her first sleepover at Grandma's house this Saturday — says the guest room is \"too quiet\" at night.";

export default function CreateStoryPage() {
  const router = useRouter();

  const [name, setName] = useState("Maya");
  const [age, setAge] = useState<string>("5");
  const [pronoun, setPronoun] = useState<string>("she / her");
  const [tags, setTags] = useState<Set<string>>(
    new Set(["curly hair", "has a stuffed fox"]),
  );
  const [blueprint, setBlueprint] = useState<string>("Bravery");
  const [hook, setHook] = useState<string>(DEFAULT_HOOK);
  const [voice, setVoice] = useState<string>("Juniper");
  const [length, setLength] = useState<string>("Bedtime");

  const [describeOpen, setDescribeOpen] = useState(false);
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const displayName = (name || "").trim() || "Hero";
  const initial = (name || "H").trim()[0]?.toUpperCase() ?? "H";
  const blueprintMeta = useMemo(
    () => BLUEPRINTS.find((b) => b.name === blueprint) ?? BLUEPRINTS[0],
    [blueprint],
  );
  const lengthMeta = useMemo(
    () => LENGTHS.find((l) => l.title === length) ?? LENGTHS[1],
    [length],
  );

  function toggleTag(t: string) {
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  function addSuggestion(s: string) {
    setHook((prev) => {
      const base = prev.trim();
      return base.length ? `${base} ${s}.` : `It's about ${s}.`;
    });
  }

  async function handleGenerate(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const pronouns = pronoun === "let me type" ? "they/them" : pronoun.replace(/\s+/g, "");
      const voiceName = voice === "My voice" ? "My voice" : voice;
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          child: {
            nickname: displayName,
            age: parseInt(age, 10),
            pronouns,
            detail_tags: Array.from(tags),
            character_description: description.trim() ? description.trim() : undefined,
          },
          blueprint,
          length,
          voice: voiceName,
          hook: hook.slice(0, 240) || undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        if (res.status === 401) {
          router.push(`/sign-in?next=${encodeURIComponent("/stories/new")}`);
          return;
        }
        throw new Error(j.error ?? `Request failed (${res.status})`);
      }
      const j = (await res.json()) as { story_id: string };
      router.push(`/stories/${j.story_id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  function handleRandomize(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const rb = BLUEPRINTS[Math.floor(Math.random() * BLUEPRINTS.length)];
    setBlueprint(rb.name);
    setLength(LENGTHS[Math.floor(Math.random() * LENGTHS.length)].title);
    setVoice(VOICES[Math.floor(Math.random() * VOICES.length)].name);
  }

  return (
    <>
      <header>
        <nav className="nav">
          <Link href="/" className="logo">
            <div className="logo-mark" />
            TellTales
          </Link>
          <div className="nav-crumbs">
            <Link href="/dashboard">Home</Link>
            <span className="sep">/</span>
            <Link href="/shelf">Shelf</Link>
            <span className="sep">/</span>
            <span className="cur">New story</span>
          </div>
          <a href="#" className="btn btn-ghost" style={{ fontSize: 14 }}>
            Save draft
          </a>
        </nav>
      </header>

      <main className="page">
        <div className="page-title-row">
          <div>
            <span className="page-kicker">Craft tonight&apos;s story</span>
            <h1 className="page-title">
              Who is the <em>hero</em>,
              <br />
              and what will they learn?
            </h1>
          </div>
          <div className="progress-pill">
            <span className="lbl">Step 1 of 2</span>
            <div className="dots">
              <span className="cur" />
              <span />
            </div>
            <span style={{ opacity: 0.7 }}>→ Pages appear</span>
          </div>
        </div>

        <div className="builder">
          {/* LEFT: FORM */}
          <div className="form-card">
            <div className="form-step">
              <div className="form-step-num">1</div>
              <div>
                <div className="form-step-title">Meet the hero</div>
                <div className="form-step-hint">
                  Their details stay consistent across every page — same curls,
                  same brave eyes.
                </div>
              </div>
            </div>

            <div className="form-block">
              <div className="portrait-row">
                <div className="portrait">
                  <span>{initial}</span>
                  <div className="sparkle-tag">✦</div>
                </div>
                <div className="portrait-actions">
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      className="btn"
                      style={{ padding: "10px 16px", fontSize: 13.5 }}
                    >
                      Upload a photo
                    </button>
                    <button
                      className={`btn${describeOpen ? "" : " btn-ghost"}`}
                      style={{
                        padding: "10px 14px",
                        fontSize: 13.5,
                        border: "1.5px solid var(--ink)",
                        boxShadow: "none",
                      }}
                      onClick={() => setDescribeOpen((v) => !v)}
                    >
                      {describeOpen ? "Cancel description" : "Describe in words"}
                    </button>
                  </div>
                  <div className="portrait-hint">
                    {describeOpen
                      ? "No photo needed — just tell us what makes them look like them."
                      : "A single photo helps us sketch them in. We never store it — only the sketch stays."}
                  </div>
                </div>
              </div>

              {describeOpen && (
                <div className="form-block" style={{ marginTop: 20 }}>
                  <label className="field-label" htmlFor="describe-input">
                    Describe how they look{" "}
                    <span className="opt">
                      — hair, eyes, anything that feels like them
                    </span>
                  </label>
                  <textarea
                    className="hook"
                    id="describe-input"
                    placeholder="e.g. Curly brown hair with a little cowlick, warm brown eyes, a tiny gap in her front teeth when she smiles, usually wearing her red rainboots."
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value.slice(0, 320))
                    }
                    autoFocus
                  />
                  <div className="hook-meta">
                    <span>
                      We turn this into a consistent character sketch used across
                      every chapter.
                    </span>
                    <span className="count">{description.length} / 320</span>
                  </div>
                </div>
              )}
            </div>

            <div className="form-block">
              <div className="field-row">
                <div>
                  <label className="field-label">
                    Nickname{" "}
                    <span className="opt">— just a first name or pet name</span>
                  </label>
                  <input
                    type="text"
                    className="txt-input"
                    value={name}
                    placeholder="e.g. Maya"
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Age</label>
                  <div className="age-chips">
                    {AGES.map((a) => (
                      <div
                        key={a}
                        className={`age-chip${age === a ? " active" : ""}`}
                        onClick={() => setAge(a)}
                      >
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-block">
              <label className="field-label">
                Pronouns <span className="opt">— for how we tell their story</span>
              </label>
              <div className="pron-row">
                {PRONOUNS.map((p) => (
                  <div
                    key={p}
                    className={`pron-chip${pronoun === p ? " active" : ""}`}
                    onClick={() => setPronoun(p)}
                  >
                    {p}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-block">
              <label className="field-label">
                A few little details{" "}
                <span className="opt">— pick any that fit (optional)</span>
              </label>
              <div className="tag-picker">
                {DETAIL_TAGS.map((t) => (
                  <div
                    key={t}
                    className={`tag${tags.has(t) ? " active" : ""}`}
                    onClick={() => toggleTag(t)}
                  >
                    {t}
                  </div>
                ))}
                <div className="tag">+ add your own</div>
              </div>
            </div>

            {/* STEP 2: LESSON */}
            <div className="form-step" style={{ marginTop: 40 }}>
              <div
                className="form-step-num"
                style={{ background: "var(--berry)", color: "var(--cream)" }}
              >
                2
              </div>
              <div>
                <div className="form-step-title">Tonight&apos;s lesson</div>
                <div className="form-step-hint">
                  One of five Value Blueprints — lived, not lectured.
                </div>
              </div>
            </div>

            <div className="form-block">
              <label className="field-label">Value blueprint</label>
              <div className="bp-picker">
                {BLUEPRINTS.map((bp) => (
                  <div
                    key={bp.name}
                    className={`bp-opt${blueprint === bp.name ? " active" : ""}`}
                    onClick={() => setBlueprint(bp.name)}
                  >
                    <div className="bp-check">✓</div>
                    <div className="bp-ic">{bp.icon}</div>
                    <div className="bp-nm">{bp.name}</div>
                    <div className="bp-dc">{bp.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-block">
              <label className="field-label">
                The little hook{" "}
                <span className="opt">
                  — what&apos;s going on in their world right now? (optional)
                </span>
              </label>
              <div className="hook-wrap">
                <textarea
                  className="hook"
                  placeholder="e.g. She's scared of the big sleepover at Grandma's this Saturday…"
                  value={hook}
                  onChange={(e) => setHook(e.target.value.slice(0, 240))}
                />
                <div className="hook-meta">
                  <span>We&apos;ll weave this into her chapters — never word-for-word.</span>
                  <span className="count">{hook.length} / 240</span>
                </div>
                <div className="suggest-row">
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--ink-soft)",
                      fontWeight: 700,
                      marginRight: 4,
                      alignSelf: "center",
                    }}
                  >
                    or try:
                  </span>
                  {SUGGESTIONS.map((s) => (
                    <div
                      key={s}
                      className="suggest-chip"
                      onClick={() => addSuggestion(s)}
                    >
                      <span className="plus">+</span>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 3: DELIVERY */}
            <div className="form-step" style={{ marginTop: 40 }}>
              <div
                className="form-step-num"
                style={{ background: "var(--sage)", color: "var(--cream)" }}
              >
                3
              </div>
              <div>
                <div className="form-step-title">How should we tell it?</div>
                <div className="form-step-hint">
                  Pick a voice and a length — you can change this anytime.
                </div>
              </div>
            </div>

            <div className="form-block">
              <label className="field-label">Narrator voice</label>
              <div className="option-grid">
                {VOICES.map((v) => (
                  <div
                    key={v.name}
                    className={`voice-opt${voice === v.name ? " active" : ""}`}
                    onClick={() => setVoice(v.name)}
                  >
                    <div className="v-wave" />
                    <div>
                      <div className="v-nm">{v.name}</div>
                      <div className="v-dc">{v.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-block">
              <label className="field-label">Story length</label>
              <div className="length-opts">
                {LENGTHS.map((l) => (
                  <div
                    key={l.title}
                    className={`length-opt${length === l.title ? " active" : ""}`}
                    onClick={() => setLength(l.title)}
                  >
                    <div className="l-t">{l.title}</div>
                    <div className="l-m">{l.mins}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="action-bar">
              <div className="action-left">
                <span className="coin">⌛</span>
                <span>
                  Uses{" "}
                  <strong style={{ color: "var(--twilight)" }}>1 story credit</strong>{" "}
                  · Lantern plan, 28 left this month.
                </span>
              </div>
              <div className="action-right">
                <a
                  href="#"
                  className="btn"
                  style={{
                    border: "1.5px solid var(--ink)",
                    boxShadow: "none",
                    background: "transparent",
                  }}
                  onClick={handleRandomize}
                >
                  Randomize
                </a>
                <a
                  href="#"
                  className="btn btn-berry"
                  onClick={handleGenerate}
                  style={{ opacity: submitting ? 0.6 : 1, pointerEvents: submitting ? "none" : "auto" }}
                >
                  {submitting ? "Conjuring…" : "Generate story →"}
                </a>
              </div>
              {submitError && (
                <div style={{ marginTop: 12, color: "var(--berry)", fontSize: 13, fontWeight: 700 }}>
                  {submitError}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: PREVIEW */}
          <div className="preview-col">
            <div className="prev-card">
              <div className="prev-head">
                <span className="prev-label">Your cover, so far</span>
                <span className="prev-chip">{blueprint}</span>
              </div>
              <div className="prev-book">
                <div className="prev-stars">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="prev-moon" />
                <div className="prev-mountain" />

                <div className="prev-book-meta">
                  <div className="prev-book-label">Tonight&apos;s tale</div>
                  <div className="prev-book-title">
                    {displayName} &amp; the{" "}
                    <span className="script-inline">{blueprintMeta.hook}</span>
                  </div>
                </div>
                <div className="prev-book-bottom">
                  <div className="prev-book-stats">
                    <span>{blueprint}</span>
                    <span className="dot-sep">·</span>
                    <span>Ages {age}</span>
                    <span className="dot-sep">·</span>
                    <span>{lengthMeta.mins} read</span>
                  </div>
                  <div className="prev-sig">✦</div>
                </div>
              </div>

              <div className="prev-chapters">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="prev-summary">
                <span className="hh">The shape of it:</span> Five hand-illustrated
                chapters following <strong>{displayName}</strong> as{" "}
                {pronoun.startsWith("he") ? "he" : pronoun.startsWith("they") ? "they" : "she"}{" "}
                steps into the Whispering Woods with only a small lantern — and
                discovers that being scared and being brave can happen at the very
                same time.
              </div>
            </div>

            <div className="estimator">
              <div className="spark">✦</div>
              <div className="est-body">
                <div className="est-t">~40 seconds to conjure</div>
                <div className="est-s">
                  5 chapters · 5 illustrations · 1 warm narration · read-along
                  ready
                </div>
              </div>
            </div>

            <div className="recents">
              <div className="recents-head">
                <span>On {displayName}&apos;s shelf</span>
                <a href="#">See all →</a>
              </div>
              <ul>
                <li>
                  <div className="mini m1" />
                  <div className="mini-body">
                    <div className="mini-t">The Garden That Grew Slowly</div>
                    <div className="mini-s">Patience · 3 nights ago</div>
                  </div>
                  <div className="re-arrow">›</div>
                </li>
                <li>
                  <div className="mini m2" />
                  <div className="mini-body">
                    <div className="mini-t">{displayName} &amp; the Honest Fox</div>
                    <div className="mini-s">Honesty · last Tuesday</div>
                  </div>
                  <div className="re-arrow">›</div>
                </li>
                <li>
                  <div className="mini m3" />
                  <div className="mini-body">
                    <div className="mini-t">The Smallest Friend at School</div>
                    <div className="mini-s">Kindness · 12 days ago</div>
                  </div>
                  <div className="re-arrow">›</div>
                </li>
              </ul>
            </div>
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
