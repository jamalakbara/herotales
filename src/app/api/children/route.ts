import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { requireUser, parseJsonBody } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { db } from "@/lib/db";
import { children } from "@/lib/db/schema";
import { childSelect, toChildColumns } from "@/lib/db/children-fields";
import { getOrResetQuota } from "@/lib/quota";
import { ChildFieldsSchema } from "@/lib/types";

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
    return NextResponse.json({ error: getErrorMessage(err, "Query failed") }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { userId } = auth;

  const parsed = await parseJsonBody(req, ChildFieldsSchema, "Invalid child");
  if ("error" in parsed) return parsed.error;

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
