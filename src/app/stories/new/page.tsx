"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { AppFooter } from "@/components/app-footer";
import { FloatingNav } from "@/components/floating-nav";
import { Reveal } from "@/components/motion/Reveal";
import { Skeleton } from "@/components/skeleton";
import { Suspense, useEffect, useMemo, useState } from "react";

type ExistingChild = {
  id: string;
  nickname: string;
  age: number;
  pronouns: string;
  narrator_voice: string;
};

type Quota = { quota: number; used: number; remaining: number; periodStart: string };

type ShelfStory = {
  id: string;
  title: string | null;
  blueprint: string;
  created_at: string;
};

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const wks = Math.round(days / 7);
  if (wks < 4) return `${wks} week${wks === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

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
  { title: "Shortie", mins: "3 min" },
  { title: "Bedtime", mins: "7 min" },
  { title: "Long tale", mins: "12 min" },
] as const;

const SUGGESTIONS = [
  "first day of school",
  "doctor's visit tomorrow",
  "new baby sibling",
  "losing a tooth",
];

const DEFAULT_HOOK =
  "She's nervous about her first sleepover at Grandma's house this Saturday — says the guest room is \"too quiet\" at night.";

function CreateStoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const preselectedChildId = searchParams.get("child_id");

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

  const [addingTag, setAddingTag] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const [customPronoun, setCustomPronoun] = useState("");

  const [describeOpen, setDescribeOpen] = useState(false);
  const [description, setDescription] = useState("");

  const [existingKids, setExistingKids] = useState<ExistingChild[]>([]);
  const [heroMode, setHeroMode] = useState<"new" | "existing">("new");
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);
  const [quota, setQuota] = useState<Quota | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [shelf, setShelf] = useState<ShelfStory[]>([]);
  const [shelfLoading, setShelfLoading] = useState(false);

  useEffect(() => {
    if (!selectedKidId) {
      setShelf([]);
      return;
    }
    let active = true;
    setShelfLoading(true);
    fetch(`/api/stories?child_id=${selectedKidId}&status=ready&limit=3`)
      .then((r) => (r.ok ? r.json() : { stories: [] }))
      .then((d: { stories: ShelfStory[] }) => {
        if (active) setShelf(d.stories ?? []);
      })
      .catch(() => {
        if (active) setShelf([]);
      })
      .finally(() => {
        if (active) setShelfLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedKidId]);

  useEffect(() => {
    fetch("/api/children")
      .then((r) => (r.ok ? r.json() : { children: [] }))
      .then((d: { children: ExistingChild[]; quota?: Quota }) => {
        if (d.quota) setQuota(d.quota);
        if (d.children.length > 0) {
          setExistingKids(d.children);
          if (preselectedChildId) {
            const match = d.children.find((k) => k.id === preselectedChildId);
            if (match) {
              setHeroMode("existing");
              setSelectedKidId(preselectedChildId);
              setName(match.nickname);
              setAge(String(match.age));
              setPronoun(match.pronouns);
              setVoice(match.narrator_voice ?? "Juniper");
            }
          }
        }
      })
      .catch(() => {});
  }, [preselectedChildId]);

  const displayName = (name || "").trim() || "Hero";
  const initial = (name || "H").trim()[0]?.toUpperCase() ?? "H";
  const outOfQuota = quota != null && quota.remaining <= 0;
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

  function commitCustomTag() {
    const t = customTag.trim();
    if (t && !(DETAIL_TAGS as readonly string[]).includes(t)) {
      setTags((prev) => new Set(prev).add(t));
    }
    setCustomTag("");
    setAddingTag(false);
  }

  function selectExistingKid(k: ExistingChild) {
    setSelectedKidId(k.id);
    setName(k.nickname);
    setAge(String(k.age));
    setPronoun(k.pronouns);
    setVoice(k.narrator_voice ?? "Juniper");
  }

  function addSuggestion(s: string) {
    setHook((prev) => {
      const base = prev.trim();
      return base.length ? `${base} ${s}.` : `It's about ${s}.`;
    });
  }

  async function handleGenerate(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (submitting || outOfQuota) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const voiceName = voice === "My voice" ? "My voice" : voice;
      const useExisting = heroMode === "existing" && selectedKidId;
      const pronouns =
        pronoun === "let me type"
          ? customPronoun.trim().replace(/\s+/g, "") || "they/them"
          : pronoun.replace(/\s+/g, "");
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          useExisting
            ? { child_id: selectedKidId, blueprint, length, voice: voiceName, hook: hook.slice(0, 240) || undefined }
            : {
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
              },
        ),
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
      <FloatingNav variant="reader"
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Shelf", href: "/shelf" },
          { label: "New story" },
        ]}
        action={
          <a href="#" className="btn btn-ghost" style={{ fontSize: 14 }}>
            Save draft
          </a>
        }
      />

      <main className="page">
        <Reveal className="page-title-row">
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
        </Reveal>

        <div className="builder">
          {/* LEFT: FORM */}
          <Reveal className="form-card" delay={0.07}>
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

            {existingKids.length > 0 && (
              <div className="form-block" style={{ paddingBottom: 0 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  {(["existing", "new"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setHeroMode(m); if (m === "new") setSelectedKidId(null); }}
                      className={`u-chip${heroMode === m ? " active" : ""}`}
                      style={{ fontSize: 13 }}
                    >
                      {m === "existing" ? "Pick existing hero" : "New hero"}
                    </button>
                  ))}
                </div>
                {heroMode === "existing" && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                    {existingKids.map((k) => (
                      <div
                        key={k.id}
                        onClick={() => selectExistingKid(k)}
                        className={`kid-pick${selectedKidId === k.id ? " active" : ""}`}
                      >
                        <div className="kid-pick-name">{k.nickname}</div>
                        <div className="kid-pick-meta">{k.age} yrs · {k.pronouns}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {heroMode === "new" && (
            <>
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
                      style={{ padding: "10px 14px", fontSize: 13.5 }}
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
              {pronoun === "let me type" && (
                <input
                  type="text"
                  className="txt-input"
                  style={{ marginTop: 10 }}
                  value={customPronoun}
                  placeholder="e.g. ze / zir"
                  maxLength={40}
                  onChange={(e) => setCustomPronoun(e.target.value)}
                />
              )}
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
                {Array.from(tags)
                  .filter((t) => !(DETAIL_TAGS as readonly string[]).includes(t))
                  .map((t) => (
                    <div
                      key={t}
                      className="tag active"
                      onClick={() => toggleTag(t)}
                    >
                      {t}
                    </div>
                  ))}
                {addingTag ? (
                  <input
                    autoFocus
                    className="tag-input"
                    value={customTag}
                    placeholder="type a detail…"
                    onChange={(e) => setCustomTag(e.target.value)}
                    onBlur={commitCustomTag}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitCustomTag();
                      } else if (e.key === "Escape") {
                        setCustomTag("");
                        setAddingTag(false);
                      }
                    }}
                  />
                ) : (
                  <div className="tag" onClick={() => setAddingTag(true)}>
                    + add your own
                  </div>
                )}
              </div>
            </div>
            </>
            )}

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
                  <strong style={{ color: "var(--twilight)" }}>1 story credit</strong>
                  {quota != null ? (
                    <>
                      {" "}· Lantern plan,{" "}
                      <strong style={{ color: outOfQuota ? "var(--berry)" : "var(--twilight)" }}>
                        {quota.remaining} of {quota.quota}
                      </strong>{" "}
                      left this month.
                    </>
                  ) : (
                    " · Lantern plan."
                  )}
                </span>
              </div>
              <div className="action-right">
                <a href="#" className="btn btn-ghost" onClick={handleRandomize}>
                  Randomize
                </a>
                <a
                  href="#"
                  className="btn btn-berry"
                  onClick={handleGenerate}
                  aria-disabled={submitting || outOfQuota}
                  style={{
                    opacity: submitting || outOfQuota ? 0.6 : 1,
                    pointerEvents: submitting || outOfQuota ? "none" : "auto",
                  }}
                >
                  {submitting
                    ? "Conjuring…"
                    : outOfQuota
                      ? "Monthly limit reached"
                      : "Generate story →"}
                </a>
              </div>
              {submitError && (
                <div style={{ marginTop: 12, color: "var(--berry)", fontSize: 13, fontWeight: 700 }}>
                  {submitError}
                </div>
              )}
            </div>
          </Reveal>

          {/* RIGHT: PREVIEW */}
          <Reveal className="preview-col" delay={0.14}>
            <div className="prev-card">
              <div className="prev-head">
                <span className="prev-label">Your cover, so far</span>
                <motion.span
                  key={blueprint}
                  className="prev-chip"
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  {blueprint}
                </motion.span>
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

                <motion.div
                  key={blueprint}
                  className="prev-book-meta"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="prev-book-label">Tonight&apos;s tale</div>
                  <div className="prev-book-title">
                    {displayName} &amp; the{" "}
                    <span className="script-inline">{blueprintMeta.hook}</span>
                  </div>
                </motion.div>
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
                <Link href="/shelf">See all →</Link>
              </div>
              {shelfLoading ? (
                <ul aria-hidden>
                  {Array.from({ length: 2 }).map((_, i) => (
                    <li key={i}>
                      <Skeleton style={{ width: 36, height: 44, borderRadius: 5, flexShrink: 0 }} />
                      <div className="mini-body">
                        <Skeleton variant="text" style={{ width: "75%", marginBottom: 7 }} />
                        <Skeleton variant="text" style={{ width: "50%" }} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : shelf.length > 0 ? (
                <ul>
                  {shelf.map((s, i) => (
                    <li key={s.id}>
                      <div className={`mini m${(i % 3) + 1}`} />
                      <div className="mini-body">
                        <div className="mini-t">{s.title ?? "Untitled story"}</div>
                        <div className="mini-s">
                          {s.blueprint} · {timeAgo(s.created_at)}
                        </div>
                      </div>
                      <Link href={`/stories/${s.id}`} className="re-arrow">
                        ›
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mini-s" style={{ padding: "4px 2px" }}>
                  {selectedKidId
                    ? `No finished stories for ${displayName} yet.`
                    : "Pick an existing hero to see their shelf."}
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </main>

      <AppFooter variant="mini" />
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <CreateStoryPage />
    </Suspense>
  );
}
