# TellTales — Design System

**Version:** 1.0
**Source of truth:** `src/app/globals.css` (global tokens + landing/app classes) and `src/app/(auth)/auth-form.module.css` (auth-only CSS Module).
**Aesthetic:** Warm "storybook" — cream paper, dark ink outlines, hard offset shadows (neo-brutalist), playful serif + script display type, gentle floating/twinkle motion.

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

| Role | `@theme` name | `:root` var | Hex |
| --- | --- | --- | --- |
| Page background (paper) | `--color-cream` | `--cream` | `#FBF3E3` |
| Raised paper / input fill | `--color-cream-deep` | `--cream-deep` | `#F4E8CE` |
| Dashed dividers / rules | `--color-paper-line` | `--paper-line` | `#E8D9B5` |
| Primary text / borders / shadows | `--color-ink` | `--ink` | `#1C1540` |
| Secondary text | `--color-ink-soft` | `--ink-soft` | `#3B2E6B` |
| Brand dark surface | `--color-twilight` | `--twilight` | `#2B1E5C` |
| Deepest surface | `--color-twilight-deep` | `--twilight-deep` | `#1A1140` |
| Primary accent (gold) | `--color-moon` | `--moon` | `#F5B841` |
| Gold pressed | `--color-moon-deep` | `--moon-deep` | `#E39A1F` |
| Primary CTA (pink/red) | `--color-berry` | `--berry` | `#E8556B` |
| Berry pressed | `--color-berry-deep` | `--berry-deep` | `#C43957` |
| Success / positive | `--color-sage` | `--sage` | `#7FA88A` |
| Soft accent (lavender) | `--color-lilac` | `--lilac` | `#B79FD6` |

**Usage rules**
- Text on cream: `--ink` (primary), `--ink-soft` (secondary). Text on `--twilight`/`--berry`: `--cream`, with dimmed variants `rgba(251,243,227,0.75–0.88)`.
- Borders and shadows are **always** `--ink`. Do not introduce grey borders or blurred drop shadows.
- Accent rotation for repeated card sets (blueprints, steps, avatars) cycles: moon → berry → sage → lilac → twilight. Follow this order via `:nth-child`.

---

## 3. Elevation & borders

- **Border:** `2px` (compact cards, inputs), `2.5px` (large hero surfaces, form cards). Thin variants `1.5px` for eyebrows/small chips.
- **Radius scale:** `999px` (pills/buttons/chips) · `26–32px` (large panels: blueprints, quote, CTA, portrait) · `18–24px` (cards, form card, steps) · `12–16px` (inputs, small tiles) · `8–14px` (book spines).
- **Hard shadow scale** (`Xpx Xpx 0 var(--ink)`): `3px` buttons/small pills · `4px` compact cards/chips · `5–6px` features/plans · `8px` form cards · `10px` hero/big panels (blueprints, quote, CTA, story-preview).
- Shadow grows on hover (`+1px`) and collapses on active (`1px`). Never use `box-shadow` with a blur radius for elevation. Inset soft shadows (`--shadow-soft`, `inset 2px 2px 0 rgba(28,21,64,0.05)`) are only for input wells.

---

## 4. Typography

Fonts loaded in `src/app/layout.tsx` via `next/font/google`, exposed as CSS variables:

| Variable | Font | Role |
| --- | --- | --- |
| `--font-young-serif` | Young Serif (400) | Display headings: `h1`, section/step/card titles, prices. Class `.display`. |
| `--font-caprasimo` | Caprasimo (400) | Script accents: logo, kickers, badges, numbers, "highlight" words. Class `.script`. |
| `--font-nunito` | Nunito (400–800) | Body + all UI text, buttons, inputs. Default `body` font. |

- Base body: `17px` / line-height `1.55`, weight varies 400–800.
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

### Nav — `.nav` / `.logo` / `.logo-mark`
`1400px`, space-between. Logo is Caprasimo text + a `.logo-mark` (twilight circle, moon inner dot, `3px` moon shadow). App pages use `.nav-crumbs` breadcrumb + `.progress-pill` status.

### Big panels
`.blueprints`, `.quote-section`, `.cta-strip` share the pattern: rounded `32px`, colored surface (twilight/berry), `2.5px` ink, `10px` shadow, dotted-starfield `::before`, decorative circles.

### Transit / loading screen — `.screen` / `.card` (`sso-callback.module.css`)
Full-viewport branded wait state for auth redirects (OAuth `/sso-callback`). `.screen` = `100dvh` grid-centered on `--cream`. `.card` = centered column, `28px` radius, `2.5px` ink, `8px` hard shadow on `--cream-deep` (matches `.form-card` elevation). Contents: floating `.mark` (twilight circle + moon inner dot + `4px` moon shadow — the `.logo-mark` primitive scaled to `56px`, `float` loop), Caprasimo `.eyebrow`, Young Serif `.title`, Nunito `.sub`, and a three-dot `.dots` row reusing `pulseDot` with staggered delays (`0 / .2s / .4s`). All motion disabled under `prefers-reduced-motion`. Use for any "finishing sign-in / provisioning" transit, not for inline button spinners.

---

## 7. Decorative & motion vocabulary

Reusable decorations: `.star-decor` (moon star via `clip-path` polygon), `.moon-decor` (circle with inset crescent shadow), `.cloud-decor` (lilac pill + two pseudo-puffs), starfield backgrounds via layered `radial-gradient` dots, dashed paper dividers (`1.5–2px dashed --paper-line`).

Global page texture: `body::before` (three soft radial color glows) + `body::after` (SVG fractal-noise grain, `mix-blend-mode: multiply`). Content sits at `z-index: 2`.

Named animation loops (keep names; reuse rather than redefine): `float` (6s ambient bob, `--r` rotation var), `twinkle`/`spTwinkle` (star pulse), `moonDrift`, `shoot` (shooting star), `rise` (sparkle float-up), `fillIn`, `playPulse`, `pulseDot`, `spFloat`. All ambient loops are 2.4–8s and **must** be disabled under `prefers-reduced-motion: reduce`.

---

## 8. Iconography & imagery

- Icons are inline SVG or CSS shapes (clip-path stars, pseudo-element crescents/triangles), not an icon font. Play triangles are CSS borders.
- Remote images allowed only from Supabase Storage (`*.supabase.co/storage/v1/object/**`) and `res.cloudinary.com` (see `next.config.ts`). Use `next/image`; add new hosts to `remotePatterns` before use.
- Generated chapter art aspect ratio is `16/10` (`.sp-illustration`).

---

## 9. Where styles live

| Surface | File | Convention |
| --- | --- | --- |
| Tokens + landing + Create Story + Reader + Dashboard/Shelf/Keepsake | `src/app/globals.css` | Global kebab-case classes |
| Auth (`/sign-in`, `/sign-up`) | `src/app/(auth)/auth-form.module.css` | CSS Module, camelCase |
| OAuth transit (`/sso-callback`) | `src/app/sso-callback/sso-callback.module.css` | CSS Module, camelCase |
| Tailwind utilities | via `@import "tailwindcss"` + `@theme` | Available but the codebase leans on hand-written classes |

Tailwind v4 is available and `@theme` exposes the palette as utilities, but the existing UI is built almost entirely from hand-authored semantic classes. Prefer extending the existing class vocabulary over scattering utilities, unless a component is genuinely new and one-off.
