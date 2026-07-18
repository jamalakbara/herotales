// BytePlus ModelArk image generation — default provider for chapter art.
// OpenAI-shaped images endpoint with extra fields (watermark), so we call it
// via fetch rather than the OpenAI SDK. Server/Inngest-only.

const BYTEPLUS_BASE_URL =
  process.env.BYTEPLUS_BASE_URL ??
  "https://ark.ap-southeast.bytepluses.com/api/v3";

// Seedream model id — confirm the exact id in the BytePlus console.
const BYTEPLUS_IMAGE_MODEL =
  process.env.BYTEPLUS_IMAGE_MODEL ?? "seedream-4-0-250828";

// Seedance (video) model id for the async content-generation task API.
const BYTEPLUS_VIDEO_MODEL =
  process.env.BYTEPLUS_VIDEO_MODEL ?? "seedance-1-0-pro-250528";

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

// --- Seedance video generation (async task API) ---------------------------
// ModelArk video generation is async: create a task, poll until it succeeds,
// then fetch the resulting mp4 bytes. Server-only. Text params (ratio, dur,
// resolution) ride inside the prompt string as `--flag value` tokens.

type VideoTaskCreate = { id?: string; error?: { message?: string } };
type VideoTaskStatus = {
  status?: "queued" | "running" | "succeeded" | "failed" | "cancelled";
  content?: { video_url?: string };
  error?: { message?: string };
};

export type BytePlusVideoOptions = {
  /** Aspect ratio token, e.g. "16:9". */ ratio?: string;
  /** Clip length in seconds. */ durationSeconds?: number;
  /** Resolution token, e.g. "720p". */ resolution?: string;
  /** Poll interval / timeout in ms. */ pollMs?: number;
  timeoutMs?: number;
  /**
   * First-frame image (public URL or data: URI) → image-to-video. Lets us feed
   * a Seedream still so the clip inherits that exact illustration/character,
   * and sidesteps the text-to-video content filter on generated children.
   */
  firstFrameImageUrl?: string;
};

// Generate one video from `prompt` and return raw mp4 bytes. Throws on any
// failure (matches the image helper's fail-loud contract).
export async function generateBytePlusVideo(
  prompt: string,
  opts: BytePlusVideoOptions = {},
): Promise<Buffer> {
  const apiKey = process.env.BYTEPLUS_API_KEY;
  if (!apiKey) throw new Error("BYTEPLUS_API_KEY is not set");

  const {
    ratio = "16:9",
    durationSeconds = 5,
    resolution = "720p",
    pollMs = 5000,
    timeoutMs = 6 * 60 * 1000,
    firstFrameImageUrl,
  } = opts;

  // i2v takes ratio from the source image, so only pass --ratio for pure t2v.
  const text =
    `${prompt} --duration ${durationSeconds} --resolution ${resolution}` +
    (firstFrameImageUrl ? "" : ` --ratio ${ratio}`);
  const content: Array<Record<string, unknown>> = [{ type: "text", text }];
  if (firstFrameImageUrl) {
    content.push({ type: "image_url", image_url: { url: firstFrameImageUrl } });
  }
  const auth = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };

  const create = await fetch(`${BYTEPLUS_BASE_URL}/contents/generations/tasks`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify({ model: BYTEPLUS_VIDEO_MODEL, content }),
  });
  if (!create.ok) {
    const body = await create.text().catch(() => "");
    throw new Error(`BytePlus video task create failed: ${create.status} ${body}`);
  }
  const { id, error } = (await create.json()) as VideoTaskCreate;
  if (!id) throw new Error(`BytePlus video task has no id: ${error?.message ?? "unknown"}`);

  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (Date.now() > deadline) throw new Error(`BytePlus video task ${id} timed out`);
    await new Promise((r) => setTimeout(r, pollMs));

    const poll = await fetch(`${BYTEPLUS_BASE_URL}/contents/generations/tasks/${id}`, {
      headers: auth,
    });
    if (!poll.ok) {
      const body = await poll.text().catch(() => "");
      throw new Error(`BytePlus video poll failed: ${poll.status} ${body}`);
    }
    const task = (await poll.json()) as VideoTaskStatus;

    if (task.status === "succeeded") {
      const url = task.content?.video_url;
      if (!url) throw new Error(`BytePlus video ${id} succeeded but returned no url`);
      const vid = await fetch(url);
      if (!vid.ok) throw new Error(`Failed to fetch BytePlus video: ${vid.status}`);
      return Buffer.from(await vid.arrayBuffer());
    }
    if (task.status === "failed" || task.status === "cancelled") {
      throw new Error(`BytePlus video ${id} ${task.status}: ${task.error?.message ?? ""}`);
    }
    // queued | running → keep polling
  }
}
