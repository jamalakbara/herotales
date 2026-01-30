import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { generateStory } from "@/inngest/functions/generate-story";

// Register all Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateStory, // Story generation background job
  ],
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
