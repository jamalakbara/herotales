import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateChapterNarration, estimateAudioDuration } from "@/lib/elevenlabs/narrator";

// Use service role for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;

  console.log("[Narrate API] Starting narration request for story:", storyId);

  try {
    const body = await request.json();
    const { chapterIndex } = body;

    console.log("[Narrate API] Chapter index:", chapterIndex);

    if (typeof chapterIndex !== "number" || chapterIndex < 0) {
      console.error("[Narrate API] Invalid chapter index:", chapterIndex);
      return NextResponse.json(
        { error: "Valid chapterIndex is required" },
        { status: 400 }
      );
    }

    // Check if audio already exists
    console.log("[Narrate API] Checking for existing audio...");
    const { data: existingAudio } = await supabaseAdmin
      .from("story_audio")
      .select("*")
      .eq("story_id", storyId)
      .eq("chapter_index", chapterIndex)
      .single();

    if (existingAudio) {
      console.log("[Narrate API] Found cached audio:", existingAudio.audio_url);
      return NextResponse.json({
        audioUrl: existingAudio.audio_url,
        duration: existingAudio.duration_seconds,
        cached: true
      });
    }

    console.log("[Narrate API] No cached audio found, generating new...");

    // Get story data
    console.log("[Narrate API] Fetching story data...");
    const { data: story, error: storyError } = await supabaseAdmin
      .from("stories")
      .select("full_story_json")
      .eq("id", storyId)
      .single();

    if (storyError || !story) {
      console.error("[Narrate API] Story not found:", storyError);
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    const storyContent = story.full_story_json;
    if (!storyContent || !storyContent.chapters || !storyContent.chapters[chapterIndex]) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    const chapter = storyContent.chapters[chapterIndex];
    console.log("[Narrate API] Found chapter:", chapter.title);

    // Generate audio narration
    console.log("[Narrate API] Generating audio with ElevenLabs...");
    const { audioBuffer, contentType } = await generateChapterNarration(
      chapter.title,
      chapter.content
    );
    console.log("[Narrate API] Audio generated, buffer size:", audioBuffer.length);

    // Estimate duration
    const duration = estimateAudioDuration(`${chapter.title}. ${chapter.content}`);

    // Upload to Supabase Storage
    const filename = `${storyId}/chapter-${chapterIndex}.mp3`;
    console.log("[Narrate API] Uploading to storage:", filename);
    const { error: uploadError } = await supabaseAdmin.storage
      .from("story-audio")
      .upload(filename, audioBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("[Narrate API] Audio upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to save audio" },
        { status: 500 }
      );
    }

    console.log("[Narrate API] Upload successful");

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("story-audio")
      .getPublicUrl(filename);

    // Save to database
    console.log("[Narrate API] Saving to database...");
    await supabaseAdmin.from("story_audio").insert({
      story_id: storyId,
      chapter_index: chapterIndex,
      audio_url: publicUrl,
      duration_seconds: duration,
    });

    console.log("[Narrate API] Success! Returning audio URL:", publicUrl);
    return NextResponse.json({
      audioUrl: publicUrl,
      duration,
      cached: false,
    });
  } catch (error) {
    console.error("Narration generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate narration" },
      { status: 500 }
    );
  }
}

// GET existing audio for all chapters
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;

  try {
    const { data: audioList, error } = await supabaseAdmin
      .from("story_audio")
      .select("*")
      .eq("story_id", storyId)
      .order("chapter_index", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch audio" },
        { status: 500 }
      );
    }

    return NextResponse.json({ audio: audioList || [] });
  } catch (error) {
    console.error("Fetch audio error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audio" },
      { status: 500 }
    );
  }
}
