import { Inngest, EventSchemas } from "inngest";

// Define event schemas for type safety
type Events = {
  "story.generation.requested": {
    data: {
      storyId: string;
      childId: string;
      theme: string;
      userId: string;
    };
  };
  "story.generation.progress": {
    data: {
      storyId: string;
      status: string;
      progress: number;
    };
  };
  "story.generation.completed": {
    data: {
      storyId: string;
      title: string;
    };
  };
  "story.generation.failed": {
    data: {
      storyId: string;
      error: string;
    };
  };
};

// Create Inngest client instance
export const inngest = new Inngest({
  id: "herotales",
  name: "HeroTales AI Story Generator",
  schemas: new EventSchemas().fromRecord<Events>(),
  // Event key for sending events from your application
  eventKey: process.env.INNGEST_EVENT_KEY,
});
