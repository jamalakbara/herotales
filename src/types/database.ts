/**
 * Database types for HeroTales AI
 * Based on DATABASE_SCHEMA.SQL
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Story chapter structure stored in full_story_json
export interface StoryChapter {
  chapterNumber: number;
  title: string;
  content: string;
  imagePrompt?: string;
}

export interface StoryContent {
  title: string;
  theme: ThemeType;
  chapters: StoryChapter[];
  moral: string;
}

// Value Blueprint Themes
export type ThemeType =
  | "bravery"
  | "honesty"
  | "patience"
  | "kindness"
  | "persistence";

export const THEME_LABELS: Record<ThemeType, string> = {
  bravery: "Bravery - Overcoming Fear",
  honesty: "Honesty - Accountability",
  patience: "Patience - Waiting & Growth",
  kindness: "Kindness - Empathy",
  persistence: "Persistence - Resilience",
};

export const THEME_ICONS: Record<ThemeType, string> = {
  bravery: "🦁",
  honesty: "💎",
  patience: "🌱",
  kindness: "💝",
  persistence: "🏔️",
};

// Gender type for children
export type GenderType = "boy" | "girl";

// Database table types
export interface Database {
  public: {
    Tables: {
      children: {
        Row: {
          id: string;
          parent_id: string;
          nickname: string;
          age_group: number;
          gender: GenderType;
          character_description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          nickname: string;
          age_group: number;
          gender: GenderType;
          character_description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string;
          nickname?: string;
          age_group?: number;
          gender?: GenderType;
          character_description?: string | null;
          created_at?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          child_id: string;
          theme: ThemeType;
          title: string | null;
          full_story_json: StoryContent | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          theme: ThemeType;
          title?: string | null;
          full_story_json?: StoryContent | null;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          theme?: ThemeType;
          title?: string | null;
          full_story_json?: StoryContent | null;
          is_published?: boolean;
          created_at?: string;
        };
      };
      story_images: {
        Row: {
          id: string;
          story_id: string;
          chapter_index: number;
          image_url: string;
          openai_gen_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          chapter_index: number;
          image_url: string;
          openai_gen_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          chapter_index?: number;
          image_url?: string;
          openai_gen_id?: string | null;
          created_at?: string;
        };
      };
      story_audio: {
        Row: {
          id: string;
          story_id: string;
          chapter_index: number;
          audio_url: string;
          duration_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          chapter_index: number;
          audio_url: string;
          duration_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          chapter_index?: number;
          audio_url?: string;
          duration_seconds?: number | null;
          created_at?: string;
        };
      };
    };
  };
}

// Convenience types
export type Child = Database["public"]["Tables"]["children"]["Row"];
export type ChildInsert = Database["public"]["Tables"]["children"]["Insert"];
export type ChildUpdate = Database["public"]["Tables"]["children"]["Update"];

export type Story = Database["public"]["Tables"]["stories"]["Row"];
export type StoryInsert = Database["public"]["Tables"]["stories"]["Insert"];
export type StoryUpdate = Database["public"]["Tables"]["stories"]["Update"];

export type StoryImage = Database["public"]["Tables"]["story_images"]["Row"];
export type StoryImageInsert = Database["public"]["Tables"]["story_images"]["Insert"];
export type StoryImageUpdate = Database["public"]["Tables"]["story_images"]["Update"];

export type StoryAudio = Database["public"]["Tables"]["story_audio"]["Row"];
export type StoryAudioInsert = Database["public"]["Tables"]["story_audio"]["Insert"];
export type StoryAudioUpdate = Database["public"]["Tables"]["story_audio"]["Update"];

// Extended types with relationships
export interface StoryWithImages extends Story {
  images: StoryImage[];
}

export interface StoryWithChild extends Story {
  child: Child;
}

export interface ChildWithStories extends Child {
  stories: Story[];
  story_count?: number;
}

export interface StoryWithAudio extends Story {
  audio: StoryAudio[];
}

// Profile types for subscription management
export interface Profile {
  id: string;
  stripe_customer_id: string | null;
  subscription_status: string;
  subscription_id: string | null;
  subscription_end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageStats {
  id: string;
  user_id: string;
  month_year: string;
  story_count: number;
  created_at: string;
  updated_at: string;
}
