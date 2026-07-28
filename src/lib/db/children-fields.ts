import { children } from "@/lib/db/schema";

// Snake-cased projection used by the children API responses (keeps the public
// shape identical to the old Supabase select list).
export const childSelect = {
  id: children.id,
  nickname: children.nickname,
  age: children.age,
  pronouns: children.pronouns,
  detail_tags: children.detailTags,
  character_description: children.characterDescription,
  portrait_storage_path: children.portraitStoragePath,
  avatar_idx: children.avatarIdx,
  narrator_voice: children.narratorVoice,
  growth_traits: children.growthTraits,
  quirk: children.quirk,
  skip_scary: children.skipScary,
  short_stories: children.shortStories,
  use_real_name: children.useRealName,
  created_at: children.createdAt,
};

type ChildInput = Partial<{
  nickname: string;
  age: number;
  pronouns: string;
  detail_tags: string[];
  character_description: string;
  avatar_idx: number;
  narrator_voice: string;
  growth_traits: string[];
  quirk: string;
  skip_scary: boolean;
  short_stories: boolean;
  use_real_name: boolean;
}>;

// Maps the snake_cased zod payload to Drizzle's camelCase columns, skipping
// keys that were not supplied (so PATCH stays partial).
export function toChildColumns(d: ChildInput) {
  const out: Record<string, unknown> = {};
  if (d.nickname !== undefined) out.nickname = d.nickname;
  if (d.age !== undefined) out.age = d.age;
  if (d.pronouns !== undefined) out.pronouns = d.pronouns;
  if (d.detail_tags !== undefined) out.detailTags = d.detail_tags;
  if (d.character_description !== undefined) out.characterDescription = d.character_description;
  if (d.avatar_idx !== undefined) out.avatarIdx = d.avatar_idx;
  if (d.narrator_voice !== undefined) out.narratorVoice = d.narrator_voice;
  if (d.growth_traits !== undefined) out.growthTraits = d.growth_traits;
  if (d.quirk !== undefined) out.quirk = d.quirk;
  if (d.skip_scary !== undefined) out.skipScary = d.skip_scary;
  if (d.short_stories !== undefined) out.shortStories = d.short_stories;
  if (d.use_real_name !== undefined) out.useRealName = d.use_real_name;
  return out;
}
