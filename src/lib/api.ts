import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import type { Ratelimit } from "@upstash/ratelimit";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chapterImages } from "@/lib/db/schema";
import { signedImageUrl } from "@/lib/cloudinary";
import { cached, keys, ttl, redisEnabled } from "@/lib/redis";

export async function requireUser() {
  const { userId } = await auth();
  if (!userId) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { userId };
}

// Per-user rate limit. Returns a 429 response to short-circuit the handler, or
// `null` to proceed. Fails OPEN — if Upstash is off/unreachable, requests pass.
export async function checkRateLimit(limiter: Ratelimit, userId: string): Promise<NextResponse | null> {
  if (!redisEnabled()) return null;
  try {
    const { success } = await limiter.limit(userId);
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }
    return null;
  } catch (err) {
    console.error("[ratelimit] check failed, allowing request", err);
    return null;
  }
}

export function badRequest(msg: string, details?: unknown) {
  return NextResponse.json({ error: msg, details }, { status: 400 });
}

export function notFound(msg = "Not found") {
  return NextResponse.json({ error: msg }, { status: 404 });
}

export async function parseJsonBody<S extends z.ZodType>(
  req: Request,
  schema: S,
  label: string,
): Promise<{ data: z.infer<S> } | { error: NextResponse }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { error: badRequest("Invalid JSON body") };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { error: badRequest(label, parsed.error.flatten()) };
  return { data: parsed.data };
}

export async function signImageUrlsForStory(parentId: string, storyId: string) {
  void parentId;
  const rows = await db
    .select({ chapterIndex: chapterImages.chapterIndex, storagePath: chapterImages.storagePath })
    .from(chapterImages)
    .where(eq(chapterImages.storyId, storyId))
    .orderBy(asc(chapterImages.chapterIndex));

  // The signed delivery URL is deterministic per publicId (no expiry on the
  // signature), so cache it long-term keyed by the storage path.
  return Promise.all(
    rows.map(async (row) => ({
      chapter_index: row.chapterIndex,
      url: await cached(keys.signedUrl(row.storagePath), ttl.signedUrl, async () =>
        signedImageUrl(row.storagePath),
      ),
    })),
  );
}
