import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

// Use service role for complete data deletion
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify confirmation from request body
    const body = await request.json().catch(() => ({}));
    if (body.confirmation !== "DELETE_ALL_DATA") {
      return NextResponse.json(
        { error: "Confirmation required" },
        { status: 400 }
      );
    }

    console.log(`Starting data deletion for user: ${user.id}`);

    // Step 1: Get all stories for this user (through children)
    const { data: children } = await supabaseAdmin
      .from("children")
      .select("id")
      .eq("parent_id", user.id);

    const childIds = children?.map(c => c.id) || [];

    if (childIds.length > 0) {
      // Step 2: Get all stories for these children
      const { data: stories } = await supabaseAdmin
        .from("stories")
        .select("id")
        .in("child_id", childIds);

      const storyIds = stories?.map(s => s.id) || [];

      if (storyIds.length > 0) {
        // Step 3: Delete story images from storage
        for (const storyId of storyIds) {
          try {
            const { data: files } = await supabaseAdmin.storage
              .from("story-images")
              .list(storyId);

            if (files && files.length > 0) {
              const filePaths = files.map(f => `${storyId}/${f.name}`);
              await supabaseAdmin.storage
                .from("story-images")
                .remove(filePaths);
            }
          } catch (e) {
            console.log(`No images for story ${storyId}`);
          }

          // Delete audio files
          try {
            const { data: audioFiles } = await supabaseAdmin.storage
              .from("story-audio")
              .list(storyId);

            if (audioFiles && audioFiles.length > 0) {
              const audioPaths = audioFiles.map(f => `${storyId}/${f.name}`);
              await supabaseAdmin.storage
                .from("story-audio")
                .remove(audioPaths);
            }
          } catch (e) {
            console.log(`No audio for story ${storyId}`);
          }
        }

        // Step 4: Delete story_audio records
        await supabaseAdmin
          .from("story_audio")
          .delete()
          .in("story_id", storyIds);

        // Step 5: Delete story_images records
        await supabaseAdmin
          .from("story_images")
          .delete()
          .in("story_id", storyIds);

        // Step 6: Delete stories
        await supabaseAdmin
          .from("stories")
          .delete()
          .in("child_id", childIds);
      }

      // Step 7: Delete children
      await supabaseAdmin
        .from("children")
        .delete()
        .eq("parent_id", user.id);
    }

    // Step 8: Delete usage stats
    await supabaseAdmin
      .from("usage_stats")
      .delete()
      .eq("user_id", user.id);

    // Step 9: Delete profile (but keep auth user for account)
    await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", user.id);

    console.log(`Data deletion complete for user: ${user.id}`);

    return NextResponse.json({
      success: true,
      message: "All user data has been deleted",
    });
  } catch (error) {
    console.error("Data deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete data" },
      { status: 500 }
    );
  }
}
