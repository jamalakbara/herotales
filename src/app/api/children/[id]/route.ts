import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireUser, notFound, parseJsonBody, checkRateLimit } from "@/lib/api";
import { mutationLimiter } from "@/lib/ratelimit";
import { invalidate, keys } from "@/lib/redis";
import { db } from "@/lib/db";
import { children, stories, chapterImages } from "@/lib/db/schema";
import { childSelect, toChildColumns } from "@/lib/db/children-fields";
import { deleteStoryImages } from "@/lib/cloudinary";
import { ChildPatchSchema } from "@/lib/types";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { userId } = auth;
  const { id } = await ctx.params;

  const limited = await checkRateLimit(mutationLimiter(), userId);
  if (limited) return limited;

  const parsed = await parseJsonBody(req, ChildPatchSchema, "Invalid patch");
  if ("error" in parsed) return parsed.error;

  const [data] = await db
    .update(children)
    .set(toChildColumns(parsed.data))
    .where(and(eq(children.id, id), eq(children.parentId, userId)))
    .returning(childSelect);
  if (!data) return notFound("Child not found");
  await invalidate(keys.children(userId), keys.dashboard(userId));
  return NextResponse.json({ child: data });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { userId } = auth;
  const { id } = await ctx.params;

  // Gather this hero's Cloudinary assets before the DB cascade drops the rows:
  // portrait + every story's cover + all chapter images. Otherwise they orphan.
  const [portraitRow] = await db
    .select({ portrait: children.portraitStoragePath })
    .from(children)
    .where(and(eq(children.id, id), eq(children.parentId, userId)));
  const covers = await db
    .select({ cover: stories.coverStoragePath })
    .from(stories)
    .where(and(eq(stories.childId, id), eq(stories.parentId, userId)));
  const chapters = await db
    .select({ path: chapterImages.storagePath })
    .from(chapterImages)
    .innerJoin(stories, eq(stories.id, chapterImages.storyId))
    .where(and(eq(stories.childId, id), eq(stories.parentId, userId)));

  const paths = [
    portraitRow?.portrait,
    ...covers.map((c) => c.cover),
    ...chapters.map((c) => c.path),
  ].filter((p): p is string => !!p);
  await deleteStoryImages(paths);

  await db.delete(children).where(and(eq(children.id, id), eq(children.parentId, userId)));
  await invalidate(keys.children(userId), keys.dashboard(userId));
  return NextResponse.json({ ok: true });
}
