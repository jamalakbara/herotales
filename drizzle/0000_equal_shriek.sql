CREATE TYPE "public"."story_blueprint" AS ENUM('Bravery', 'Honesty', 'Patience', 'Kindness', 'Persistence');--> statement-breakpoint
CREATE TYPE "public"."story_length" AS ENUM('Shortie', 'Bedtime', 'Long tale');--> statement-breakpoint
CREATE TYPE "public"."story_status" AS ENUM('pending', 'generating', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "chapter_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid NOT NULL,
	"chapter_index" integer NOT NULL,
	"storage_path" text NOT NULL,
	"public_url" text,
	"prompt" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chapter_images_story_chapter_key" UNIQUE("story_id","chapter_index"),
	CONSTRAINT "chapter_images_index_check" CHECK ("chapter_images"."chapter_index" between 0 and 4)
);
--> statement-breakpoint
CREATE TABLE "children" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" text NOT NULL,
	"nickname" text NOT NULL,
	"age" integer,
	"pronouns" text,
	"detail_tags" text[] DEFAULT '{}' NOT NULL,
	"character_description" text,
	"portrait_url" text,
	"portrait_storage_path" text,
	"gen_seed" text,
	"avatar_idx" smallint DEFAULT 0 NOT NULL,
	"narrator_voice" text DEFAULT 'Juniper' NOT NULL,
	"growth_traits" text[] DEFAULT '{}' NOT NULL,
	"quirk" text,
	"skip_scary" boolean DEFAULT true NOT NULL,
	"short_stories" boolean DEFAULT true NOT NULL,
	"use_real_name" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "children_age_check" CHECK ("children"."age" between 2 and 8)
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"display_name" text,
	"story_quota_monthly" integer DEFAULT 5 NOT NULL,
	"stories_used_this_month" integer DEFAULT 0 NOT NULL,
	"quota_period_start" date DEFAULT current_date NOT NULL,
	"streak_nights" integer DEFAULT 0 NOT NULL,
	"last_read_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" text NOT NULL,
	"child_id" uuid NOT NULL,
	"blueprint" "story_blueprint" NOT NULL,
	"hook" text,
	"length" "story_length" DEFAULT 'Bedtime' NOT NULL,
	"voice" text,
	"status" "story_status" DEFAULT 'pending' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"title" text,
	"full_text" jsonb,
	"favorite" boolean DEFAULT false NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "chapter_images" ADD CONSTRAINT "chapter_images_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "children" ADD CONSTRAINT "children_parent_id_profiles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_parent_id_profiles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chapter_images_story_idx" ON "chapter_images" USING btree ("story_id","chapter_index");--> statement-breakpoint
CREATE INDEX "children_parent_idx" ON "children" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "stories_parent_idx" ON "stories" USING btree ("parent_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "stories_child_idx" ON "stories" USING btree ("child_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "stories_blueprint_idx" ON "stories" USING btree ("blueprint");