import Anthropic from "@anthropic-ai/sdk";

let cached: Anthropic | null = null;

// Anthropic client factory — story-text default provider (Claude Haiku).
// Server/Inngest-only, same singleton shape as `openai()`.
export function anthropic() {
  if (cached) return cached;
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  cached = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return cached;
}

// Default story-text model; override with ANTHROPIC_TEXT_MODEL.
export const ANTHROPIC_TEXT_MODEL =
  process.env.ANTHROPIC_TEXT_MODEL ?? "claude-haiku-4-5";
