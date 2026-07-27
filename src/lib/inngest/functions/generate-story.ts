import { eq, sql } from "drizzle-orm";
import { inngest } from "../client";
import { db } from "../../db";
import { stories, children, chapterImages, profiles } from "../../db/schema";
import { invalidate, keys, releaseLock } from "../../redis";
import { generateText, generateImageBytes } from "../../vertexai";
import { StoryDocSchema } from "../../types";
import {
  storyImagePublicId,
  storyCoverPublicId,
  childPortraitPublicId,
  uploadStoryImage,
  signedImageUrl,
} from "../../cloudinary";
import {
  buildStorySystemPrompt,
  buildStoryUserPrompt,
} from "../../prompts/story";
import {
  buildCharacterDescriptionPrompt,
  buildHeroPortraitPrompt,
  buildCoverImagePrompt,
  buildChapterImagePrompt,
} from "../../prompts/image";

export const generateStory = inngest.createFunction(
  { id: "generate-story", retries: 1, triggers: [{ event: "story/requested" }] },
  async ({ event, step }) => {
    const { storyId } = (event as unknown as { data: { storyId: string } }).data;

    // Populated once the story row loads, so failure cleanup can release the
    // dedup lock (POST /api/stories) and bust the user-scoped caches.
    let lockInfo: { userId: string; childId: string; blueprint: string } | null = null;

    const fail = async (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      await db.update(stories).set({ status: "failed", error: msg.slice(0, 500) }).where(eq(stories.id, storyId));
      if (lockInfo) {
        await releaseLock(keys.storyLock(lockInfo.userId, lockInfo.childId, lockInfo.blueprint));
        await invalidate(keys.story(lockInfo.userId, storyId), keys.dashboard(lockInfo.userId));
      }
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

      lockInfo = { userId: story.parent_id, childId: story.child_id, blueprint: story.blueprint };

      const child = await step.run("load-child", async () => {
        const [data] = await db
          .select({
            id: children.id,
            nickname: children.nickname,
            age: children.age,
            pronouns: children.pronouns,
            detail_tags: children.detailTags,
            character_description: children.characterDescription,
            portrait_storage_path: children.portraitStoragePath,
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

      // 1b. lock a hero portrait once per child — the visual anchor reused as
      // the image-to-image reference for every chapter + cover so the child
      // looks identical across pages. Skipped if this hero already has one.
      const portraitPath = await step.run("hero-portrait", async () => {
        if (child.portrait_storage_path && child.portrait_storage_path.trim()) return child.portrait_storage_path;
        const prompt = buildHeroPortraitPrompt({
          characterDescription,
          age: child.age ?? 5,
          detailTags: child.detail_tags ?? [],
        });
        const bytes = await generateImageBytes(prompt);
        const publicId = childPortraitPublicId(story.parent_id, child.id);
        const storagePath = await uploadStoryImage(publicId, bytes);
        await db.update(children).set({ portraitStoragePath: storagePath }).where(eq(children.id, child.id));
        await db.update(stories).set({ progress: 15 }).where(eq(stories.id, storyId));
        return storagePath;
      });
      // Signed delivery URL for the portrait — publicly fetchable by BytePlus,
      // fed as the i2i reference into the cover + every chapter render.
      const portraitRef = signedImageUrl(portraitPath);

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
          .set({ title: parsed.title, fullText: parsed.chapters, progress: 25 })
          .where(eq(stories.id, storyId));
        return parsed;
      });

      // 2b. dedicated cover illustration (brand-cover framed), generated against
      // the portrait reference so the cover hero matches the pages.
      await step.run("cover-image", async () => {
        const prompt = buildCoverImagePrompt({
          characterDescription,
          title: doc.title,
          blueprint: story.blueprint,
          age: child.age ?? 5,
          detailTags: child.detail_tags ?? [],
        });
        const bytes = await generateImageBytes(prompt, portraitRef);
        const publicId = storyCoverPublicId(story.parent_id, storyId);
        const storagePath = await uploadStoryImage(publicId, bytes);
        await db
          .update(stories)
          .set({ coverStoragePath: storagePath, coverPrompt: prompt, progress: 33 })
          .where(eq(stories.id, storyId));
      });

      // 3. generate 5 chapter images — each rendered image-to-image from the
      // locked hero portrait, so the character stays identical across pages.
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
          const bytes = await generateImageBytes(prompt, portraitRef);
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
            .set({ progress: Math.min(95, 33 + (i + 1) * 12) })
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

      // Story is done: release the dedup lock and bust the user's caches so the
      // fresh quota/streak + ready state surface immediately (not after TTL).
      await releaseLock(keys.storyLock(story.parent_id, story.child_id, story.blueprint));
      await invalidate(
        keys.quota(story.parent_id),
        keys.dashboard(story.parent_id),
        keys.story(story.parent_id, storyId),
      );

      return { storyId, status: "ready" };
    } catch (err) {
      await fail(err);
    }
  },
);
