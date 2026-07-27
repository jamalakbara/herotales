import type Anthropic from "@anthropic-ai/sdk";
import { openai } from "./openai";
import { anthropic, ANTHROPIC_TEXT_MODEL } from "./anthropic";
import { generateBytePlusImage } from "./byteplus";

// Portrait aspect shared by both image providers.
const IMAGE_SIZE = "1024x1792";

// --- Story text -----------------------------------------------------------
// Default provider is Claude Haiku; falls back to OpenAI gpt-4o on any error.

export async function generateText(
  userPrompt: string,
  systemPrompt: string,
  temperature: number,
  jsonMode = false,
): Promise<string> {
  try {
    return await anthropicGenerate(
      userPrompt,
      systemPrompt,
      temperature,
      jsonMode,
    );
  } catch (e) {
    console.warn("[text] Anthropic failed, falling back to OpenAI:", e);
    return await openaiGenerate(userPrompt, systemPrompt, temperature, jsonMode);
  }
}

async function anthropicGenerate(
  userPrompt: string,
  systemPrompt: string,
  temperature: number,
  jsonMode: boolean,
): Promise<string> {
  // JSON mode: prefill the assistant turn with "{" to force a JSON object,
  // then re-prepend it to the returned text. The system prompt already
  // instructs strict JSON, and the caller parses against StoryDocSchema.
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userPrompt },
  ];
  if (jsonMode) messages.push({ role: "assistant", content: "{" });

  const res = await anthropic().messages.create({
    model: ANTHROPIC_TEXT_MODEL,
    max_tokens: 8192,
    temperature,
    system: systemPrompt,
    messages,
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  if (!text) return "";
  return jsonMode ? `{${text}` : text;
}

async function openaiGenerate(
  userPrompt: string,
  systemPrompt: string,
  temperature: number,
  jsonMode: boolean,
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

// --- Chapter images -------------------------------------------------------
// Default provider is BytePlus; falls back to OpenAI dall-e-3 on any error.

// `referenceImageUrl` (optional) drives BytePlus image-to-image so the hero
// stays visually identical across pages. DALL-E-3 is text-only, so the
// reference is dropped on the fallback path (the text character description
// still anchors it).
export async function generateImageBytes(
  prompt: string,
  referenceImageUrl?: string,
): Promise<Buffer> {
  try {
    return await generateBytePlusImage(
      prompt,
      IMAGE_SIZE,
      referenceImageUrl ? [referenceImageUrl] : undefined,
    );
  } catch (e) {
    console.warn("[image] BytePlus failed, falling back to DALL-E:", e);
    if (referenceImageUrl) console.warn("[image] reference image dropped on DALL-E fallback (text-only)");
    return await dalleImageBytes(prompt);
  }
}

async function dalleImageBytes(prompt: string): Promise<Buffer> {
  const res = await openai().images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: IMAGE_SIZE,
    quality: "standard",
  });
  const url = res.data?.[0]?.url;
  if (!url) throw new Error("DALL-E returned no image URL");
  const img = await fetch(url);
  if (!img.ok) throw new Error(`Failed to fetch DALL-E image: ${img.status}`);
  return Buffer.from(await img.arrayBuffer());
}
