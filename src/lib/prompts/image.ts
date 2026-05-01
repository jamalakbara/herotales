const STYLE_ANCHOR =
  "Soft watercolor and gouache picturebook illustration, hand-drawn texture, warm dusk palette (deep twilight blues, cream paper, berry-red accents, gold lantern glow), gentle linework, painterly, bedtime-storybook composition, no text, no logos, no watermarks.";

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
    `Hero name: ${nickname}. Age: ${age}. Pronouns: ${pronouns}.`,
    detailTags.length ? `Parent-supplied details: ${detailTags.join(", ")}.` : "",
    description ? `Parent's freeform description: "${description}".` : "",
    `Write ONE compact paragraph (max 90 words) that fully specifies: face shape, hair color/style, eye color, skin tone, build, and a signature outfit (top, bottom, footwear, one small accessory). Be specific and visual. Do NOT mention name, age, or pronouns. Do NOT mention setting, mood, or actions. Output the paragraph only — no preface, no lists.`,
  ].filter(Boolean);
  return lines.join("\n");
}

export function buildChapterImagePrompt(opts: {
  characterDescription: string;
  caption: string;
  chapterIndex: number;
  blueprint: string;
}) {
  return [
    `Children's storybook illustration. ${STYLE_ANCHOR}`,
    `Hero (must be drawn EXACTLY the same in every illustration): ${opts.characterDescription}`,
    `Scene to depict (chapter ${opts.chapterIndex + 1}, value: ${opts.blueprint}): ${opts.caption}`,
    `Composition: a single picture-book spread, the hero as the focal subject, gentle storybook framing, full body or upper-body when appropriate.`,
    `Do not include any text, captions, page numbers, or borders.`,
  ].join("\n\n");
}
