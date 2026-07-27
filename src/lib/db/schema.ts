import { sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  integer,
  smallint,
  boolean,
  date,
  timestamp,
  jsonb,
  uuid,
  index,
  unique,
  check,
} from "drizzle-orm/pg-core";
import type { Chapter } from "@/lib/types";

export const storyStatus = pgEnum("story_status", ["pending", "generating", "ready", "failed"]);
export const storyBlueprint = pgEnum("story_blueprint", ["Bravery", "Honesty", "Patience", "Kindness", "Persistence"]);
export const storyLength = pgEnum("story_length", ["Shortie", "Bedtime", "Long tale"]);

// profiles — keyed by Clerk user id (string, e.g. "user_xxx"), not a UUID.
export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email"),
  displayName: text("display_name"),
  storyQuotaMonthly: integer("story_quota_monthly").notNull().default(5),
  storiesUsedThisMonth: integer("stories_used_this_month").notNull().default(0),
  quotaPeriodStart: date("quota_period_start", { mode: "string" }).notNull().default(sql`current_date`),
  streakNights: integer("streak_nights").notNull().default(0),
  lastReadDate: date("last_read_date", { mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const children = pgTable(
  "children",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: text("parent_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    nickname: text("nickname").notNull(),
    age: integer("age"),
    pronouns: text("pronouns"),
    detailTags: text("detail_tags").array().notNull().default(sql`'{}'`),
    characterDescription: text("character_description"),
    portraitUrl: text("portrait_url"),
    portraitStoragePath: text("portrait_storage_path"),
    genSeed: text("gen_seed"),
    avatarIdx: smallint("avatar_idx").notNull().default(0),
    narratorVoice: text("narrator_voice").notNull().default("Juniper"),
    growthTraits: text("growth_traits").array().notNull().default(sql`'{}'`),
    quirk: text("quirk"),
    skipScary: boolean("skip_scary").notNull().default(true),
    shortStories: boolean("short_stories").notNull().default(true),
    useRealName: boolean("use_real_name").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("children_parent_idx").on(t.parentId),
    check("children_age_check", sql`${t.age} between 2 and 8`),
  ],
);

export const stories = pgTable(
  "stories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: text("parent_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    childId: uuid("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    blueprint: storyBlueprint("blueprint").notNull(),
    hook: text("hook"),
    length: storyLength("length").notNull().default("Bedtime"),
    voice: text("voice"),
    status: storyStatus("status").notNull().default("pending"),
    progress: integer("progress").notNull().default(0),
    title: text("title"),
    fullText: jsonb("full_text").$type<Chapter[]>(),
    coverStoragePath: text("cover_storage_path"),
    coverPrompt: text("cover_prompt"),
    favorite: boolean("favorite").notNull().default(false),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true, mode: "string" }),
  },
  (t) => [
    index("stories_parent_idx").on(t.parentId, t.createdAt.desc()),
    index("stories_child_idx").on(t.childId, t.createdAt.desc()),
    index("stories_blueprint_idx").on(t.blueprint),
  ],
);

export const chapterImages = pgTable(
  "chapter_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storyId: uuid("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    chapterIndex: integer("chapter_index").notNull(),
    storagePath: text("storage_path").notNull(),
    publicUrl: text("public_url"),
    prompt: text("prompt"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("chapter_images_story_idx").on(t.storyId, t.chapterIndex),
    unique("chapter_images_story_chapter_key").on(t.storyId, t.chapterIndex),
    check("chapter_images_index_check", sql`${t.chapterIndex} between 0 and 4`),
  ],
);
