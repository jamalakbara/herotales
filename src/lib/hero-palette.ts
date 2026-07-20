/**
 * Kid-avatar color rotation — the single source for hero swatches across
 * the dashboard kid cards, shelf tabs, and the new-hero picker. Client-safe.
 *
 * --berry/--sage/--moon all fold to one orange in the umano skin, so the
 * rotation cycles the distinct surfaces that remain.
 */
export type HeroSwatch = { bg: string; color: string };

export const AVATAR_SWATCHES: HeroSwatch[] = [
  { bg: "var(--u-orange)", color: "#fff" },
  { bg: "var(--lilac)", color: "var(--twilight)" },
  { bg: "var(--twilight)", color: "#fff" },
  { bg: "var(--cream-deep)", color: "var(--twilight)" },
  { bg: "#fff", color: "var(--u-orange)" },
  { bg: "var(--moon-deep)", color: "#fff" },
  { bg: "var(--ink)", color: "#fff" },
  { bg: "#140906", color: "var(--u-orange)" },
];

/** Positional rotation for kid avatars (kid index % 4) on dashboard + shelf. */
export const KID_PALETTES: HeroSwatch[] = AVATAR_SWATCHES.slice(0, 4);
