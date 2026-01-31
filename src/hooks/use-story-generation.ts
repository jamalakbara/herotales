import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface StoryGenerationStatus {
  status: "pending" | "generating_text" | "generating_images" | "saving" | "completed" | "failed";
  progress: number;
  error: string | null;
  title: string | null;
  isComplete: boolean;
}

export function useStoryGeneration(storyId: string): StoryGenerationStatus {
  const [status, setStatus] = useState<StoryGenerationStatus>({
    status: "pending",
    progress: 0,
    error: null,
    title: null,
    isComplete: false,
  });

  useEffect(() => {
    const supabase = createClient();

    // Fetch initial status
    const fetchInitialStatus = async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("generation_status, progress, error_message, title")
        .eq("id", storyId)
        .single();

      if (data) {
        setStatus({
          status: data.generation_status || "pending",
          progress: data.progress || 0,
          error: data.error_message || null,
          title: data.title || null,
          isComplete: data.generation_status === "completed" || data.generation_status === "failed",
        });
      }

      if (error) {
        console.error("Error fetching story status:", error);
      }
    };

    fetchInitialStatus();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`story:${storyId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "stories",
          filter: `id=eq.${storyId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          setStatus({
            status: newData.generation_status || "pending",
            progress: newData.progress || 0,
            error: newData.error_message || null,
            title: newData.title || null,
            isComplete: newData.generation_status === "completed" || newData.generation_status === "failed",
          });
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [storyId]);

  return status;
}
