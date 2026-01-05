import OpenAI from "openai";

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

interface GenerateImageParams {
  prompt: string;
  childName: string;
  characterDescription: string;
  chapterIndex?: number;
  gender?: "boy" | "girl";
}

interface GeneratedImage {
  url: string;
  revisedPrompt: string;
}

// Consistent style guide for all story images - emphasizes character consistency
const STYLE_GUIDE = `
CRITICAL CONSISTENCY REQUIREMENTS:
- This is part of a children's storybook series with the SAME main character across all images
- The main character MUST look IDENTICAL in every image (same outfit, same hair, same features)
- Use a SIMPLE, ICONIC cartoon design that's easy to replicate consistently

Art Style:
- Studio Ghibli meets Pixar aesthetic
- Soft, dreamy watercolor background with crisp cartoon character in foreground
- Muted, harmonious color palette (avoid neon or garish colors)
- Round, friendly character proportions

Technical Requirements:
- Do NOT include any text, words, or letters in the image
- Character should be clearly visible and centered
- Warm, inviting lighting throughout
`;

// Create a VERY specific character template for consistency based on gender
function createConsistentCharacterTemplate(name: string, gender: "boy" | "girl" = "boy"): string {
  if (gender === "girl") {
    return `
MAIN CHARACTER (must be IDENTICAL in every scene):
- Name: ${name}
- A young girl with a ROUND FACE, BIG SPARKLY EYES, and ROSY CHEEKS
- LONG BROWN HAIR in two pigtails with pink ribbons
- Wearing a PURPLE DRESS with a YELLOW CARDIGAN (SAME OUTFIT ALWAYS)
- Small, friendly smile
- Simple cartoon style with clean lines
- Approximately 5-6 years old appearance
`;
  }

  // Default boy template
  return `
MAIN CHARACTER (must be IDENTICAL in every scene):
- Name: ${name}
- A young boy with a ROUND FACE, BIG SPARKLY EYES, and ROSY CHEEKS
- SHORT BROWN HAIR in a simple messy style
- Wearing a BRIGHT RED HOODIE and BLUE JEANS (SAME OUTFIT ALWAYS)
- Small, friendly smile
- Simple cartoon style with clean lines
- Approximately 5-6 years old appearance
`;
}

/**
 * Sanitize the prompt to avoid content policy violations
 */
function sanitizePrompt(prompt: string): string {
  let safe = prompt
    .replace(/\b(skin|flesh|body|naked|bare)\b/gi, '')
    .replace(/\b(fight|battle|attack|hurt|pain|blood|wound|kill|death|die|dead)\b/gi, 'challenge')
    .replace(/\b(scary|terrifying|horror|monster)\b/gi, 'magical creature')
    .replace(/\b(gun|weapon|knife|sword)\b/gi, 'wand')
    .trim();

  return safe;
}

export async function generateChapterImage({
  prompt,
  childName,
  characterDescription,
  chapterIndex = 1,
  gender = "boy",
}: GenerateImageParams): Promise<GeneratedImage> {
  const safePrompt = sanitizePrompt(prompt);
  const characterTemplate = createConsistentCharacterTemplate(childName, gender);

  const genderReminder = gender === "girl"
    ? "purple dress, yellow cardigan, brown pigtails with pink ribbons"
    : "red hoodie, blue jeans, short brown messy hair";

  const fullPrompt = `${STYLE_GUIDE}

${characterTemplate}

SCENE FOR CHAPTER ${chapterIndex}:
${safePrompt}

REMEMBER: The main character ${childName} must look EXACTLY the same as described above - ${genderReminder}, round face with rosy cheeks. This is essential for story continuity.`;

  const response = await getOpenAIClient().images.generate({
    model: "dall-e-3",
    prompt: fullPrompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
    style: "vivid",
  });

  if (!response.data || response.data.length === 0) {
    throw new Error("No image data returned from OpenAI");
  }

  const imageData = response.data[0];

  if (!imageData.url) {
    throw new Error("No image URL returned from OpenAI");
  }

  return {
    url: imageData.url,
    revisedPrompt: imageData.revised_prompt || prompt,
  };
}

/**
 * Generate all chapter images for a story
 * Images are generated sequentially to maintain consistency
 */
export async function generateAllChapterImages(
  chapters: Array<{ imagePrompt: string }>,
  childName: string,
  characterDescription: string,
  gender: "boy" | "girl" = "boy"
): Promise<GeneratedImage[]> {
  const images: GeneratedImage[] = [];

  for (let i = 0; i < chapters.length; i++) {
    try {
      const image = await generateChapterImage({
        prompt: chapters[i].imagePrompt,
        childName,
        characterDescription,
        chapterIndex: i + 1,
        gender,
      });
      images.push(image);
    } catch (error) {
      // If image generation fails due to content policy, use a placeholder
      console.error(`Image generation failed for chapter ${i + 1}, using fallback:`, error);
      images.push({
        url: `https://placehold.co/1024x1024/6A89CC/FFFFFF.png?text=Chapter+${i + 1}`,
        revisedPrompt: chapters[i].imagePrompt,
      });
    }

    // Small delay to respect rate limits
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return images;
}
