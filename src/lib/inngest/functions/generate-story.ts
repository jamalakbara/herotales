import { inngest } from "../client";
import { adminClient } from "../../supabase/admin";
import { openai } from "../../openai";
import { StoryDocSchema } from "../../types";
import {
  buildStorySystemPrompt,
  buildStoryUserPrompt,
} from "../../prompts/story";
import {
  buildCharacterDescriptionPrompt,
  buildChapterImagePrompt,
} from "../../prompts/image";
import { toFile } from "openai";

const BUCKET = "story-assets";

export const generateStory = inngest.createFunction(
  { id: "generate-story", retries: 1, triggers: [{ event: "story/requested" }] },
  async ({ event, step }) => {
    const { storyId } = (event as unknown as { data: { storyId: string } }).data;
    const sb = adminClient();

    const fail = async (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      await sb.from("stories").update({ status: "failed", error: msg.slice(0, 500) }).eq("id", storyId);
      throw err;
    };

    try {
      const story = await step.run("load-story", async () => {
        const { data, error } = await sb
          .from("stories")
          .select("id, parent_id, child_id, blueprint, hook, length, voice, status")
          .eq("id", storyId)
          .single();
        if (error || !data) throw new Error(error?.message ?? "Story not found");
        return data;
      });

      const child = await step.run("load-child", async () => {
        const { data, error } = await sb
          .from("children")
          .select("id, nickname, age, pronouns, detail_tags, character_description")
          .eq("id", story.child_id)
          .single();
        if (error || !data) throw new Error(error?.message ?? "Child not found");
        return data;
      });

      await step.run("mark-generating", async () => {
        await sb.from("stories").update({ status: "generating", progress: 5, error: null }).eq("id", storyId);
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
        const res = await openai().chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.6,
          messages: [{ role: "user", content: prompt }],
        });
        const desc = res.choices[0]?.message?.content?.trim() ?? "";
        if (!desc) throw new Error("Failed to draft character description");
        await sb.from("children").update({ character_description: desc }).eq("id", child.id);
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
        });
        const usrPrompt = buildStoryUserPrompt({
          hook: story.hook,
          detailTags: child.detail_tags ?? [],
        });
        const res = await openai().chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.85,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: sysPrompt },
            { role: "user", content: usrPrompt },
          ],
        });
        const raw = res.choices[0]?.message?.content;
        if (!raw) throw new Error("Empty story response");
        const parsed = StoryDocSchema.parse(JSON.parse(raw));
        await sb
          .from("stories")
          .update({ title: parsed.title, full_text: parsed.chapters, progress: 30 })
          .eq("id", storyId);
        return parsed;
      });

      // 3. generate 5 chapter images
      let firstImageBytes: Buffer | null = null;

      for (let i = 0; i < 5; i++) {
        const chapter = doc.chapters[i];
        const stepName = `chapter-${i}-image`;
        const result = await step.run(stepName, async () => {
          const prompt = buildChapterImagePrompt({
            characterDescription,
            caption: chapter.caption,
            chapterIndex: i,
            blueprint: story.blueprint,
          });

          let b64: string | undefined;
          if (i === 0 || !firstImageBytes) {
            const r = await openai().images.generate({
              model: "gpt-image-1",
              prompt,
              size: "1024x1024",
              n: 1,
            });
            b64 = r.data?.[0]?.b64_json;
          } else {
            const ref = await toFile(firstImageBytes, "chapter-0.png", { type: "image/png" });
            const r = await openai().images.edit({
              model: "gpt-image-1",
              image: ref,
              prompt,
              size: "1024x1024",
              input_fidelity: "high",
              n: 1,
            });
            b64 = r.data?.[0]?.b64_json;
          }
          if (!b64) throw new Error(`No image bytes for chapter ${i}`);
          const bytes = Buffer.from(b64, "base64");
          const path = `users/${story.parent_id}/stories/${storyId}/chapter-${i}.png`;
          const { error: upErr } = await sb.storage
            .from(BUCKET)
            .upload(path, bytes, { contentType: "image/png", upsert: true });
          if (upErr) throw new Error(`Storage upload failed: ${upErr.message}`);
          const { error: insErr } = await sb.from("chapter_images").upsert(
            {
              story_id: storyId,
              chapter_index: i,
              storage_path: path,
              prompt,
            },
            { onConflict: "story_id,chapter_index" },
          );
          if (insErr) throw new Error(`chapter_images insert failed: ${insErr.message}`);
          await sb
            .from("stories")
            .update({ progress: Math.min(95, 30 + (i + 1) * 13) })
            .eq("id", storyId);
          return { path, b64 };
        });

        if (i === 0) firstImageBytes = Buffer.from(result.b64, "base64");
      }

      await step.run("mark-ready", async () => {
        await sb
          .from("stories")
          .update({ status: "ready", progress: 100, completed_at: new Date().toISOString() })
          .eq("id", storyId);
      });

      return { storyId, status: "ready" };
    } catch (err) {
      await fail(err);
    }
  },
);
