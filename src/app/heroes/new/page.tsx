"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppFooter } from "@/components/app-footer";
import { FloatingNav } from "@/components/floating-nav";
import { AmbientDecor } from "@/components/motion/AmbientDecor";
import { Reveal } from "@/components/motion/Reveal";
import { SectionKicker } from "@/components/section-kicker";
import { Skeleton } from "@/components/skeleton";
import { getErrorMessage } from "@/lib/errors";
import { AVATAR_SWATCHES } from "@/lib/hero-palette";
import { CHILD_AGES } from "@/lib/types";

type ExistingChild = {
  id: string;
  nickname: string;
  age: number;
  pronouns: string;
};

const PRONOUN_CHIPS: { label: string; value: string }[] = [
  { label: "she / her", value: "she/her" },
  { label: "he / him", value: "he/him" },
  { label: "they / them", value: "they/them" },
  { label: "+ custom", value: "custom" },
];

const LOVES = [
  "dinosaurs",
  "space",
  "animals",
  "building things",
  "music",
  "dancing",
  "the ocean",
  "trains",
  "baking",
  "fairies",
  "dragons",
  "football",
  "painting",
  "bugs",
];

const TRAITS = [
  { icon: "♡", label: "Kindness" },
  { icon: "★", label: "Bravery" },
  { icon: "⟲", label: "Patience" },
  { icon: "↑", label: "Persistence" },
  { icon: "✦", label: "Honesty" },
  { icon: "☾", label: "Calm" },
  { icon: "✿", label: "Curiosity" },
  { icon: "⌂", label: "Belonging" },
];

const VOICES = [
  { name: "Juniper", desc: "Warm · British · Calm" },
  { name: "Atlas", desc: "Soft · Deep · Grandfatherly" },
  { name: "Marisol", desc: "Gentle · Lilting · Cozy" },
  { name: "Your own", desc: "Record once · 3 minutes" },
];

const SEAT_COLORS = ["var(--u-orange)", "var(--lilac)", "var(--twilight)"];
const SEAT_FG = ["#fff", "var(--twilight)", "#fff"];

