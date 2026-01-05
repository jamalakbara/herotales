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
 * DALL-E 3 is very sensitive - we need aggressive sanitization
 */
function sanitizePrompt(prompt: string): string {
  // List of words/patterns that trigger DALL-E's safety system
  const unsafePatterns = [
    // Physical descriptions that may be flagged
    /\b(skin|flesh|body|naked|bare|undress)/gi,
    // Violence-related
    /\b(fight|battle|attack|hurt|pain|blood|wound|kill|death|die|dead|war|violence|violent|angry|anger|rage|destroy|destruction|defeat)/gi,
    // Scary content
    /\b(scary|terrifying|horror|monster|demon|devil|evil|wicked|dark|darkness|nightmare|fear|afraid|terrified|creepy|spooky|haunted)/gi,
    // Weapons
    /\b(gun|weapon|knife|sword|axe|bow|arrow|spear|dagger)/gi,
    // Potentially problematic terms
    /\b(fire|flame|burn|burning|explosion|explode|smoke)/gi,
    /\b(chase|chasing|run away|escape|hiding|hide)/gi,
    /\b(storm|thunder|lightning|dangerous|danger)/gi,
    /\b(steal|thief|criminal|villain|enemy)/gi,
    /\b(sad|cry|crying|tears|lonely|alone)/gi,
    /\b(giant|huge|enormous|massive|tiny|small child)/gi,
    // Real people indicators
    /\b(photo|realistic|real|photograph|photorealistic)/gi,
  ];

  let safe = prompt;

  // Remove all unsafe patterns
  for (const pattern of unsafePatterns) {
    safe = safe.replace(pattern, '');
  }

  // Replace with neutral, positive alternatives
  safe = safe
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // If the prompt got too short after sanitization, use a generic safe prompt
  if (safe.length < 20) {
    return 'A cheerful illustrated scene from a children\'s storybook with bright colors and friendly atmosphere';
  }

  return safe;
}

/**
 * Create a completely safe, children's book appropriate prompt
 */
function createSafeIllustrationPrompt(
  sceneDescription: string,
  childName: string,
  gender: "boy" | "girl",
  chapterIndex: number
): string {
  const safeScene = sanitizePrompt(sceneDescription);

  const genderTerms = gender === "girl"
    ? { pronoun: "she", adjective: "her", outfit: "purple dress and yellow cardigan", hair: "brown pigtails" }
    : { pronoun: "he", adjective: "his", outfit: "red hoodie and blue jeans", hair: "short brown hair" };

  // Create a very safe, generic children's book prompt
  return `Children's storybook illustration in watercolor style.

A happy ${gender === "girl" ? "girl" : "boy"} character with a round face, big friendly eyes, rosy cheeks, and ${genderTerms.hair}, wearing ${genderTerms.outfit}.

Scene: ${safeScene}

Style: Soft, dreamy Pixar-Ghibli hybrid art style. Warm, inviting colors. Friendly and magical atmosphere. Simple cartoon character design. No text or words in the image. Suitable for young children ages 3-8.`;
}

export async function generateChapterImage({
  prompt,
  childName,
  characterDescription,
  chapterIndex = 1,
  gender = "boy",
}: GenerateImageParams): Promise<GeneratedImage> {
  // Use the safe prompt generator that avoids content policy issues
  const safePrompt = createSafeIllustrationPrompt(prompt, childName, gender, chapterIndex);

  const response = await getOpenAIClient().images.generate({
    model: "dall-e-3",
    prompt: safePrompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
    style: "natural", // Changed from "vivid" to "natural" for softer, safer images
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
