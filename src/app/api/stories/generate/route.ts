import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStoryText } from "@/lib/openai/story-generator";
import { generateAllChapterImages } from "@/lib/openai/image-generator";
import { persistAllImages } from "@/lib/supabase/storage";
import { ThemeType } from "@/types/database";
import { checkStoryRateLimit, formatRateLimitError } from "@/lib/rate-limit";

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

    // Check subscription and usage limits
    const FREE_TIER_LIMIT = 3;
    const currentMonth = new Date().toISOString().slice(0, 7); // '2026-01'

    // Get profile for subscription status
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, subscription_end_date")
      .eq("id", user.id)
      .single();

    // Check if subscription is valid (active, trialing, or cancelled but not expired)
    const status = profile?.subscription_status || "free";
    const endDate = profile?.subscription_end_date;
    const isEndDateValid = endDate ? new Date(endDate) > new Date() : false;
    const isActive = status === "active" || status === "trialing";
    const isCancelledButValid = status === "cancelled" && isEndDateValid;
    const isPro = isActive || isCancelledButValid;

    // Get current usage
    const { data: usage } = await supabase
      .from("usage_stats")
      .select("story_count")
      .eq("user_id", user.id)
      .eq("month_year", currentMonth)
      .single();

    const currentUsage = usage?.story_count || 0;

    // Check monthly limit for free users
    if (!isPro && currentUsage >= FREE_TIER_LIMIT) {
      return NextResponse.json(
        {
          error: "Monthly story limit reached",
          code: "LIMIT_EXCEEDED",
          usage: currentUsage,
          limit: FREE_TIER_LIMIT
        },
        { status: 402 }
      );
    }

    // Check rate limits (only in production)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const rateLimitResult = await checkStoryRateLimit(user.id, ip, isPro);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        formatRateLimitError(rateLimitResult),
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfter || 3600),
          }
        }
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
        child.gender || "boy",
        child.age_group
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

      // Increment usage count
      const { data: existingUsage } = await supabase
        .from("usage_stats")
        .select("id, story_count")
        .eq("user_id", user.id)
        .eq("month_year", currentMonth)
        .single();

      if (existingUsage) {
        await supabase
          .from("usage_stats")
          .update({ story_count: existingUsage.story_count + 1, updated_at: new Date().toISOString() })
          .eq("id", existingUsage.id);
      } else {
        await supabase
          .from("usage_stats")
          .insert({ user_id: user.id, month_year: currentMonth, story_count: 1 });
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
