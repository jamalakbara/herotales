import type { StoryDoc } from "../types";

const BLUEPRINT_GUIDANCE: Record<string, string> = {
  Bravery: "The hero faces a small fear and learns that being scared and being brave can happen at the very same time.",
  Honesty: "The hero is tempted to hide a small mistake and learns that owning the truth is what makes them strong.",
  Patience: "The hero wants something now, but learns that the best things grow slowly.",
  Kindness: "The hero notices someone else's quiet sadness and chooses a small, brave kindness.",
  Persistence: "The hero tumbles, tries again, tumbles, tries again — and discovers that not-yet is not the same as never.",
};

const LENGTH_PARAS: Record<string, string> = {
  Shortie: "2-3 short paragraphs per chapter (2-3 sentences each); aim for roughly 350-450 words total across all 5 chapters",
  Bedtime: "4-5 paragraphs per chapter (3-4 sentences each); aim for roughly 800-1000 words total across all 5 chapters",
  "Long tale": "6-7 rich paragraphs per chapter (4-5 sentences each); aim for roughly 1500-1800 words total across all 5 chapters",
};

export function buildStorySystemPrompt(opts: {
  nickname: string;
  age: number;
  pronouns: string;
  blueprint: string;
  length: string;
  skipScary?: boolean;
  shortStories?: boolean;
}) {
  const { nickname, age, pronouns, blueprint, length, skipScary, shortStories } = opts;
  const extraRules: string[] = [];
  if (skipScary) extraRules.push("No villains, no chases, no scary moments — soft tension only.");
  if (shortStories) extraRules.push("Keep the story under 8 minutes when read aloud.");
  return `You write personalized bedtime stories for young children (ages 2-8).

Hero details:
- Nickname: ${nickname}
- Age: ${age}
- Pronouns: ${pronouns}
- Tonight's lesson (Value Blueprint): ${blueprint}
- Blueprint guidance: ${BLUEPRINT_GUIDANCE[blueprint] ?? ""}
- Length target: ${length} — ${LENGTH_PARAS[length] ?? LENGTH_PARAS.Bedtime}

Rules:
1. Exactly 5 chapters. Each chapter has: a "label" (e.g. "Chapter 1 — Before the woods"), a short "title", a one-line "caption" describing the illustration to render, a "chip" tag (e.g. "Chapter 1"), and "paras" — an array of paragraph strings.
2. Use ${nickname} as the hero throughout. Use ${pronouns} consistently.
3. Age-appropriate vocabulary, gentle pacing, calm bedtime cadence. No scary content, no violence, no sad endings.
4. Embed the Blueprint as something lived, never lectured. End on a warm, restful note in chapter 5.
5. Caption strings must clearly describe a single picturable scene (one moment, one composition) — what the reader is meant to see.
6. The first chapter establishes the hero, place, and a small problem; chapters 2-4 face it; chapter 5 resolves it warmly.
7. Do NOT use markdown or HTML. Plain prose only. No emojis.${extraRules.length ? "\n" + extraRules.map((r) => `8. ${r}`).join("\n") : ""}

Output strictly valid JSON matching this shape:
{
  "title": "<story title featuring ${nickname}>",
  "chapters": [
    { "label": "...", "title": "...", "caption": "...", "chip": "Chapter 1", "paras": ["...", "..."] },
    ... 5 total ...
  ]
}`;
}

export function buildStoryUserPrompt(opts: {
  hook?: string | null;
  detailTags: string[];
  growthTraits?: string[];
  quirk?: string | null;
}) {
  const parts: string[] = [];
  if (opts.detailTags.length) {
    parts.push(`Little details that make this hero feel like them: ${opts.detailTags.join(", ")}.`);
  }
  if (opts.growthTraits && opts.growthTraits.length) {
    parts.push(`Themes to weave in gently (do not lecture — let them be lived): ${opts.growthTraits.join(", ")}.`);
  }
  if (opts.quirk && opts.quirk.trim()) {
    parts.push(`A small thing only their parent would know: ${opts.quirk.trim()}`);
  }
  if (opts.hook && opts.hook.trim()) {
    parts.push(`What's going on in their world right now (weave in gently, never word-for-word): "${opts.hook.trim()}"`);
  }
  parts.push("Write the story now. Return JSON only.");
  return parts.join("\n\n");
}

export function isStoryDoc(x: unknown): x is StoryDoc {
  if (!x || typeof x !== "object") return false;
  const v = x as Record<string, unknown>;
  return typeof v.title === "string" && Array.isArray(v.chapters) && v.chapters.length === 5;
}
