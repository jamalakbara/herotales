import { createClient } from "@supabase/supabase-js";

const BUCKET_NAME = "story-images";

// Lazy initialization to avoid build-time errors
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Download image from URL and upload to Supabase Storage
 * This is needed because DALL-E URLs expire after ~1 hour
 */
export async function persistImage(
  imageUrl: string,
  storyId: string,
  chapterIndex: number
): Promise<string> {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Download the image from OpenAI
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const imageBlob = new Uint8Array(imageBuffer);

    // Generate unique filename
    const filename = `${storyId}/chapter-${chapterIndex}-${Date.now()}.png`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filename, imageBlob, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error persisting image:", error);
    throw error;
  }
}

/**
 * Persist multiple images for a story
 */
export async function persistAllImages(
  images: Array<{ url: string }>,
  storyId: string
): Promise<string[]> {
  const persistedUrls: string[] = [];

  for (let i = 0; i < images.length; i++) {
    const persistedUrl = await persistImage(images[i].url, storyId, i + 1);
    persistedUrls.push(persistedUrl);
  }

  return persistedUrls;
}

/**
 * Delete all images for a story
 */
export async function deleteStoryImages(storyId: string): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: files, error: listError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .list(storyId);

  if (listError) {
    console.error("Error listing files:", listError);
    return;
  }

  if (files && files.length > 0) {
    const filePaths = files.map((file) => `${storyId}/${file.name}`);

    const { error: deleteError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (deleteError) {
      console.error("Error deleting files:", deleteError);
    }
  }
}
