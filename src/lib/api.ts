import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chapterImages } from "@/lib/db/schema";
import { signedImageUrl } from "@/lib/cloudinary";

export async function requireUser() {
  const { userId } = await auth();
  if (!userId) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { userId };
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

  return rows.map((row) => ({
    chapter_index: row.chapterIndex,
    url: signedImageUrl(row.storagePath),
  }));
}
