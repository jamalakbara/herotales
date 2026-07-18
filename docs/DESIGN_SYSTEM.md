# TellTales — Design System

**Version:** 2.0 — umano re-skin
**Source of truth:** `src/app/globals.css` (global tokens + landing/app classes) and `src/app/(auth)/auth-form.module.css` (auth-only CSS Module).
**Aesthetic:** Modern studio — flat off-white surfaces, **bold orange (`#FF692E`)**, near-black display, **soft blurred elevation** (no borders), Playfair Display headings + Inter UI, momentum smooth-scroll and scroll-linked motion. Modelled 1:1 on umanodesign.studio, expressed with TellTales content.

> **v2 note:** The original v1 "storybook" system (cream paper, hard ink offset shadows, Young Serif/Caprasimo/Nunito) was replaced by this umano skin. The **CSS variable names were kept** (`--cream`, `--ink`, `--moon`, `--berry`, `--font-young-serif`, …) and repointed to umano values, so existing classes carried over. Where this doc still describes hard-shadow/border behaviour for legacy inline-styled app surfaces, those are residual and being migrated to the soft-shadow tokens below.

This document describes the design system as it actually exists in the codebase. Treat it as the reference when building or reviewing UI. See `.claude/rules/design-system.md` for the enforcement rules.

---

## 1. Design principles

1. **Storybook warmth over flat SaaS.** Cream background, hand-drawn feel, dashed paper lines, star/moon/cloud decorations.
2. **Ink outline + hard shadow.** Almost every surface uses a `2–2.5px solid var(--ink)` border and a hard offset shadow (`Npx Npx 0 var(--ink)`), never a soft blur. This is the signature look.
3. **Tactile press.** Interactive elements translate on hover (lift) and on active (press into the shadow). Reuse the existing hover/active pattern; don't invent new easing.
4. **Type hierarchy = 3 fonts, fixed roles.** Serif for headings, script for accents/kickers, sans for body/UI. Never swap these roles.
5. **Motion is ambient, not urgent.** Slow floats, twinkles, drifts (3–8s loops). Always gated by `prefers-reduced-motion`.
6. **Accessibility floor.** All decorative motion must respect `@media (prefers-reduced-motion: reduce)`.

---

## 2. Color tokens

Defined twice, intentionally: as Tailwind v4 `@theme` colors (`--color-*`, usable as `bg-moon` etc.) **and** as raw CSS variables on `:root` (`--moon`, used directly in `globals.css`). Keep both in sync when adding a color.

Token **names are the legacy ones**, repointed to umano values (so old classes still work). Kept in sync as Tailwind v4 `@theme` colors (`--color-*`) and `:root` vars (`--*`).

| Role | `@theme` name | `:root` var | Hex |
| --- | --- | --- | --- |
| Page background (off-white) | `--color-cream` | `--cream` | `#FAFAFA` |
| Raised surface / nav pill | `--color-cream-deep` | `--cream-deep` | `#F0F0F0` |
| Dividers / rules | `--color-paper-line` | `--paper-line` | `#E4E4E4` |
| Primary text (near-black) | `--color-ink` | `--ink` | `#141013` |
| Secondary text (grey) | `--color-ink-soft` | `--ink-soft` | `#5A5F6B` |
| Dark surface (stories/FAQ) | `--color-twilight` | `--twilight` | `#141217` |
| Deepest surface | `--color-twilight-deep` | `--twilight-deep` | `#0C0B0F` |
| Primary accent (orange) | `--color-moon` | `--moon` | `#FF692E` |
| Orange pressed | `--color-moon-deep` | `--moon-deep` | `#E24E12` |
| Primary CTA (orange) | `--color-berry` | `--berry` | `#FF692E` |
| CTA pressed | `--color-berry-deep` | `--berry-deep` | `#E24E12` |
| (folded → orange) | `--color-sage` | `--sage` | `#FF692E` |
| (folded → light grey) | `--color-lilac` | `--lilac` | `#E4E4E4` |

