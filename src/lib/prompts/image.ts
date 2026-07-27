const STYLE_ANCHOR =
  "Soft watercolor and gouache picturebook illustration, hand-drawn texture, warm dusk palette (deep twilight blues, cream paper, berry-red accents, gold lantern glow), gentle linework, painterly, bedtime-storybook composition, no text, no logos, no watermarks.";

// Per-value visual motif woven into the cover (previously `blueprint` was
// ignored). Single source of truth beside THEME_STAR in story-view.ts.
const BLUEPRINT_MOTIF: Record<string, string> = {
  Bravery: "a warm glowing lantern",
  Honesty: "a clear open window with soft light",
  Patience: "a slowly blooming flower or rising moon",
  Kindness: "a small shared gift or offered hand",
  Persistence: "a winding path climbing gently upward",
};

function blueprintMotif(blueprint: string): string {
  return BLUEPRINT_MOTIF[blueprint] ?? "a warm glowing lantern";
}

// Turn a numeric age (2–8) into a visual instruction the illustrator can act on.
// The stated age was previously never sent to the image model, so every hero
// rendered at roughly the same toddler age. Keep this the single source of the
// age→appearance mapping.
export function ageDescriptor(age: number): string {
  if (age <= 2) return "a baby/toddler around 2 years old, with clear baby proportions — a large head, round chubby cheeks, and a small body";
  if (age <= 3) return "a toddler around 3 years old, with soft rounded toddler proportions";
  if (age <= 5) return `a young preschooler around ${age} years old`;
  if (age <= 7) return `a young child around ${age} years old, taller and leaner than a toddler`;
  return "a child around 8 years old — clearly school-aged, taller and more grown than a toddler while still a young child";
}

export function buildCharacterDescriptionPrompt(opts: {
  nickname: string;
  age: number;
  pronouns: string;
  detailTags: string[];
  description?: string | null;
}) {
  const { nickname, age, pronouns, detailTags, description } = opts;
  const lines = [
    `You are creating a locked "character sheet" for a children's storybook hero so every chapter illustration depicts the SAME child.`,
    `Hero name: ${nickname}. Pronouns: ${pronouns}.`,
    `The child is ${ageDescriptor(age)} — reflect this age clearly in their facial proportions and body build.`,
    detailTags.length ? `Parent-supplied details (honor any that affect appearance): ${detailTags.join(", ")}.` : "",
    description ? `Parent's freeform description (use this as the primary source of truth): "${description}".` : "",
    `Write ONE compact paragraph (max 90 words) that fully specifies: face shape, hair color/style/texture, eye color, skin tone, build/proportions (matching the age above), and a signature outfit (top, bottom, footwear, one small accessory).`,
    `Make this child distinctive and individual. Do NOT default to the generic "chestnut curly hair, hazel eyes, freckles, yellow tee, denim overalls, red sneakers" look — vary the skin tone, hair colour and texture, eye colour, and outfit palette, drawing on the name and the details above so no two heroes look alike.`,
    `Be specific and visual. Do NOT state the name, pronouns, or a numeric age. Do NOT mention setting, mood, or actions. Output the paragraph only — no preface, no lists.`,
  ].filter(Boolean);
  return lines.join("\n");
}

// One-time canonical hero portrait — the visual anchor that every chapter +
// cover is generated against (via image-to-image). Head-and-shoulders, plain
// background, same STYLE_ANCHOR so it lives in the same world as the pages.
export function buildHeroPortraitPrompt(opts: {
  characterDescription: string;
  age: number;
  detailTags?: string[];
}) {
  const tags = (opts.detailTags ?? []).filter((t) => t.trim());
  return [
    `A single head-and-shoulders character portrait of the story's hero, facing forward, gentle friendly expression, centered, on a plain soft cream background.`,
    `Style: ${STYLE_ANCHOR}`,
    `The child is ${ageDescriptor(opts.age)}: ${opts.characterDescription}`,
    tags.length ? `Signature personal details that affect appearance: ${tags.join(", ")}.` : "",
    `Composition: one clean portrait, no scene, no props, no background objects. Strictly forbidden: any text, letters, labels, character reference sheets, color swatches, page borders, frames, watermarks, logos.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

// Book-cover illustration: hero in a signature scene, framed vertically with
// generous empty space in the TOP THIRD so the title overlay reads cleanly.
export function buildCoverImagePrompt(opts: {
  characterDescription: string;
  title: string;
  blueprint: string;
  age: number;
  detailTags?: string[];
}) {
  const tags = (opts.detailTags ?? []).filter((t) => t.trim());
  return [
    `Book-cover illustration for a children's bedtime story titled "${opts.title}". The hero stands in a warm, inviting scene evoking ${blueprintMotif(opts.blueprint)}.`,
    `Style: ${STYLE_ANCHOR}`,
    `The child protagonist is ${ageDescriptor(opts.age)}: ${opts.characterDescription}`,
    tags.length ? `Keep these signature personal details consistent: ${tags.join(", ")}.` : "",
    `Composition: vertical book-cover framing, the hero in the lower two-thirds, with a calm simple sky / open negative space across the TOP THIRD reserved for a title (leave it uncluttered). No text of any kind.`,
    `Strictly forbidden: any text, letters, labels, titles embedded in art, open book pages, split panels, character reference sheets, color swatches, design layouts, page borders, frames within frames, watermarks, logos.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildChapterImagePrompt(opts: {
  characterDescription: string;
  caption: string;
  chapterIndex: number;
  blueprint: string;
  age: number;
  detailTags?: string[];
}) {
  void opts.blueprint;
  const tags = (opts.detailTags ?? []).filter((t) => t.trim());
  return [
    `Scene (chapter ${opts.chapterIndex + 1}): ${opts.caption} — fill the entire frame with this moment.`,
    `Style: ${STYLE_ANCHOR}`,
    `The child protagonist is ${ageDescriptor(opts.age)}: ${opts.characterDescription}`,
    tags.length
      ? `Keep these signature personal details consistent across every chapter, showing the ones that affect appearance: ${tags.join(", ")}.`
      : "",
    `Composition: one single-panel illustration, full frame. The hero is actively engaged in the scene above. Full body or upper-body as appropriate. No splits, no open-book layout, no page divisions.`,
    `Strictly forbidden: any text, letters, labels, captions embedded in art, open book pages, split panels, character reference sheets, color swatches, design layouts, page borders, frames within frames, watermarks, logos.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
