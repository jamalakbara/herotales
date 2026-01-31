import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ThemeType } from "@/types/database";
import { checkStoryRateLimit, formatRateLimitError } from "@/lib/rate-limit";
import { inngest } from "@/inngest/client";
import { isDevelopment } from "@/lib/env";

// Reduced max duration since we're just triggering a job now
export const maxDuration = 30;

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
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Get profile for subscription status
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, subscription_end_date")
      .eq("id", user.id)
      .single();

    // Check if subscription is valid
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

    // Check monthly limit for free users (skip in development)
    if (!isDevelopment() && !isPro && currentUsage >= FREE_TIER_LIMIT) {
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

    // Check rate limits
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

    // Verify child exists and user has access (via RLS)
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

    // Create story record with pending status
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .insert({
        child_id: childId,
        theme,
        title: "Generating...",
        is_published: false,
        generation_status: "pending",
        progress: 0,
      })
      .select()
      .single();

    if (storyError || !story) {
      return NextResponse.json(
        { error: "Failed to create story record" },
        { status: 500 }
      );
    }

    // Trigger background job via Inngest
    try {
      await inngest.send({
        name: "story.generation.requested",
        data: {
          storyId: story.id,
          childId,
          theme,
          userId: user.id,
        },
      });

      // Return immediately with story ID
      return NextResponse.json({
        success: true,
        storyId: story.id,
        status: "pending",
      });
    } catch (inngestError) {
      // Clean up story if job trigger fails
      await supabase.from("stories").delete().eq("id", story.id);

      console.error("Failed to trigger background job:", inngestError);
      return NextResponse.json(
        { error: "Failed to start story generation. Please try again." },
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
