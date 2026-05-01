import OpenAI from "openai";

let cached: OpenAI | null = null;

export function openai() {
  if (cached) return cached;
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  cached = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return cached;
}
