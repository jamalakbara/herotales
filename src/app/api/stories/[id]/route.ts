import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireUser, notFound, signImageUrlsForStory } from "@/lib/api";
import { db } from "@/lib/db";
import { chapterImages, children, stories } from "@/lib/db/schema";
import { deleteStoryImages } from "@/lib/cloudinary";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { userId } = auth;
  const { id } = await ctx.params;

  const [data] = await db
    .select({
      id: stories.id,
      parent_id: stories.parentId,
      child_id: stories.childId,
      blueprint: stories.blueprint,
      length: stories.length,
      voice: stories.voice,
      status: stories.status,
      progress: stories.progress,
      title: stories.title,
      full_text: stories.fullText,
      favorite: stories.favorite,
      error: stories.error,
      created_at: stories.createdAt,
      completed_at: stories.completedAt,
      children: {
        nickname: children.nickname,
        age: children.age,
        pronouns: children.pronouns,
        character_description: children.characterDescription,
      },
    })
    .from(stories)
    .leftJoin(children, eq(children.id, stories.childId))
    .where(and(eq(stories.id, id), eq(stories.parentId, userId)));
  if (!data) return notFound("Story not found");

  const images = data.status === "ready" || data.status === "generating"
    ? await signImageUrlsForStory(userId, id)
    : [];

  return NextResponse.json({ story: data, images });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { userId } = auth;
  const { id } = await ctx.params;

  // pull image public_ids (ownership enforced via the story join) so we can clean Cloudinary
  const imgs = await db
    .select({ storagePath: chapterImages.storagePath })
    .from(chapterImages)
    .innerJoin(stories, eq(stories.id, chapterImages.storyId))
    .where(and(eq(chapterImages.storyId, id), eq(stories.parentId, userId)));

  await deleteStoryImages(imgs.map((r) => r.storagePath));

  await db.delete(stories).where(and(eq(stories.id, id), eq(stories.parentId, userId)));
  return NextResponse.json({ ok: true });
}
