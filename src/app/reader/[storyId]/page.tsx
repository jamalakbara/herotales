import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { StoryReader } from "@/components/reader/story-reader";
import type { StoryContent } from "@/types/database";

// Prevent static pre-rendering since we need auth
export const dynamic = 'force-dynamic';

interface ReaderPageProps {
  params: Promise<{
    storyId: string;
  }>;
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { storyId } = await params;
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch story with images and child info
  const { data: story, error } = await supabase
    .from("stories")
    .select(`
      *,
      children!inner(nickname, parent_id, character_description),
      story_images(*)
    `)
    .eq("id", storyId)
    .single();

  if (error || !story) {
    notFound();
  }

  // Verify ownership through child's parent_id
  if (story.children.parent_id !== user.id) {
    redirect("/dashboard");
  }

  // Map images to chapters
  const imagesMap = new Map<number, string>(
    story.story_images?.map((img: { chapter_index: number; image_url: string }) =>
      [img.chapter_index, img.image_url] as [number, string]
    )
  );

  return (
    <StoryReader
      storyId={story.id}
      title={story.title || "A Magical Story"}
      childName={story.children.nickname}
      content={story.full_story_json as StoryContent}
      images={imagesMap}
      theme={story.theme}
    />
  );
}