Plus umano elevation tokens on `:root`: `--u-orange: #FF692E`, `--u-card-shadow: 0 12px 32px rgba(0,0,0,.10)`, `--u-card-shadow-lg: 0 16px 48px rgba(0,0,0,.14)`, `--u-radius: 16px`.

**Usage rules**
- Palette is essentially **orange + near-black + white + grey**. Orange is the only accent (CTAs, active links, kickers, checks). Text on orange = near-black `#140906`; text on dark surfaces = white / `rgba(251,243,227,.7–.82)`.
- Elevation is **soft blurred shadow, no border** (`--u-card-shadow` / `-lg`). The hero is flat orange; the page is flat `#FAFAFA` (no grain/glow).
- CTA buttons: black pill on light/orange backgrounds, orange pill for the primary "convert" action. Radius `43px`.

---

## 3. Elevation & borders

- **No borders.** Surfaces are borderless; separation comes from soft shadow + background contrast.
- **Soft shadow scale:** cards use `var(--u-card-shadow)` (`0 12px 32px rgba(0,0,0,.10)`); elevated/floating surfaces (hero mock, notification, footer, featured plan) use `var(--u-card-shadow-lg)` (`0 16px 48px rgba(0,0,0,.14)`). Nav pill uses a whisper `0 10px 30px rgba(0,0,0,.08)`.
- **Radius scale:** `43px`/`55px` (pill buttons / nav pill) · `24–28px` (big cards, footer, dark sections) · `14–18px` (cards, media, mock) · `44px` hero bottom corners.
- **Interaction:** buttons lift `translateY(-1px)` on hover (no shadow-grow), no hard press. Scroll drives the primary motion, not hover.

> Legacy note: some app-page surfaces still carry inline `Npx Npx 0 var(--ink)` hard shadows + `2–2.5px` borders from v1; with `--ink` now near-black they read as thin black outlines. Migrate these to the soft tokens above when touched.

---

## 4. Typography

Fonts loaded in `src/app/layout.tsx` via `next/font/google`, exposed as CSS variables:

