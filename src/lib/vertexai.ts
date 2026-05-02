import { openai } from "./openai";

export async function generateText(
  userPrompt: string,
  systemPrompt: string,
  temperature: number,
  jsonMode = false,
): Promise<string> {
  const res = await openai().chat.completions.create({
    model: "gpt-4o",
    temperature,
    response_format: jsonMode ? { type: "json_object" } : { type: "text" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  return res.choices[0]?.message?.content?.trim() ?? "";
}

export async function generateImageBytes(prompt: string): Promise<Buffer> {
  const res = await openai().images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1792",
    quality: "standard",
  });
  const url = res.data[0]?.url;
  if (!url) throw new Error("DALL-E returned no image URL");
  const img = await fetch(url);
  if (!img.ok) throw new Error(`Failed to fetch DALL-E image: ${img.status}`);
  return Buffer.from(await img.arrayBuffer());
}
