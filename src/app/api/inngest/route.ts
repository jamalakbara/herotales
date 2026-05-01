import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { generateStory } from "@/lib/inngest/functions/generate-story";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateStory],
});
