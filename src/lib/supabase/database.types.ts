// Hand-written subset of the Supabase schema used by this app.
// Regenerate with `supabase gen types typescript` once the CLI is wired up.

export type Json = string | number | boolean | null | { [k: string]: Json | undefined } | Json[];

export type StoryStatus = "pending" | "generating" | "ready" | "failed";
export type StoryBlueprint = "Bravery" | "Honesty" | "Patience" | "Kindness" | "Persistence";
export type StoryLength = "Shortie" | "Bedtime" | "Long tale";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          story_quota_monthly: number;
          stories_used_this_month: number;
          quota_period_start: string;
          streak_nights: number;
          last_read_date: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          story_quota_monthly?: number;
          stories_used_this_month?: number;
          quota_period_start?: string;
          streak_nights?: number;
          last_read_date?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      children: {
        Row: {
          id: string;
          parent_id: string;
          nickname: string;
          age: number;
          pronouns: string | null;
          detail_tags: string[];
          character_description: string | null;
          portrait_url: string | null;
          portrait_storage_path: string | null;
          gen_seed: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          nickname: string;
          age: number;
          pronouns?: string | null;
          detail_tags?: string[];
          character_description?: string | null;
          portrait_url?: string | null;
          portrait_storage_path?: string | null;
          gen_seed?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["children"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "children_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      stories: {
        Row: {
          id: string;
          parent_id: string;
          child_id: string;
          blueprint: StoryBlueprint;
          hook: string | null;
          length: StoryLength;
          voice: string | null;
          status: StoryStatus;
          progress: number;
          title: string | null;
          full_text: Json | null;
          favorite: boolean;
          error: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          parent_id: string;
          child_id: string;
          blueprint: StoryBlueprint;
          hook?: string | null;
          length?: StoryLength;
          voice?: string | null;
          status?: StoryStatus;
          progress?: number;
          title?: string | null;
          full_text?: Json | null;
          favorite?: boolean;
          error?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["stories"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "stories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stories_child_id_fkey";
            columns: ["child_id"];
            isOneToOne: false;
            referencedRelation: "children";
            referencedColumns: ["id"];
          },
        ];
      };
      chapter_images: {
        Row: {
          id: string;
          story_id: string;
          chapter_index: number;
          storage_path: string;
          public_url: string | null;
          prompt: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          chapter_index: number;
          storage_path: string;
          public_url?: string | null;
          prompt?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chapter_images"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "chapter_images_story_id_fkey";
            columns: ["story_id"];
            isOneToOne: false;
            referencedRelation: "stories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      story_status: StoryStatus;
      story_blueprint: StoryBlueprint;
      story_length: StoryLength;
    };
  };
}
