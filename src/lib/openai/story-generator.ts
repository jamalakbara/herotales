import OpenAI from "openai";
import { ThemeType, StoryContent, StoryChapter } from "@/types/database";

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Value Blueprint Prompts - The "Brain" of HeroTales
const THEME_PROMPTS: Record<ThemeType, string> = {
  bravery: `The story should teach about BRAVERY - overcoming fear and facing challenges.
The child should encounter a situation that initially scares them but they find the courage to face it.
Show the internal struggle and the moment of bravery. The resolution should celebrate their courage.`,

  honesty: `The story should teach about HONESTY - telling the truth and being accountable.
The child should face a situation where lying seems easier, but they choose to be honest.
Show the temptation to lie and the courage to tell the truth. The resolution should reward their honesty.`,

  patience: `The story should teach about PATIENCE - waiting and understanding that good things take time.
The child should want something immediately but learn that waiting leads to better outcomes.
Show the struggle of waiting and the wisdom gained. The resolution should celebrate patience.`,

  kindness: `The story should teach about KINDNESS - empathy and helping others.
The child should notice someone who needs help and choose to be kind.
Show the impact of their kindness on others. The resolution should celebrate compassion.`,

  persistence: `The story should teach about PERSISTENCE - not giving up when things get hard.
The child should face a difficult challenge that requires multiple attempts to overcome.
Show the frustration of failure and the determination to try again. The resolution should celebrate resilience.`,
};

interface GenerateStoryParams {
  childName: string;
  childAge: number;
  characterDescription: string;
  theme: ThemeType;
}

export async function generateStoryText({
  childName,
  childAge,
  characterDescription,
  theme,
}: GenerateStoryParams): Promise<StoryContent> {
  const systemPrompt = `You are a world-class children's story author who creates magical, personalized bedtime stories. 
Your stories are:
- Age-appropriate for ${childAge}-year-olds
- Engaging with vivid imagery and simple vocabulary
- Educational while being entertaining
- Always ending on a positive, hopeful note
- Using the child's name naturally throughout (they are the HERO)

The main character is ${childName}, who looks like: ${characterDescription || "a cheerful, curious child"}.

Always structure the story with exactly 5 chapters. Each chapter should be 2-3 paragraphs long.`;

  const userPrompt = `Create a personalized bedtime story for ${childName} (age ${childAge}).

Theme: ${theme.toUpperCase()}
${THEME_PROMPTS[theme]}

Requirements:
1. ${childName} is the main character and hero
2. Include magical or fantastical elements suitable for children
3. Create vivid, imaginative settings
4. Each chapter should end with a small cliffhanger or transition (except the last)
5. The final chapter should have a clear, satisfying conclusion with the moral lesson

Return the story in the following JSON format:
{
  "title": "Story Title",
  "theme": "${theme}",
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Chapter Title",
      "content": "Chapter content with 2-3 paragraphs...",
      "imagePrompt": "A whimsical cartoon illustration showing: [describe the scene with magical elements, colorful fantasy setting, and adventure - DO NOT describe physical appearance of characters, just describe the setting and action]"
    }
  ],
  "moral": "The lesson learned from this story"
}

IMPORTANT for imagePrompt: 
- Focus on describing the magical SETTING and ACTION, not character appearances
- Use fantasy/cartoon language (magical forest, enchanted castle, sparkling river)
- Keep descriptions abstract and child-friendly
- Do NOT mention skin color, body parts, or physical descriptions`;

  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
    max_tokens: 4000,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No content generated from OpenAI");
  }

  const storyData = JSON.parse(content) as StoryContent;

  // Validate structure
  if (!storyData.title || !storyData.chapters || storyData.chapters.length !== 5) {
    throw new Error("Invalid story structure generated");
  }

  return storyData;
}
