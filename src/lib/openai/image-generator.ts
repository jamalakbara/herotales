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
  age?: number;
}

interface GeneratedImage {
  url: string;
  revisedPrompt: string;
}

// Whimsical storybook art style - warm, nostalgic, high-end children's literature
const STYLE_GUIDE = `
ARTISTIC STYLE (Whimsical Storybook):
Blend digital painting with traditional textures. Warm, nostalgic atmosphere reminiscent of modern high-end children's literature.

TEXTURE AND MEDIA:
- Grainy, stippled texture throughout (especially sky and foliage)
- Tactile, paper-like quality that softens digital edges
- Visible brushstrokes mimicking gouache or colored pencils

COLOR PALETTE:
- Muted, earthy color story
- Dominated by sage greens, dusty ochres, and soft blues
- Desaturated, warm tones for cozy, gentle mood
- NOT high-energy cartoon colors

LINEWORK:
- NO harsh black outlines
- Line-less painting or very soft colored line art
- Forms defined by color and value shifts, not outlines
- Seamless, painterly look

ENVIRONMENT AND LIGHTING:
- Softly focused, atmospheric backgrounds
- Trees as large textured masses (not individual leaves)
- Light and shadow to imply volume
- Diffused lighting with soft glow
- Airy and bright scene atmosphere

TECHNICAL REQUIREMENTS:
- Do NOT include any text, words, or letters
- Character clearly visible and centered
- Warm, inviting lighting throughout
`;

// Create character template using actual user-configured appearance
function createConsistentCharacterTemplate(
  name: string,
  gender: "boy" | "girl" = "boy",
  age: number = 5,
  userDescription: string = ""
): string {
  // Age-appropriate proportions
  const ageAppearance = age <= 4
    ? "toddler proportions with very round face and chubby cheeks"
    : age <= 7
      ? "young child proportions with round face and soft features"
      : "older child with slightly more defined features but still youthful";

  // Parse user description or use defaults
  const hasUserDesc = userDescription && userDescription.length > 10;

  // Base character design following storybook style
  const baseDesign = `
CHARACTER DESIGN (MUST be IDENTICAL in every scene):
- Name: ${name}
- ${age} years old ${gender === "girl" ? "girl" : "boy"}
- ${ageAppearance}

STORYBOOK CHARACTER STYLE:
- Stylized, simplified proportions with large head
- Minimal facial features: simple dots for eyes, thin line for mouth
- Rosy, textured cheeks
- Organic, rounded forms - NO sharp angles
`;

  if (hasUserDesc) {
    // Use user's configured appearance from CharacterBuilder
    return `${baseDesign}
APPEARANCE (configured by parent):
${userDescription}
`;
  }

  // Default appearance based on gender if no user description
  const defaultAppearance = gender === "girl"
    ? `- Soft wavy hair with warm brown tones
- Wearing a cozy sage green dress with cream cardigan
- Gentle, kind expression`
    : `- Tousled hair with warm brown tones  
- Wearing a soft ochre sweater with comfortable pants
- Curious, friendly expression`;

  return `${baseDesign}
APPEARANCE:
${defaultAppearance}
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
 * Using whimsical storybook art style with user's character configuration
 */
function createSafeIllustrationPrompt(
  sceneDescription: string,
  childName: string,
  gender: "boy" | "girl",
  chapterIndex: number,
  age: number = 5,
  characterDescription: string = ""
): string {
  const safeScene = sanitizePrompt(sceneDescription);

  // Get the character template with user's configured appearance
  const characterTemplate = createConsistentCharacterTemplate(
    childName,
    gender,
    age,
    characterDescription
  );

  // Create storybook-style prompt with exact style requirements
  return `Whimsical children's storybook illustration.

${STYLE_GUIDE}

${characterTemplate}

SCENE (Chapter ${chapterIndex}):
${safeScene}

CRITICAL REMINDERS:
- This is Chapter ${chapterIndex} of an ongoing story series
- Character must look EXACTLY the same as in all other chapters
- Use the exact appearance details specified above
- Maintain consistent clothing, hair, and features throughout
- No text or words in the image
- Suitable for young children ages 3-8`;
}

export async function generateChapterImage({
  prompt,
  childName,
  characterDescription,
  chapterIndex = 1,
  gender = "boy",
  age = 5,
}: GenerateImageParams): Promise<GeneratedImage> {
  // Use the safe prompt generator with storybook style and character details
  const safePrompt = createSafeIllustrationPrompt(
    prompt,
    childName,
    gender,
    chapterIndex,
    age,
    characterDescription
  );

  const response = await getOpenAIClient().images.generate({
    model: "dall-e-3",
    prompt: safePrompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
    style: "vivid", // Natural style for softer, storybook-like images
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
  gender: "boy" | "girl" = "boy",
  age: number = 5
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
        age,
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

