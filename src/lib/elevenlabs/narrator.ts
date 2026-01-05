import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Lazy initialization of ElevenLabs client
let client: ElevenLabsClient | null = null;

function getClient(): ElevenLabsClient {
  if (!client) {
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY environment variable is required");
    }
    client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });
  }
  return client;
}

// Default voice for storytelling (warm, friendly)
// You can find voice IDs at https://elevenlabs.io/voice-library
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Rachel voice

interface NarrationResult {
  audioBuffer: Buffer;
  contentType: string;
}

/**
 * Generate audio narration for story text
 * Uses ElevenLabs text-to-speech API with a storytelling-optimized voice
 */
export async function generateNarration(text: string): Promise<NarrationResult> {
  const client = getClient();

  // Generate audio using ElevenLabs
  const audio = await client.textToSpeech.convert(DEFAULT_VOICE_ID, {
    text,
    modelId: "eleven_multilingual_v2", // Best quality for storytelling
    voiceSettings: {
      stability: 0.5, // Balance between stability and expressiveness
      similarityBoost: 0.75, // Natural voice
      style: 0.4, // Some expressiveness for storytelling
      useSpeakerBoost: true,
    },
  });

  // Handle the response - convert ReadableStream to Buffer
  const response = new Response(audio);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = Buffer.from(arrayBuffer);

  return {
    audioBuffer,
    contentType: "audio/mpeg",
  };
}

/**
 * Generate narration for a full chapter (handles long text)
 * Splits text into paragraphs and generates audio for each
 */
export async function generateChapterNarration(
  chapterTitle: string,
  chapterContent: string
): Promise<NarrationResult> {
  // Format the full chapter text with title
  const fullText = `${chapterTitle}.\n\n${chapterContent}`;

  // ElevenLabs can handle up to ~5000 characters per request
  // For longer chapters, we might need to split, but most chapters should be fine
  if (fullText.length > 4500) {
    // For very long texts, we'll need to split and concatenate
    // For now, truncate with ellipsis (can be enhanced later)
    console.warn(`Chapter text is ${fullText.length} characters, may need splitting`);
  }

  return generateNarration(fullText);
}

/**
 * Estimate audio duration based on text length
 * Approximate: 150 words per minute for narration
 */
export function estimateAudioDuration(text: string): number {
  const words = text.split(/\s+/).length;
  const minutes = words / 150;
  return Math.ceil(minutes * 60); // Return seconds
}
