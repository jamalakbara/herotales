import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireUser, notFound, signImageUrlsForStory } from "@/lib/api";
import { cached, invalidate, keys, ttl } from "@/lib/redis";
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

  // This endpoint is polled every 2s while a story generates. Cache the whole
  // (user-scoped) response: 2s for in-progress states to bound staleness, 60s
  // once terminal. Not-found (null) reads back as a cache miss, so it's simply
  // never cached. Busted on favorite/delete and when the Inngest pipeline ends.
  const payload = await cached(
    keys.story(userId, id),
    (v) => (v === null || v.story.status === "ready" || v.story.status === "failed" ? ttl.storyReady : ttl.storyPending),
    async () => {
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
      if (!data) return null;

      const images = data.status === "ready" || data.status === "generating"
        ? await signImageUrlsForStory(userId, id)
        : [];

      return { story: data, images };
    },
  );

  if (!payload) return notFound("Story not found");
  return NextResponse.json(payload);
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

  // include the story's cover so it isn't orphaned (portrait is per-child, kept)
  const [own] = await db
    .select({ coverStoragePath: stories.coverStoragePath })
    .from(stories)
    .where(and(eq(stories.id, id), eq(stories.parentId, userId)));

  const paths = imgs.map((r) => r.storagePath);
  if (own?.coverStoragePath) paths.push(own.coverStoragePath);
  await deleteStoryImages(paths);

  await db.delete(stories).where(and(eq(stories.id, id), eq(stories.parentId, userId)));
  await invalidate(keys.story(userId, id), keys.dashboard(userId));
  return NextResponse.json({ ok: true });
}
