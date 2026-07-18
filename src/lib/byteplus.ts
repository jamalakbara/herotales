// BytePlus ModelArk image generation — default provider for chapter art.
// OpenAI-shaped images endpoint with extra fields (watermark), so we call it
// via fetch rather than the OpenAI SDK. Server/Inngest-only.

const BYTEPLUS_BASE_URL =
  process.env.BYTEPLUS_BASE_URL ??
  "https://ark.ap-southeast.bytepluses.com/api/v3";

// Seedream model id — confirm the exact id in the BytePlus console.
const BYTEPLUS_IMAGE_MODEL =
  process.env.BYTEPLUS_IMAGE_MODEL ?? "seedream-4-0-250828";

type BytePlusImageResponse = {
  data?: Array<{ url?: string; b64_json?: string }>;
  error?: { message?: string };
};

// Generate a single image from `prompt` and return raw PNG/JPEG bytes.
// Throws on any failure so `generateImageBytes` can fall back to DALL-E.
export async function generateBytePlusImage(
  prompt: string,
  size: string,
): Promise<Buffer> {
  const apiKey = process.env.BYTEPLUS_API_KEY;
  if (!apiKey) throw new Error("BYTEPLUS_API_KEY is not set");

  const res = await fetch(`${BYTEPLUS_BASE_URL}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: BYTEPLUS_IMAGE_MODEL,
      prompt,
      size,
      response_format: "url",
      watermark: false,
      n: 1,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`BytePlus image request failed: ${res.status} ${body}`);
  }

  const json = (await res.json()) as BytePlusImageResponse;
  const first = json.data?.[0];

  if (first?.b64_json) {
    return Buffer.from(first.b64_json, "base64");
  }

  const url = first?.url;
  if (!url) {
    throw new Error(
      `BytePlus returned no image: ${json.error?.message ?? "empty data"}`,
    );
  }

  const img = await fetch(url);
  if (!img.ok) {
    throw new Error(`Failed to fetch BytePlus image: ${img.status}`);
  }
  return Buffer.from(await img.arrayBuffer());
}
