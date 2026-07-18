import { NextResponse } from "next/server";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { requireUser, badRequest } from "@/lib/api";
import { db } from "@/lib/db";
import { children } from "@/lib/db/schema";
import { childSelect, toChildColumns } from "@/lib/db/children-fields";
import { getOrResetQuota } from "@/lib/quota";

const CreateChild = z.object({
  nickname: z.string().min(1).max(40),
  age: z.number().int().min(2).max(8),
  pronouns: z.string().min(1).max(40),
  detail_tags: z.array(z.string().max(60)).max(12).optional(),
  character_description: z.string().max(1000).optional(),
  avatar_idx: z.number().int().min(0).max(7).optional(),
  narrator_voice: z.string().max(40).optional(),
  growth_traits: z.array(z.string().max(60)).max(8).optional(),
  quirk: z.string().max(500).optional(),
  skip_scary: z.boolean().optional(),
  short_stories: z.boolean().optional(),
  use_real_name: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { userId } = auth;
  try {
    const [data, quota] = await Promise.all([
      db
        .select(childSelect)
        .from(children)
        .where(eq(children.parentId, userId))
        .orderBy(asc(children.createdAt)),
      getOrResetQuota(userId),
    ]);
    return NextResponse.json({ children: data, quota });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Query failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { userId } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const parsed = CreateChild.safeParse(body);
  if (!parsed.success) return badRequest("Invalid child", parsed.error.flatten());

  const [data] = await db
    .insert(children)
    .values({
      ...toChildColumns(parsed.data),
      parentId: userId,
      nickname: parsed.data.nickname,
      age: parsed.data.age,
      pronouns: parsed.data.pronouns,
      detailTags: parsed.data.detail_tags ?? [],
      growthTraits: parsed.data.growth_traits ?? [],
    })
    .returning(childSelect);
  if (!data) return NextResponse.json({ error: "Child create failed" }, { status: 500 });
  return NextResponse.json({ child: data }, { status: 201 });
}
