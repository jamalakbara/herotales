import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "herotales",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

export type Events = {
  "story/requested": { data: { storyId: string } };
};
