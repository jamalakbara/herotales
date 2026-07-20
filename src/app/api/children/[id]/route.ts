import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireUser, notFound, parseJsonBody } from "@/lib/api";
import { db } from "@/lib/db";
import { children } from "@/lib/db/schema";
import { childSelect, toChildColumns } from "@/lib/db/children-fields";
import { ChildPatchSchema } from "@/lib/types";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { userId } = auth;
  const { id } = await ctx.params;

  const parsed = await parseJsonBody(req, ChildPatchSchema, "Invalid patch");
  if ("error" in parsed) return parsed.error;

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
