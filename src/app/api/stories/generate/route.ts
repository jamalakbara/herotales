import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStoryText } from "@/lib/openai/story-generator";
import { generateAllChapterImages } from "@/lib/openai/image-generator";
import { persistAllImages } from "@/lib/supabase/storage";
import { ThemeType } from "@/types/database";

export const maxDuration = 300; // 5 minutes for story generation

interface GenerateRequestBody {
  childId: string;
  theme: ThemeType;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: GenerateRequestBody = await request.json();
    const { childId, theme } = body;

    if (!childId || !theme) {
      return NextResponse.json(
        { error: "childId and theme are required" },
        { status: 400 }
      );
    }

    // Fetch child data (with parent verification via RLS)
    const { data: child, error: childError } = await supabase
      .from("children")
      .select("*")
      .eq("id", childId)
      .single();

    if (childError || !child) {
      return NextResponse.json(
        { error: "Child not found or access denied" },
        { status: 404 }
      );
    }

    // Create story record (placeholder)
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .insert({
        child_id: childId,
        theme,
        title: "Generating...",
        is_published: false,
      })
      .select()
      .single();

    if (storyError || !story) {
      return NextResponse.json(
        { error: "Failed to create story record" },
        { status: 500 }
      );
    }

    try {
      // Step 1: Generate story text with GPT-4o-mini
      const storyContent = await generateStoryText({
        childName: child.nickname,
        childAge: child.age_group,
        characterDescription: child.character_description || "",
        theme: theme as ThemeType,
      });

      // Step 2: Generate images for each chapter with DALL-E 3
      const generatedImages = await generateAllChapterImages(
        storyContent.chapters.map((ch) => ({ imagePrompt: ch.imagePrompt || "" })),
        child.nickname,
        child.character_description || "",
        child.gender || "boy"
      );

      // Step 3: Persist images to Supabase Storage
      const persistedImageUrls = await persistAllImages(
        generatedImages,
        story.id
      );

      // Step 4: Save story images to database
      const imageInserts = persistedImageUrls.map((url, index) => ({
        story_id: story.id,
        chapter_index: index + 1,
        image_url: url,
        openai_gen_id: null, // Could store gen_id for tracking
      }));

      const { error: imagesError } = await supabase
        .from("story_images")
        .insert(imageInserts);

      if (imagesError) {
        console.error("Error saving images:", imagesError);
      }

      // Step 5: Update story with full content
      const { error: updateError } = await supabase
        .from("stories")
        .update({
          title: storyContent.title,
          full_story_json: storyContent,
          is_published: true,
        })
        .eq("id", story.id);

      if (updateError) {
        throw new Error("Failed to update story");
      }

      return NextResponse.json({
        success: true,
        storyId: story.id,
        title: storyContent.title,
      });
    } catch (generationError) {
      // Clean up failed story
      await supabase.from("stories").delete().eq("id", story.id);

      console.error("Story generation error:", generationError);
      return NextResponse.json(
        { error: "Failed to generate story. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
