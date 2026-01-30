import { inngest } from "../client";
import { createClient } from "@supabase/supabase-js";
import { generateStoryText } from "@/lib/openai/story-generator";
import { generateAllChapterImages } from "@/lib/openai/image-generator";
import { persistAllImages } from "@/lib/supabase/storage";
import { ThemeType } from "@/types/database";

// Create Supabase admin client for server-side operations
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Background function for story generation
export const generateStory = inngest.createFunction(
  {
    id: "generate-story",
    name: "Generate Story with AI",
    // Retry configuration
    retries: 2,
    // Limit concurrent generations to control API usage
    concurrency: {
      limit: 5,
    },
  },
  { event: "story.generation.requested" },
  async ({ event, step }) => {
    const { storyId, childId, theme, userId } = event.data;
    const supabase = getSupabaseAdmin();

    // Step 1: Fetch child data and update status to "generating_text"
    const { child, childData } = await step.run("fetch-child-data", async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("id", childId)
        .single();

      if (error || !data) {
        throw new Error(`Child not found: ${childId}`);
      }

      // Update story status
      await supabase
        .from("stories")
        .update({
          generation_status: "generating_text",
          progress: 10,
          generation_started_at: new Date().toISOString(),
        })
        .eq("id", storyId);

      return { child: data, childData: data };
    });

    // Step 2: Generate story text with GPT-4o-mini
    const storyContent = await step.run("generate-story-text", async () => {
      try {
        const content = await generateStoryText({
          childName: childData.nickname,
          childAge: childData.age_group,
          characterDescription: childData.character_description || "",
          theme: theme as ThemeType,
        });

        // Update progress
        await supabase
          .from("stories")
          .update({
            generation_status: "generating_text",
            progress: 25,
            title: content.title,
          })
          .eq("id", storyId);

        return content;
      } catch (error) {
        // Log error and fail
        await supabase
          .from("stories")
          .update({
            generation_status: "failed",
            error_message: `Failed to generate story text: ${error instanceof Error ? error.message : "Unknown error"}`,
            generation_completed_at: new Date().toISOString(),
          })
          .eq("id", storyId);
        throw error;
      }
    });

    // Step 3: Generate images for each chapter
    const generatedImages = await step.run("generate-chapter-images", async () => {
      try {
        // Update status
        await supabase
          .from("stories")
          .update({
            generation_status: "generating_images",
            progress: 30,
          })
          .eq("id", storyId);

        const images = await generateAllChapterImages(
          storyContent.chapters.map((ch) => ({ imagePrompt: ch.imagePrompt || "" })),
          childData.nickname,
          childData.character_description || "",
          childData.gender || "boy",
          childData.age_group
        );

        // Update progress after images
        await supabase
          .from("stories")
          .update({
            generation_status: "generating_images",
            progress: 75,
          })
          .eq("id", storyId);

        return images;
      } catch (error) {
        await supabase
          .from("stories")
          .update({
            generation_status: "failed",
            error_message: `Failed to generate images: ${error instanceof Error ? error.message : "Unknown error"}`,
            generation_completed_at: new Date().toISOString(),
          })
          .eq("id", storyId);
        throw error;
      }
    });

    // Step 4: Persist images to Supabase Storage
    const persistedImageUrls = await step.run("persist-images", async () => {
      try {
        await supabase
          .from("stories")
          .update({
            generation_status: "saving",
            progress: 85,
          })
          .eq("id", storyId);

        const urls = await persistAllImages(generatedImages, storyId);

        return urls;
      } catch (error) {
        await supabase
          .from("stories")
          .update({
            generation_status: "failed",
            error_message: `Failed to persist images: ${error instanceof Error ? error.message : "Unknown error"}`,
            generation_completed_at: new Date().toISOString(),
          })
          .eq("id", storyId);
        throw error;
      }
    });

    // Step 5: Save story images to database
    await step.run("save-story-images-to-db", async () => {
      const imageInserts = persistedImageUrls.map((url, index) => ({
        story_id: storyId,
        chapter_index: index + 1,
        image_url: url,
        openai_gen_id: null,
      }));

      const { error: imagesError } = await supabase
        .from("story_images")
        .insert(imageInserts);

      if (imagesError) {
        console.error("Error saving images:", imagesError);
        throw new Error(`Failed to save images: ${imagesError.message}`);
      }

      // Update progress
      await supabase
        .from("stories")
        .update({
          generation_status: "saving",
          progress: 95,
        })
        .eq("id", storyId);
    });

    // Step 6: Finalize story
    await step.run("finalize-story", async () => {
      try {
        // Update story with full content
        const { error: updateError } = await supabase
          .from("stories")
          .update({
            title: storyContent.title,
            full_story_json: storyContent,
            is_published: true,
            generation_status: "completed",
            progress: 100,
            generation_completed_at: new Date().toISOString(),
          })
          .eq("id", storyId);

        if (updateError) {
          throw new Error(`Failed to update story: ${updateError.message}`);
        }

        // Increment usage count
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: existingUsage } = await supabase
          .from("usage_stats")
          .select("id, story_count")
          .eq("user_id", userId)
          .eq("month_year", currentMonth)
          .single();

        if (existingUsage) {
          await supabase
            .from("usage_stats")
            .update({
              story_count: existingUsage.story_count + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingUsage.id);
        } else {
          await supabase
            .from("usage_stats")
            .insert({
              user_id: userId,
              month_year: currentMonth,
              story_count: 1,
            });
        }

        // Send success event
        await inngest.send({
          name: "story.generation.completed",
          data: {
            storyId,
            title: storyContent.title,
          },
        });
      } catch (error) {
        await supabase
          .from("stories")
          .update({
            generation_status: "failed",
            error_message: `Failed to finalize story: ${error instanceof Error ? error.message : "Unknown error"}`,
            generation_completed_at: new Date().toISOString(),
          })
          .eq("id", storyId);
        throw error;
      }
    });

    return {
      storyId,
      title: storyContent.title,
      status: "completed",
    };
  }
);