export default function AddHeroPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("");
  const [pronoun, setPronoun] = useState<string>("she/her");
  const [customPronoun, setCustomPronoun] = useState("");
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [loves, setLoves] = useState<Set<string>>(new Set());
  const [quirk, setQuirk] = useState("");
  const [traits, setTraits] = useState<Set<string>>(new Set());
  const [voice, setVoice] = useState("Juniper");
  const [skipScary, setSkipScary] = useState(true);
  const [shortStories, setShortStories] = useState(true);
  const [useRealName, setUseRealName] = useState(true);

  const [existingKids, setExistingKids] = useState<ExistingChild[]>([]);
  const [kidsLoading, setKidsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/children", { cache: "no-store" })
      .then(async (r) => (r.ok ? r.json() : { children: [] }))
      .then((j: { children: ExistingChild[] }) => setExistingKids(j.children ?? []))
      .catch(() => {})
      .finally(() => setKidsLoading(false));
  }, []);

  const seatLetters = existingKids.slice(0, 3).map((k) => k.nickname[0]?.toUpperCase() ?? "?");
  const seatsRemaining = Math.max(0, 3 - existingKids.length);

  const pronounLabel = useMemo(() => {
    if (pronoun === "custom") return customPronoun.trim() || "custom";
    return PRONOUN_CHIPS.find((p) => p.value === pronoun)?.label ?? pronoun;
  }, [pronoun, customPronoun]);

  const previewLetter = ((name.trim()[0] || "A").toUpperCase());
  const previewName = name.trim() || "Your hero";
  const previewMeta = useMemo(() => {
    const parts: string[] = [];
    if (age) parts.push(`${age} years`);
    if (pronounLabel) parts.push(pronounLabel);
    return parts.length ? parts.join(" · ") : "Pick an age & pronouns →";
  }, [age, pronounLabel]);

  const previewQuote = useMemo(() => {
    const hero = name.trim() || "a brave little hero";
    const love = [...loves][0];
    const trait = [...traits][0]?.toLowerCase();
    if (love && trait) return `Once upon a bedtime, ${hero} wandered into the woods with ${love.replace(/^the /, "")} on the brain — and a quiet, growing ${trait}.`;
    if (love) return `Once upon a bedtime, ${hero} dreamt of ${love.replace(/^the /, "")} — and the woods dreamt right back.`;
    if (trait) return `Once upon a bedtime, ${hero} stepped into the woods carrying just one small thing: a little ${trait}.`;
    return `Once upon a bedtime, ${hero} set out into the woods, lantern in hand…`;
  }, [name, loves, traits]);

  function toggle(setRef: Set<string>, val: string, setter: (s: Set<string>) => void) {
    const n = new Set(setRef);
    if (n.has(val)) n.delete(val);
    else n.add(val);
    setter(n);
  }

  const canSubmit = name.trim().length > 0 && age !== "" && (pronoun !== "custom" || customPronoun.trim().length > 0);

  async function submit(goCreateStory: boolean) {
    if (!canSubmit) {
      setError("Add a name, age, and pronouns first.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const pronounsValue = pronoun === "custom" ? customPronoun.trim() : (PRONOUN_CHIPS.find((p) => p.value === pronoun)?.label ?? pronoun);

    const detailTags = [...loves].slice(0, 12);

    try {
      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: name.trim(),
          age: Number(age),
          pronouns: pronounsValue,
          detail_tags: detailTags,
          avatar_idx: avatarIdx,
          narrator_voice: voice,
          growth_traits: [...traits],
          quirk: quirk.trim() || undefined,
          skip_scary: skipScary,
          short_stories: shortStories,
          use_real_name: useRealName,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Save failed (${res.status})`);
      }
      const { child } = (await res.json()) as { child: { id: string } };
      if (goCreateStory) router.push(`/stories/new?child_id=${child.id}`);
      else router.push("/dashboard");
    } catch (e) {
      setError(getErrorMessage(e, "Could not save hero"));
      setSubmitting(false);
    }
  }

  const stepNum: React.CSSProperties = { position: "absolute", top: 24, right: 28, fontFamily: "var(--font-caprasimo), serif", fontSize: 32, color: "var(--cream-deep)", lineHeight: 1, pointerEvents: "none" };
  const sectionStyle: React.CSSProperties = { padding: "28px 32px", borderBottom: "2px dashed var(--paper-line)", position: "relative" };
  const secH: React.CSSProperties = { fontFamily: "var(--font-young-serif), serif", fontSize: 22, color: "var(--twilight)", letterSpacing: "-0.01em", marginBottom: 4 };
  const secD: React.CSSProperties = { fontSize: 13.5, color: "var(--ink-soft)", fontWeight: 600, marginBottom: 18 };
  const lblStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 800, color: "var(--ink-soft)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 };
  const inpStyle: React.CSSProperties = { width: "100%", padding: "12px 16px", background: "var(--cream-deep)", border: "2px solid transparent", borderRadius: 12, fontFamily: "var(--font-nunito), sans-serif", fontWeight: 600, fontSize: 16, color: "var(--twilight)" };

  function chipStyle(on: boolean): React.CSSProperties {
    return {
      padding: "8px 14px",
      background: on ? "var(--u-orange)" : "var(--cream-deep)",
      border: "none",
      borderRadius: 999,
      fontWeight: 700,
      fontSize: 13,
      color: on ? "#fff" : "var(--twilight)",
      cursor: "pointer",
      userSelect: "none",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    };
  }

  function tgStyle(on: boolean): React.CSSProperties {
    return { flexShrink: 0, width: 48, height: 28, background: on ? "var(--u-orange)" : "var(--cream-deep)", border: "none", borderRadius: 999, position: "relative", cursor: "pointer" };
  }
  function tgKnob(on: boolean): React.CSSProperties {
    return { position: "absolute", top: 4, left: on ? 24 : 4, width: 20, height: 20, background: on ? "#fff" : "var(--ink-soft)", borderRadius: "50%", transition: "left 0.15s ease, background 0.15s ease" };
  }

  const av = AVATAR_SWATCHES[avatarIdx];

  return (
    <>
      <FloatingNav variant="app" />
      <main className="app-main" style={{ maxWidth: 1300, margin: "0 auto", padding: "0 48px 80px", position: "relative", zIndex: 2 }}>
        {/* CRUMB */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 18 }}>
          <Link href="/dashboard">Home</Link>
          <span style={{ opacity: 0.4 }}>›</span>
          <Link href="/dashboard">Heroes</Link>
          <span style={{ opacity: 0.4 }}>›</span>
          <span style={{ color: "var(--twilight)" }}>Add another</span>
        </div>

        {/* HEAD */}
        <Reveal className="hero-add-head" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 36, marginBottom: 40, alignItems: "end" }}>
          <div>
            <SectionKicker>Sketching a new character</SectionKicker>
            <h1 style={{ fontFamily: "var(--font-young-serif), serif", fontSize: "clamp(38px, 4vw, 56px)", lineHeight: 1.0, letterSpacing: "-0.02em", color: "var(--twilight)", marginBottom: 14 }}>
              Who&apos;s joining the <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)" }}>woods</span>?
            </h1>
            <p style={{ fontSize: 17, color: "var(--ink-soft)", fontWeight: 500, maxWidth: 520, lineHeight: 1.5 }}>
              Tell us a little about your child and we&apos;ll start every story with them at the heart of it. You can change any of this later — promise.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", background: "#fff", borderRadius: 18, boxShadow: "var(--u-card-shadow)", fontSize: 13, fontWeight: 700, color: "var(--ink-soft)" }}>
            <span>Lantern plan · Heroes</span>
            {kidsLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={`s${i}`} variant="seat" />)}
            {!kidsLoading && seatLetters.map((l, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 8, fontFamily: "var(--font-caprasimo), serif", fontSize: 14, color: SEAT_FG[i], background: SEAT_COLORS[i] }}>{l}</span>
            ))}
            {!kidsLoading && (
              <>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 8, fontFamily: "var(--font-caprasimo), serif", fontSize: 14, background: "var(--u-orange)", color: "#fff" }}>+</span>
                {Array.from({ length: Math.max(0, seatsRemaining - 1) }).map((_, i) => (
                  <span key={`e${i}`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 8, border: "1.5px dashed var(--paper-line)", fontFamily: "var(--font-caprasimo), serif", fontSize: 14, color: "var(--twilight)" }}>·</span>
                ))}
              </>
            )}
            <a href="#" style={{ color: "var(--u-orange)", marginLeft: "auto" }}>Need more? Constellation →</a>
          </div>
        </Reveal>

        {/* GRID */}
        <div className="hero-add-grid" style={{ display: "grid", gridTemplateColumns: "1.25fr 0.95fr", gap: 32, alignItems: "start" }}>
          {/* FORM */}
          <form onSubmit={(e) => e.preventDefault()} autoComplete="off" className="u-card-lg" style={{ overflow: "hidden" }}>
            {/* 01 BASICS */}
            <section style={sectionStyle}>
              <div style={stepNum}>01</div>
              <div style={secH}>The <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)" }}>basics</span></div>
              <div style={secD}>A first name — or a nickname only their stories will know.</div>

              <div className="hero-add-row-name" style={{ display: "grid", gridTemplateColumns: "1.5fr 0.7fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={lblStyle} htmlFor="f-name">Hero&apos;s name</label>
                  <input id="f-name" style={inpStyle} type="text" placeholder="e.g. Juno" maxLength={24} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label style={lblStyle} htmlFor="f-age">Age</label>
                  <select id="f-age" style={inpStyle} value={age} onChange={(e) => setAge(e.target.value)}>
                    <option value="">Pick one</option>
                    {CHILD_AGES.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={lblStyle}>Pronouns we&apos;ll use in stories</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {PRONOUN_CHIPS.map((p) => (
                    <button type="button" key={p.value} style={chipStyle(pronoun === p.value)} onClick={() => setPronoun(p.value)}>{p.label}</button>
                  ))}
                </div>
                {pronoun === "custom" && (
                  <input style={{ ...inpStyle, marginTop: 10 }} placeholder="e.g. ze / zir" maxLength={40} value={customPronoun} onChange={(e) => setCustomPronoun(e.target.value)} />
                )}
              </div>
            </section>

            {/* 02 AVATAR */}
            <section style={sectionStyle}>
              <div style={stepNum}>02</div>
              <div style={secH}>A face on the <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)" }}>shelf</span></div>
              <div style={secD}>Pick a placeholder color &amp; letter. (You can upload a real photo from Settings later.)</div>

              <div className="hero-add-avgrid" style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10, marginTop: 4 }}>
                {AVATAR_SWATCHES.map((s, i) => {
                  const on = avatarIdx === i;
                  return (
                    <button type="button" key={i} onClick={() => setAvatarIdx(i)}
                      style={{ aspectRatio: "1", border: "none", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 22, cursor: "pointer", color: s.color, background: s.bg, transform: on ? "translateY(-2px)" : undefined, boxShadow: on ? "0 0 0 3px var(--u-orange), var(--u-card-shadow)" : "var(--u-card-shadow)", position: "relative" }}>
                      {previewLetter}
                      {on && <span style={{ position: "absolute", top: -8, right: -6, color: "var(--moon)", fontFamily: "var(--font-caprasimo), serif", fontSize: 14 }}>✦</span>}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 03 LOVES */}
            <section style={sectionStyle}>
              <div style={stepNum}>03</div>
              <div style={secH}>What lights them <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)" }}>up</span>?</div>
              <div style={secD}>Pick 3–6. We&apos;ll weave these into characters, settings, and small details.</div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {LOVES.map((l) => {
                  const on = loves.has(l);
                  return (
                    <button type="button" key={l} style={chipStyle(on)} onClick={() => toggle(loves, l, setLoves)}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: on ? "var(--moon)" : "var(--ink-soft)", opacity: on ? 1 : 0.55 }} />
                      {l}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={lblStyle} htmlFor="f-quirk">A small thing only you&apos;d know <span style={{ textTransform: "none", fontWeight: 600, color: "var(--ink-soft)", letterSpacing: 0 }}>(optional)</span></label>
                <textarea id="f-quirk" style={{ ...inpStyle, resize: "vertical", minHeight: 88, lineHeight: 1.45, fontSize: 15 }} placeholder='e.g. always names the moon "Pip," pretends sticks are wands, brave with bugs but not thunder…' value={quirk} onChange={(e) => setQuirk(e.target.value)} />
              </div>
            </section>

            {/* 04 TRAITS */}
            <section style={sectionStyle}>
              <div style={stepNum}>04</div>
              <div style={secH}>Traits we&apos;re gently <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)" }}>growing</span></div>
              <div style={secD}>Stories will lean into these themes a little more often. Pick 1–3 to start.</div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TRAITS.map((t) => {
                  const on = traits.has(t.label);
                  return (
                    <button type="button" key={t.label} style={chipStyle(on)} onClick={() => toggle(traits, t.label, setTraits)}>
                      {t.icon} {t.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 05 NARRATOR */}
            <section style={sectionStyle}>
              <div style={stepNum}>05</div>
              <div style={secH}>Tonight&apos;s <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)" }}>narrator</span></div>
              <div style={secD}>Whose voice tucks them in? Tap to hear a sample.</div>

              <div className="hero-add-voices" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {VOICES.map((v) => {
                  const on = voice === v.name;
                  return (
                    <button type="button" key={v.name} onClick={() => setVoice(v.name)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "none", borderRadius: 14, background: on ? "var(--u-orange)" : "var(--cream-deep)", boxShadow: on ? "var(--u-card-shadow)" : "none", cursor: "pointer", textAlign: "left" }}>
                      <span style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--twilight)", color: "var(--u-orange)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>▶</span>
                      <span>
                        <span style={{ display: "block", fontFamily: "var(--font-young-serif), serif", fontSize: 16, color: on ? "#fff" : "var(--twilight)", lineHeight: 1.05 }}>{v.name}</span>
                        <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: on ? "rgba(255,255,255,0.8)" : "var(--ink-soft)", letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 2 }}>{v.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 06 PARENT CONTROLS */}
            <section style={sectionStyle}>
              <div style={stepNum}>06</div>
              <div style={secH}>A few <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)" }}>parent</span> controls</div>
              <div style={secD}>Defaults are gentle. You can override per-story too.</div>

              <div>
                {[
                  { l: "Skip anything scary", d: "No villains, no chases, no loud surprises. Soft tension only.", on: skipScary, set: setSkipScary },
                  { l: "Keep stories under 8 minutes", d: "Good for school nights and short attention spans.", on: shortStories, set: setShortStories },
                  { l: "Include their real name in stories", d: 'Otherwise we\'ll use a sound-alike like "Juno" → "June."', on: useRealName, set: setUseRealName },
                ].map((row, i) => (
                  <div key={row.l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: i === 0 ? "none" : "1.5px dashed var(--paper-line)" }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 16, color: "var(--twilight)" }}>{row.l}</div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-soft)", fontWeight: 600, marginTop: 2 }}>{row.d}</div>
                    </div>
                    <button type="button" aria-pressed={row.on} onClick={() => row.set(!row.on)} style={tgStyle(row.on)}>
                      <span style={tgKnob(row.on)} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 8, background: "var(--cream-deep)", borderRadius: 14, padding: "14px 16px", fontSize: 13, color: "var(--ink-soft)", fontWeight: 600, display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--u-orange)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", color: "#fff", fontSize: 14, flexShrink: 0 }}>✦</div>
                <div>
                  <strong style={{ color: "var(--twilight)", display: "block", marginBottom: 2, fontFamily: "var(--font-young-serif), serif", fontSize: 14, fontWeight: 400 }}>Stored privately, just for you.</strong>
                  Nothing about your child trains our models. You can <a href="#" style={{ color: "var(--berry)", fontWeight: 800 }}>delete this hero</a> any time and everything goes with them.
                </div>
              </div>
            </section>

            {/* FOOT */}
            <div style={{ padding: "22px 32px", background: "var(--cream-deep)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", borderTop: "1.5px dashed var(--paper-line)" }}>
              <div style={{ fontSize: 13, color: "var(--ink-soft)", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, background: "var(--u-orange)", borderRadius: "50%", boxShadow: "0 0 0 3px rgba(255,105,46,0.25)" }} />
                <span>{error ? <span style={{ color: "var(--u-orange)" }}>{error}</span> : "Auto-saved as draft · just you and us."}</span>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/dashboard" className="dash-btn dash-btn-ghost">Cancel</Link>
                <button type="button" disabled={submitting || !canSubmit} onClick={() => submit(false)} className="dash-btn dash-btn-ghost">Save for later</button>
                <button type="button" disabled={submitting || !canSubmit} onClick={() => submit(true)} className="dash-btn dash-btn-berry">{submitting ? "Saving…" : "Create hero & first story →"}</button>
              </div>
            </div>
          </form>

          {/* PREVIEW */}
          <aside className="hero-add-preview" style={{ position: "sticky", top: 104, display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="u-panel-dark" style={{ borderRadius: 28, padding: "28px 28px 22px" }}>
              <AmbientDecor
                variant="dark"
                stars={[
                  { top: "12%", left: "70%" },
                  { top: "30%", left: "88%" },
                  { top: "8%", left: "40%" },
                ]}
                fireflies={[{ left: "82%", bottom: "20%", delay: "0s", dur: "8s" }]}
              />
              <div style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--u-orange)", fontSize: 14, marginBottom: 8, position: "relative" }}>Live character sketch</div>
              <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative", marginBottom: 18 }}>
                <div style={{ width: 76, height: 76, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 36, color: av.color, background: av.bg, flexShrink: 0, boxShadow: "var(--u-card-shadow)" }}>{previewLetter}</div>
                <div>
                  <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 30, lineHeight: 1, letterSpacing: "-0.01em", marginBottom: 4 }}>{previewName}</div>
                  <div style={{ fontSize: 13, color: "rgba(251,243,227,0.75)", fontWeight: 600 }}>{previewMeta}</div>
                </div>
              </div>
              <div style={{ background: "rgba(251,243,227,0.08)", border: "1.5px dashed rgba(251,243,227,0.3)", borderRadius: 14, padding: "14px 16px", fontFamily: "var(--font-young-serif), serif", fontSize: 15, lineHeight: 1.45, color: "var(--cream)", position: "relative", marginBottom: 18, minHeight: 76 }}>
                <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--u-orange)", fontSize: 24, lineHeight: 0.5 }}>&ldquo;</span>
                {previewQuote}
                <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--u-orange)", fontSize: 24, lineHeight: 0.5 }}>&rdquo;</span>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", position: "relative" }}>
                {traits.size === 0
                  ? ["trait", "trait", "trait"].map((t, i) => (
                    <span key={i} style={{ padding: "6px 12px", background: "transparent", color: "rgba(251,243,227,0.45)", border: "1.5px dashed rgba(251,243,227,0.3)", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>{t}</span>
                  ))
                  : [...traits].map((t) => (
                    <span key={t} style={{ padding: "6px 12px", background: "var(--cream)", color: "var(--twilight)", border: "1.5px solid var(--cream)", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>{t}</span>
                  ))}
              </div>
            </div>

            <div className="u-card" style={{ borderRadius: 22, padding: "22px 24px" }}>
              <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: 18, color: "var(--twilight)", marginBottom: 12 }}>What this <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "var(--berry)" }}>unlocks</span></div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, margin: 0, padding: 0 }}>
                {[
                  { h: "Their own shelf", d: "Stories filed under their name, not yours." },
                  { h: "A character that recurs", d: "Side characters & settings remember each other across nights." },
                  { h: "Theme tracking", d: "We'll quietly notice which lessons have shown up — and which haven't." },
                  { h: "Keepsake-ready", d: "Any story can become a hardcover with their name on the spine." },
                ].map((p) => (
                  <li key={p.h} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 13.5, color: "var(--ink-soft)", fontWeight: 600, lineHeight: 1.4 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--u-orange)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontFamily: "var(--font-caprasimo), serif", flexShrink: 0, marginTop: 1 }}>✓</div>
                    <div>
                      <strong style={{ color: "var(--twilight)", fontFamily: "var(--font-young-serif), serif", fontWeight: 400, fontSize: 14.5, display: "block", marginBottom: 1 }}>{p.h}</strong>
                      {p.d}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: "var(--u-orange)", borderRadius: 18, padding: "16px 18px", boxShadow: "var(--u-card-shadow)", fontSize: 13.5, color: "var(--ink-warm)", fontWeight: 600, lineHeight: 1.45, transform: "rotate(-1deg)" }}>
              <span style={{ fontFamily: "var(--font-caprasimo), serif", color: "#fff", marginRight: 6 }}>Tip ✦</span>
              Keep loves &amp; quirks small and specific — &ldquo;names the moon Pip&rdquo; makes a better story than &ldquo;loves space.&rdquo;
            </div>
          </aside>
        </div>
      </main>

      <AppFooter />

      <style jsx>{`
        @media (max-width: 1100px) {
          :global(.hero-add-grid), :global(.hero-add-head) { grid-template-columns: 1fr !important; }
          :global(.hero-add-preview) { position: static !important; }
          :global(.hero-add-avgrid) { grid-template-columns: repeat(6, 1fr) !important; }
          :global(.hero-add-voices) { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          :global(.hero-add-row-name) { grid-template-columns: 1fr !important; }
          :global(.hero-add-avgrid) { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
