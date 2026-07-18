import { eq, sql } from "drizzle-orm";
import { inngest } from "../client";
import { db } from "../../db";
import { stories, children, chapterImages, profiles } from "../../db/schema";
import { generateText, generateImageBytes } from "../../vertexai";
import { StoryDocSchema } from "../../types";
import { storyImagePublicId, uploadStoryImage } from "../../cloudinary";
import {
  buildStorySystemPrompt,
  buildStoryUserPrompt,
} from "../../prompts/story";
import {
  buildCharacterDescriptionPrompt,
  buildChapterImagePrompt,
} from "../../prompts/image";

export const generateStory = inngest.createFunction(
  { id: "generate-story", retries: 1, triggers: [{ event: "story/requested" }] },
  async ({ event, step }) => {
    const { storyId } = (event as unknown as { data: { storyId: string } }).data;

    const fail = async (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      await db.update(stories).set({ status: "failed", error: msg.slice(0, 500) }).where(eq(stories.id, storyId));
      throw err;
    };

    try {
      const story = await step.run("load-story", async () => {
        const [data] = await db
          .select({
            id: stories.id,
            parent_id: stories.parentId,
            child_id: stories.childId,
            blueprint: stories.blueprint,
            hook: stories.hook,
            length: stories.length,
            voice: stories.voice,
            status: stories.status,
          })
          .from(stories)
          .where(eq(stories.id, storyId));
        if (!data) throw new Error("Story not found");
        return data;
      });

      const child = await step.run("load-child", async () => {
        const [data] = await db
          .select({
            id: children.id,
            nickname: children.nickname,
            age: children.age,
            pronouns: children.pronouns,
            detail_tags: children.detailTags,
            character_description: children.characterDescription,
            growth_traits: children.growthTraits,
            quirk: children.quirk,
            skip_scary: children.skipScary,
            short_stories: children.shortStories,
            narrator_voice: children.narratorVoice,
          })
          .from(children)
          .where(eq(children.id, story.child_id));
        if (!data) throw new Error("Child not found");
        return data;
      });

      await step.run("mark-generating", async () => {
        await db.update(stories).set({ status: "generating", progress: 5, error: null }).where(eq(stories.id, storyId));
      });

      // 1. ensure character description exists (locked master desc)
      const characterDescription = await step.run("character-description", async () => {
        if (child.character_description && child.character_description.trim()) return child.character_description;
        const prompt = buildCharacterDescriptionPrompt({
          nickname: child.nickname,
          age: child.age ?? 5,
          pronouns: child.pronouns ?? "they/them",
          detailTags: child.detail_tags ?? [],
          description: null,
        });
        const desc = await generateText(prompt, "You are a creative writer helping describe child characters for illustrated stories. Invent distinctive, varied appearances so different heroes never look alike.", 0.9);
        if (!desc) throw new Error("Failed to draft character description");
        await db.update(children).set({ characterDescription: desc }).where(eq(children.id, child.id));
        return desc;
      });

      // 2. generate story text JSON
      const doc = await step.run("generate-text", async () => {
        const sysPrompt = buildStorySystemPrompt({
          nickname: child.nickname,
          age: child.age ?? 5,
          pronouns: child.pronouns ?? "they/them",
          blueprint: story.blueprint,
          length: story.length ?? "Bedtime",
          skipScary: child.skip_scary ?? true,
          shortStories: child.short_stories ?? false,
        });
        const usrPrompt = buildStoryUserPrompt({
          hook: story.hook,
          detailTags: child.detail_tags ?? [],
          growthTraits: child.growth_traits ?? [],
          quirk: child.quirk,
        });
        const raw = await generateText(usrPrompt, sysPrompt, 0.85, true);
        if (!raw) throw new Error("Empty story response");
        const parsed = StoryDocSchema.parse(JSON.parse(raw));
        await db
          .update(stories)
          .set({ title: parsed.title, fullText: parsed.chapters, progress: 30 })
          .where(eq(stories.id, storyId));
        return parsed;
      });

      // 3. generate 5 chapter images independently (character consistency via prompt)
      for (let i = 0; i < 5; i++) {
        const chapter = doc.chapters[i];
        const stepName = `chapter-${i}-image`;
        await step.run(stepName, async () => {
          const prompt = buildChapterImagePrompt({
            characterDescription,
            caption: chapter.caption,
            chapterIndex: i,
            blueprint: story.blueprint,
            age: child.age ?? 5,
            detailTags: child.detail_tags ?? [],
          });
          const bytes = await generateImageBytes(prompt);
          const publicId = storyImagePublicId(story.parent_id, storyId, i);
          const storagePath = await uploadStoryImage(publicId, bytes);
          await db
            .insert(chapterImages)
            .values({ storyId, chapterIndex: i, storagePath, prompt })
            .onConflictDoUpdate({
              target: [chapterImages.storyId, chapterImages.chapterIndex],
              set: { storagePath, prompt },
            });
          await db
            .update(stories)
            .set({ progress: Math.min(95, 30 + (i + 1) * 13) })
            .where(eq(stories.id, storyId));
          return { publicId };
        });
      }

      // 4. mark ready + fold in the old handle_story_ready trigger (quota + streak)
      await step.run("mark-ready", async () => {
        await db
          .update(stories)
          .set({ status: "ready", progress: 100, completedAt: new Date().toISOString() })
          .where(eq(stories.id, storyId));
        await db
          .update(profiles)
          .set({
            storiesUsedThisMonth: sql`${profiles.storiesUsedThisMonth} + 1`,
            streakNights: sql`case
              when ${profiles.lastReadDate} = current_date then ${profiles.streakNights}
              when ${profiles.lastReadDate} = current_date - interval '1 day' then ${profiles.streakNights} + 1
              else 1 end`,
            lastReadDate: sql`current_date`,
          })
          .where(eq(profiles.id, story.parent_id));
      });

      return { storyId, status: "ready" };
    } catch (err) {
      await fail(err);
    }
  },
);
