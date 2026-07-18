const STYLE_ANCHOR =
  "Soft watercolor and gouache picturebook illustration, hand-drawn texture, warm dusk palette (deep twilight blues, cream paper, berry-red accents, gold lantern glow), gentle linework, painterly, bedtime-storybook composition, no text, no logos, no watermarks.";

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
