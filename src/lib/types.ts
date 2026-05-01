import { z } from "zod";

export const BLUEPRINTS = ["Bravery", "Honesty", "Patience", "Kindness", "Persistence"] as const;
export const LENGTHS = ["Shortie", "Bedtime", "Long tale"] as const;
export const VOICES = ["Juniper", "Atlas", "Wren", "My voice"] as const;

export const BlueprintEnum = z.enum(BLUEPRINTS);
export const LengthEnum = z.enum(LENGTHS);
export const VoiceEnum = z.enum(VOICES);

export const ChapterSchema = z.object({
  label: z.string(),
  title: z.string(),
  caption: z.string(),
  chip: z.string(),
  paras: z.array(z.string()).min(1),
});
export type Chapter = z.infer<typeof ChapterSchema>;

export const StoryDocSchema = z.object({
  title: z.string().min(1),
  chapters: z.array(ChapterSchema).length(5),
});
export type StoryDoc = z.infer<typeof StoryDocSchema>;

export const ChildInputSchema = z.object({
  nickname: z.string().min(1).max(40),
  age: z.number().int().min(2).max(8),
  pronouns: z.string().min(1).max(40),
  detail_tags: z.array(z.string().max(60)).max(12).default([]),
  character_description: z.string().max(1000).optional(),
});
export type ChildInput = z.infer<typeof ChildInputSchema>;

export const StoryRequestSchema = z.object({
  child_id: z.string().uuid().optional(),
  child: ChildInputSchema.optional(),
  blueprint: BlueprintEnum,
  length: LengthEnum.default("Bedtime"),
  voice: VoiceEnum.default("Juniper"),
  hook: z.string().max(240).optional(),
}).refine((v) => v.child_id || v.child, {
  message: "Provide child_id or child",
});
export type StoryRequest = z.infer<typeof StoryRequestSchema>;
