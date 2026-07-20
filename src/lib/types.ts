import { z } from "zod";

export const BLUEPRINTS = ["Bravery", "Honesty", "Patience", "Kindness", "Persistence"] as const;
export const LENGTHS = ["Shortie", "Bedtime", "Long tale"] as const;
export const VOICES = ["Juniper", "Atlas", "Wren", "My voice"] as const;

export const BlueprintEnum = z.enum(BLUEPRINTS);
export const LengthEnum = z.enum(LENGTHS);
export const VoiceEnum = z.enum(VOICES);

export const STORY_STATUSES = ["pending", "generating", "ready", "failed"] as const;

export type Json = string | number | boolean | null | { [k: string]: Json | undefined } | Json[];
export type StoryStatus = (typeof STORY_STATUSES)[number];
export type StoryBlueprint = (typeof BLUEPRINTS)[number];
export type StoryLength = (typeof LENGTHS)[number];

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

export const CHILD_AGES = ["2", "3", "4", "5", "6", "7", "8"] as const;

export const ChildFieldsSchema = z.object({
  nickname: z.string().min(1).max(40),
  age: z.number().int().min(2).max(8),
  pronouns: z.string().min(1).max(40),
  detail_tags: z.array(z.string().max(60)).max(12).optional(),
  character_description: z.string().max(1000).optional(),
  avatar_idx: z.number().int().min(0).max(7).optional(),
  narrator_voice: z.string().max(40).optional(),
  growth_traits: z.array(z.string().max(60)).max(8).optional(),
  quirk: z.string().max(500).optional(),
  skip_scary: z.boolean().optional(),
  short_stories: z.boolean().optional(),
  use_real_name: z.boolean().optional(),
});
export type ChildFields = z.infer<typeof ChildFieldsSchema>;

export const ChildPatchSchema = ChildFieldsSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: "Empty patch" },
);
export type ChildPatch = z.infer<typeof ChildPatchSchema>;

export const ChildInputSchema = ChildFieldsSchema.pick({
  nickname: true,
  age: true,
  pronouns: true,
  detail_tags: true,
  character_description: true,
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