Variable names are the legacy ones, repointed to the umano type system (`AM Le Cygne` is proprietary → **Playfair Display**, umano's own declared fallback).

| Variable | Font | Role |
| --- | --- | --- |
| `--font-young-serif` | Playfair Display (400/700/900) | Display headings: `h1`, section/step/card titles, prices. Class `.display`. |
| `--font-caprasimo` | Playfair Display italic (600/700) | Italic display accents: "highlight" words, kickers. Class `.script`. |
| `--font-nunito` | Inter (400–800) | Body + all UI text, buttons, inputs, logo wordmark. Default `body` font. |

- Base body: `16px`, Inter. Headings are Playfair with tight tracking (`-0.03em`); umano h1 ≈ `72/78`, big display h2 ≈ `115/109`.
- Heading sizes are fluid: `clamp(48px, 5.8vw, 92px)` hero, `clamp(40px, 4.2vw, 64px)` section, `clamp(38–40px, 4–4.4vw, 54–60px)` page/form titles.
- **Accent word pattern:** a highlighted word uses `--font-caprasimo`, `--berry` color, and a `--moon` marker bar drawn with `::after` rotated `-1deg` behind the text (`z-index:-1`). See `h1.hero-title .highlight`.
- Kickers: Caprasimo, `--berry`, small, rotated `-1.5deg` to `-2deg`.
- Uppercase micro-labels (field labels, eyebrows, book labels): weight `700–800`, `letter-spacing 0.04–0.18em`, `text-transform: uppercase`.
- Monospace (`'JetBrains Mono', ui-monospace, monospace`) only for meta/counters (char counts, placeholder labels).

---

## 5. Spacing & layout

- **Page width:** `max-width: 1400px`, centered. Section padding `100px 48px`; hero `40px 48px 120px`; app pages (`.page`) `20px 48px 80px`.
- **Grid gaps:** large columns `40–80px`; card grids `10–24px`.
- Named grids: hero `1.05fr 1fr`, how-it-works `1fr 1fr`, builder `1.15fr 1fr`, blueprint/pricing/features `repeat(3–5, 1fr)`, footer `2fr 1fr 1fr 1fr`.
- **Breakpoints:** `960px` (landing collapses multi-col → 1fr, blueprint grid → 2col, nav-links hidden, padding → 24px), `1080px` + `720px` (auth module). Mobile large-panel padding drops to `48px 28px`.

---

## 6. Core components (class contracts)

Landing + app pages use **global classes** in `globals.css`. The auth pages (`/sign-in`, `/sign-up`) use a **CSS Module** (`auth-form.module.css`) with camelCase class names. Match the surface you're in.

### Buttons — `.btn`
Pill, `2px solid --ink`, `3px` hard shadow, weight `800`, hover lift, active press.
- Variants: `.btn-berry` (primary CTA, cream text), `.btn-twilight` (dark), `.btn-ghost` (transparent, no shadow/border), `.btn-lg` (bigger padding/size).
- Disabled: `.btn[disabled]` → `opacity: 0.45; pointer-events: none`.
- Auth submit is `.submit` (module) — same anatomy, berry fill, full width.

### Eyebrow / pill label — `.eyebrow`
Cream-deep pill, `1.5px` ink border, uppercase, with a berry `.dot` that has a soft glow ring.

### Cards
- `.bp-card` (blueprint value card): cream, `2px` ink, `4px` shadow, `min-height 220px`, hover lift to `6–8px`, colored `.bp-icon` by nth-child.
- `.feature`: cream-deep, `2px` ink, `5px` shadow; 2nd nudged down `20px`, 3rd is sage with cream text.
- `.plan`: cream, `2.5px` ink, `6px` shadow; `.featured` is twilight, lifted `-12px`, with rotated `.plan-badge`.
- `.form-card` / `.formCard`: cream, `2.5px` ink, `8–10px` shadow — the primary form container.

### Book cover — `<BookCover>` (`src/components/book-cover.tsx`)
Shared React primitive for the "story book spine" card on the dashboard shelf, the full shelf, and the keepsake picker — the single source of truth for that markup (previously copy-pasted three ways). Presentational: pages own the wrapper (`Link` / selectable `div`) + the info block below.
- **Cover box:** `aspectRatio 5/6.4`, radius `6px 12px 12px 6px`, `2.5px` ink border, hard offset shadow, left spine hairline, `overflow: hidden`. Layout = uppercase kicker `label` + Young-Serif `title` + Caprasimo `script` accent, then a bottom row (`theme` left; `star` glyph in a circle, or `footerRight` text, on the right).
- **Accents:** `CoverAccent` (`berry / twilight / sage / moon / lilac / cream`) maps to bg + fg + light/dark; light covers flip spine, star-circle bg, and script colour to ink. Rotate positional colours with `coverAccent(i)` over `COVER_ACCENTS` (single ordering — do not redefine per page). `accentColors(accent)` returns `{background,color}` for mini spine thumbnails (shelf list rows).
- **Sizes:** `lg` (dashboard), `md` (shelf, animated), `sm` (keepsake — no star, tighter). `size` drives padding, font sizes, star size, base shadow.
- **Props:** `badge` `{text, accent}` (auto colour), `selected` (moon `3px` border + grown shadow), `overlay` (absolute node, e.g. selection check), `animated` (opt-in shelf hover twinkle/wiggle/shadow-grow via `dash-bc-*-anim`; off = static, e.g. dashboard), `coverClassName` (e.g. `kp-pick-cov` hover shadow), `className`/`style` (wrapper).

### Inputs & selectable chips
- `.txt-input` / `.hook`: cream-deep fill, `2px` ink, inset soft shadow, focus → berry border + cream fill. Auth `.field input` adds a leading icon slot and berry focus shadow.
- Chip pickers (`.age-chip`, `.pron-chip`, `.tag`, `.bp-opt`, `.voice-opt`, `.length-opt`, `.suggest-chip`): cream-deep resting, hover translate, `.active` fills with an accent (moon/berry/sage/twilight) + hard shadow. Selection = filled accent + shadow, never just a color text change.
- `.tag-input`: pill-shaped inline text input inside `.tag-picker` for the "+ add your own" flow. Cream fill, `2px` ink, `999px` radius, Nunito 700, hard `2px` ink offset shadow at rest; focus → berry border + grown `3px` shadow (matches other inputs). Committed custom details render as `.tag.active` chips.

### Nav — `<FloatingNav>` (`src/components/floating-nav.tsx`)
One fixed, centered **pill** nav for the whole app (replaces the old `Nav` / `DashboardNav` / `ReaderNav` — do not reintroduce those). Cream fill, `2px` ink border, `999px` radius, `5px` hard offset shadow (`.fnav-pill`); condenses to a `4px` shadow past `60px` scroll. Logo reuses `.logo` + `.logo-mark`. Three variants via one prop:
- `variant="marketing"` — landing. Section links (`.fnav-link`, active = `--berry`) driven by an `IntersectionObserver` over `#how / #stories / #pricing / #faq`; links are hidden over the hero and expand once scrolled (`.fnav-collapse`). CTA = `.btn-berry`.
- `variant="app"` — dashboard/shelf/keepsake/heroes. Home/Shelf/New/Keepsake links (active = current route) + `+ New story` CTA + Clerk user menu (`.fnav-avatar` → `.fnav-menu`).
- `variant="reader"` — story create/read. `.nav-crumbs` breadcrumb trail + optional right-hand `action` slot.

Because the nav is fixed, `body` carries `padding-top: 84px`; the landing hero tucks back under it with `margin-top: -84px`.

### Big panels
`.blueprints`, `.quote-section`, `.cta-strip` share the pattern: rounded `32px`, colored surface (twilight/berry), `2.5px` ink, `10px` shadow, dotted-starfield `::before`, decorative circles.

### Transit / loading screen — `.screen` / `.card` (`sso-callback.module.css`)
Full-viewport branded wait state for auth redirects (OAuth `/sso-callback`). `.screen` = `100dvh` grid-centered on `--cream`. `.card` = centered column, `28px` radius, `2.5px` ink, `8px` hard shadow on `--cream-deep` (matches `.form-card` elevation). Contents: floating `.mark` (twilight circle + moon inner dot + `4px` moon shadow — the `.logo-mark` primitive scaled to `56px`, `float` loop), Caprasimo `.eyebrow`, Young Serif `.title`, Nunito `.sub`, and a three-dot `.dots` row reusing `pulseDot` with staggered delays (`0 / .2s / .4s`). All motion disabled under `prefers-reduced-motion`. Use for any "finishing sign-in / provisioning" transit, not for inline button spinners.

---

## 7. Decorative & motion vocabulary

Reusable decorations: `.star-decor` (moon star via `clip-path` polygon), `.moon-decor` (circle with inset crescent shadow), `.cloud-decor` (lilac pill + two pseudo-puffs), starfield backgrounds via layered `radial-gradient` dots, dashed paper dividers (`1.5–2px dashed --paper-line`).

Global page texture: `body::before` (three soft radial color glows) + `body::after` (SVG fractal-noise grain, `mix-blend-mode: multiply`). Content sits at `z-index: 2`.

Named animation loops (keep names; reuse rather than redefine): `float` (6s ambient bob, `--r` rotation var), `twinkle`/`spTwinkle` (star pulse), `moonDrift`, `shoot` (shooting star), `rise` (sparkle float-up), `fillIn`, `playPulse`, `pulseDot`, `spFloat`. All ambient loops are 2.4–8s and **must** be disabled under `prefers-reduced-motion: reduce`.

### Scroll & entrance motion — Framer Motion primitives (`src/components/motion/`)

The landing composition is modelled on a scroll-driven agency layout, rendered in TellTales tokens (this is **layout/motion only — palette, fonts, and the hard-offset-shadow elevation are unchanged**). Scroll effects use **`framer-motion`** (dependency). Reusable client primitives — always prefer these over hand-rolling scroll logic:

- `<Reveal>` — fade + slide-up entrance, plays **on mount** (mount-based, not scroll-observer-gated, so it can't stick under React StrictMode's dev double-mount). Takes `delay` / `index` (stagger) / `y`.
- `<ScrollHighlightText text=…>` — big Young Serif statement whose words fill `--paper-line → --ink` as it scrolls through the viewport (`useScroll` + `useTransform`).
- `<HorizontalScroll>` — pins a section and translates its track on X as you scroll Y; falls back to a normal horizontal-scroll row under reduced motion.
- `<FannedCards>` — cards fan out into a tilted spread on scroll (the dark "story lessons" section).
- `<Accordion items=…>` — single-open FAQ with `+/−` toggle and animated height (`.faq-*` classes).
- `<SmoothScroll>` — **Lenis** momentum smooth-scroll wrapping the whole app (`src/app/layout.tsx`). Drives native scroll position so all `useScroll` effects keep working; disabled under reduced motion. Lenis CSS lives at the bottom of `globals.css`.

**Every** primitive reads `useReducedMotion()` and collapses to a static, fully-visible state under `prefers-reduced-motion: reduce`. Deps: `framer-motion`, `lenis`.

### Umano landing section classes (`globals.css`)

`.u-hero` (full-bleed `--twilight` panel, rounded bottom, tucked under the nav, with a floating `.u-notify` "tale is ready" card + `.u-hero-book` mock), `.u-statement` (scroll-highlight block), `.u-hcard` (horizontal feature card: rounded media + title + desc), `.u-stories` / `.u-story-card` / `.u-story-ribbon` (dark fanned stories), `.u-faq` / `.faq-row` (dark accordion), `.u-footer` (berry brand card + cream links card + giant faded `.u-footer-watermark`). All keep the signature `2–2.5px` ink border + hard offset shadow.

---

## 8. Iconography & imagery

- Icons are inline SVG or CSS shapes (clip-path stars, pseudo-element crescents/triangles), not an icon font. Play triangles are CSS borders.
- Remote images allowed only from Supabase Storage (`*.supabase.co/storage/v1/object/**`) and `res.cloudinary.com` (see `next.config.ts`). Use `next/image`; add new hosts to `remotePatterns` before use.
- Generated chapter art aspect ratio is `16/10` (`.sp-illustration`).
- **Ambient video** (e.g. hero card story loop, `.u-hero-scene-video`): plain `<video autoplay muted loop playsInline poster>` cover-fitting its box. Under `prefers-reduced-motion` a `!reduce` guard swaps the `<video>` for a static `<img>` poster (same class) so there's no ambient motion. Note: Tailwind preflight forces `video { height: auto }`, so the fill rule needs `height: 100% !important` — `inset: 0` alone won't stretch a replaced element.

---

## 9. Where styles live

| Surface | File | Convention |
| --- | --- | --- |
| Tokens + landing + Create Story + Reader + Dashboard/Shelf/Keepsake | `src/app/globals.css` | Global kebab-case classes |
| Auth (`/sign-in`, `/sign-up`) | `src/app/(auth)/auth-form.module.css` | CSS Module, camelCase |
| OAuth transit (`/sso-callback`) | `src/app/sso-callback/sso-callback.module.css` | CSS Module, camelCase |
| Scroll / entrance motion | `src/components/motion/*` (Framer Motion) | Client primitives; reduced-motion aware |
| Floating pill nav | `src/components/floating-nav.tsx` | Single nav, 3 variants (marketing/app/reader) |
| Tailwind utilities | via `@import "tailwindcss"` + `@theme` | Available but the codebase leans on hand-written classes |

Tailwind v4 is available and `@theme` exposes the palette as utilities, but the existing UI is built almost entirely from hand-authored semantic classes. Prefer extending the existing class vocabulary over scattering utilities, unless a component is genuinely new and one-off.
