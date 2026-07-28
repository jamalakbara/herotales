import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { requireUser } from "@/lib/api";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { deleteUserImages } from "@/lib/cloudinary";

export async function POST() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { userId } = auth;

  // 1. purge all Cloudinary images under users/{id}
  await deleteUserImages(userId);

  // 2. delete profile (cascades to children, stories, chapter_images via FK)
  await db.delete(profiles).where(eq(profiles.id, userId));

  // 3. delete the Clerk user
  const clerk = await clerkClient();
  await clerk.users.deleteUser(userId);

  return NextResponse.json({ ok: true });
}
