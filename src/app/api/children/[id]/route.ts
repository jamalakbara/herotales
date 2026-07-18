import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { requireUser, badRequest, notFound } from "@/lib/api";
import { db } from "@/lib/db";
import { children } from "@/lib/db/schema";
import { childSelect, toChildColumns } from "@/lib/db/children-fields";

const PatchChild = z
  .object({
    nickname: z.string().min(1).max(40).optional(),
    age: z.number().int().min(2).max(8).optional(),
    pronouns: z.string().min(1).max(40).optional(),
    detail_tags: z.array(z.string().max(60)).max(12).optional(),
    character_description: z.string().max(1000).optional(),
    avatar_idx: z.number().int().min(0).max(7).optional(),
    narrator_voice: z.string().max(40).optional(),
    growth_traits: z.array(z.string().max(60)).max(8).optional(),
    quirk: z.string().max(500).optional(),
    skip_scary: z.boolean().optional(),
    short_stories: z.boolean().optional(),
    use_real_name: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Empty patch" });

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { userId } = auth;
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const parsed = PatchChild.safeParse(body);
  if (!parsed.success) return badRequest("Invalid patch", parsed.error.flatten());

  const [data] = await db
    .update(children)
    .set(toChildColumns(parsed.data))
    .where(and(eq(children.id, id), eq(children.parentId, userId)))
    .returning(childSelect);
  if (!data) return notFound("Child not found");
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

  await db.delete(children).where(and(eq(children.id, id), eq(children.parentId, userId)));
  return NextResponse.json({ ok: true });
}
