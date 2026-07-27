import { coverAccent, type CoverAccent } from "@/components/book-cover";
import type { StoryStatus } from "@/lib/types";

/**
 * Shared display helpers for story list rows — the single source of truth for
 * the book-card view model used on the dashboard shelf, the full shelf, and
 * the keepsake picker. Client-safe: no server imports.
 */

/** Story row as returned by `/api/stories` and `/api/dashboard`. */
export type StoryListItem = {
  id: string;
  child_id: string;
  blueprint: string;
  length?: string;
  voice?: string | null;
  status: StoryStatus;
  progress: number;
  title: string | null;
  cover_url?: string | null;
  favorite: boolean;
  created_at: string;
  completed_at?: string | null;
  children: { nickname: string } | { nickname: string }[] | null;
};

/** Glyph shown in the cover's star circle, per blueprint/value. */
export const THEME_STAR: Record<string, string> = {
  Bravery: "★",
  Honesty: "✦",
  Patience: "⟲",
  Kindness: "♡",
  Persistence: "↑",
};

/**
 * Picker/nudge glyphs per blueprint (Honesty = "✓"). Cover star glyphs live
 * in THEME_STAR above (Honesty = "✦") — distinct on purpose, do not merge.
 */
export const BLUEPRINT_ICONS: Record<string, string> = {
  Bravery: "★",
  Honesty: "✓",
  Patience: "⟲",
  Kindness: "♡",
  Persistence: "↑",
};

export function themeStar(blueprint: string): string {
  return THEME_STAR[blueprint] ?? "✦";
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const wks = Math.round(days / 7);
  if (wks < 4) return `${wks} week${wks === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

/** Split a title into a serif first line + script second line for the cover. */
export function splitTitle(title: string): { line1: string; line2: string } {
  const words = title.trim().split(/\s+/);
  if (words.length <= 3) return { line1: words.join(" "), line2: "" };
  const mid = Math.ceil(words.length / 2);
  return { line1: words.slice(0, mid).join(" "), line2: words.slice(mid).join(" ") };
}

/** Hero nickname from the joined `children` relation (object or array). */
export function pickName(children: StoryListItem["children"]): string {
  if (!children) return "";
  return Array.isArray(children) ? children[0]?.nickname ?? "" : children.nickname;
}

export type BookBadge = { text: string; accent: "berry" | "sage" | "moon" };

/** Everything a book card needs — cover props + caption fields. */
export type BookView = {
  id: string;
  accent: CoverAccent;
  coverUrl?: string | null;
  badge?: BookBadge;
  label: string;
  title: string;
  script: string;
  theme: string;
  star: string;
  infoTitle: string;
  forKid: string;
  when: string;
  href: string;
};

/** Map an API story row to the shared book-card view model. */
export function storyToBook(s: StoryListItem, i: number, opts?: { badge?: BookBadge }): BookView {
  const t = s.title ?? "Untitled tale";
  const { line1, line2 } = splitTitle(t);
  const badge: BookBadge | undefined =
    opts?.badge ??
    (s.status === "failed"
      ? { text: "Failed", accent: "berry" }
      : s.status !== "ready"
        ? { text: "In progress", accent: "berry" }
        : s.favorite
          ? { text: "Favorite ♡", accent: "moon" }
          : undefined);
  return {
    id: s.id,
    accent: coverAccent(i),
    coverUrl: s.cover_url ?? null,
    badge,
    label: s.status === "ready" ? "Complete · 5 chapters" : s.status === "failed" ? "Didn't finish" : `Conjuring · ${s.progress}%`,
    title: line1,
    script: line2,
    theme: s.blueprint,
    star: themeStar(s.blueprint),
    infoTitle: t,
    forKid: pickName(s.children),
    when: timeAgo(s.created_at),
    href: `/stories/${s.id}`,
  };
}
