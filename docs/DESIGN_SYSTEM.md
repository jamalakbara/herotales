# TellTales — Design System

**Version:** 2.0 — umano re-skin
**Source of truth:** `src/app/globals.css` (global tokens + landing/app classes) and `src/app/(auth)/auth-form.module.css` (auth-only CSS Module).
**Aesthetic:** Modern studio — flat off-white surfaces, **bold orange (`#FF692E`)**, near-black display, **soft blurred elevation** (no borders), Playfair Display headings + Inter UI, momentum smooth-scroll and scroll-linked motion. Modelled 1:1 on umanodesign.studio, expressed with TellTales content.

> **v2 note:** The original v1 "storybook" system (cream paper, hard ink offset shadows, Young Serif/Caprasimo/Nunito) was replaced by this umano skin. The **CSS variable names were kept** (`--cream`, `--ink`, `--moon`, `--berry`, `--font-young-serif`, …) and repointed to umano values, so existing classes carried over. Where this doc still describes hard-shadow/border behaviour for legacy inline-styled app surfaces, those are residual and being migrated to the soft-shadow tokens below.

This document describes the design system as it actually exists in the codebase. Treat it as the reference when building or reviewing UI. See `.claude/rules/design-system.md` for the enforcement rules.

---

## 1. Design principles

1. **Modern studio warmth.** Flat off-white surfaces, one bold orange accent, near-black display type — bedtime content expressed in the umano skin. Ambient decor (stars, fireflies) lives *inside* colored panels, never as page texture.
2. **Borderless soft elevation.** Surfaces use `var(--u-card-shadow)` / `-lg` blurred shadows, no borders. The one deliberate exception is `<BookCover>` (see §6) — the "physical printed book" artifact keeps its ink outline + hard offset shadow.
3. **Scroll drives the primary motion.** Buttons lift `translateY(-1px)` on hover; the big moments are scroll-linked (pinned panels, fanned cards, reveals).
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

### App-page surface classes (globals.css, "APP PAGES — umano skin" section)

The app pages (dashboard, shelf, story builder, reader, keepsake) are fully migrated to the soft skin. Use these semantic classes instead of inline elevation styles:

- `.u-card` — white, radius `24px`, `var(--u-card-shadow)`.
- `.u-card-lg` — white, radius `28px`, `var(--u-card-shadow-lg)` (hero-grade panels, e.g. the dashboard greeting).
- `.u-panel-dark` — `--twilight` surface, white text, radius `24px`, shadow-lg, `position: relative; overflow: hidden` (ready to host `<AmbientDecor>`).
- `.u-chip` / `.u-chip.active` — grey pill resting, **orange fill + white text** when selected, `translateY(-1px)` hover.

> **BookCover exception:** `<BookCover>` (and its mini spine thumbnails / hero book mocks) intentionally keeps the v1 `2.5px` ink outline + hard offset shadow — it is the one "physical printed book" motif. Do not soften it, and do not use hard shadows anywhere else.

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
- `.plan`: cream, `2.5px` ink, `6px` shadow; `.featured` is twilight, lifted `-12px`, with rotated `.plan-badge`. Rendered only via `<PlanCard>` (`src/components/plan-card.tsx`) — shared by the landing `Pricing` section and the keepsake-books binding cards; never hand-roll this markup. Props: `name / price / per / tag / feats` (`ReactNode[]`, so emphasis like `<strong>20% off</strong>` needs no `dangerouslySetInnerHTML`), optional `badge`, `featured`, `onSelect` (click-to-feature → `.plan-selectable`, `cursor: pointer`), and a structured `cta` — `{ label, variant?: "berry" }` plus either `{ href }` (renders `.btn` link) or `{ disabled: true, title? }` (renders disabled `.btn` button that stops propagation so the card can still be selected).
- `.form-card` / `.formCard`: cream, `2.5px` ink, `8–10px` shadow — the primary form container.

### Book cover — `<BookCover>` (`src/components/book-cover.tsx`)
Shared React primitive for the "story book spine" card on the dashboard shelf, the full shelf, and the keepsake picker — the single source of truth for that markup (previously copy-pasted three ways). Presentational: pages own the wrapper (`Link` / selectable `div`) + the info block below.
- **Cover box:** `aspectRatio 5/6.4`, radius `6px 12px 12px 6px`, `2.5px` ink border, hard offset shadow, left spine hairline, `overflow: hidden`. Layout = uppercase kicker `label` + Young-Serif `title` + Caprasimo `script` accent, then a bottom row (`theme` left; `star` glyph in a circle, or `footerRight` text, on the right).
- **Accents:** `CoverAccent` (`berry / twilight / sage / moon / lilac / cream`) maps to bg + fg + light/dark; light covers flip spine, star-circle bg, and script colour to ink. Rotate positional colours with `coverAccent(i)` over `COVER_ACCENTS` (single ordering — do not redefine per page). `accentColors(accent)` returns `{background,color}` for mini spine thumbnails (shelf list rows).
- **Sizes:** `lg` (dashboard), `md` (shelf, animated), `sm` (keepsake — no star, tighter). `size` drives padding, font sizes, star size, base shadow.
- **Props:** `badge` `{text, accent}` (auto colour), `selected` (moon `3px` border + grown shadow), `overlay` (absolute node, e.g. selection check), `animated` (opt-in shelf hover twinkle/wiggle/shadow-grow via `dash-bc-*-anim`; off = static, e.g. dashboard), `coverClassName` (e.g. `kp-pick-cov` hover shadow), `className`/`style` (wrapper).

### Inputs & selectable chips (umano skin — re-skinned in the APP PAGES globals section)
- `.txt-input` / `.hook` / `.tag-input`: grey (`--cream-deep`) fill, **transparent border, no inset shadow**; focus → `2px` orange border + white fill.
- Chip pickers (`.age-chip`, `.pron-chip`, `.tag`, `.bp-opt`, `.voice-opt`, `.length-opt`): grey resting, borderless, hover lift; `.active` = **orange fill + white text** (or dark surface + soft shadow for the larger `.bp-opt`/`.voice-opt` tiles). Selection = filled accent, never just a text-color change. `.suggest-chip` keeps its dashed grey outline, filling orange on hover.
- `.kid-pick` (existing-hero picker on `stories/new`): grey card; selected = white fill + **inset orange ring** + soft shadow — the same selection language as the keepsake story picker.
- Shared footer: `<AppFooter variant="wide" | "mini">` (`src/components/app-footer.tsx`) — the © / Privacy / Delete-my-data / Help strip on every app page (`.app-foot` / `.foot-mini`). Never inline a page footer again.

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

**No global page texture.** The page is flat `#FAFAFA` — the old `body::before/::after` grain/glow rules were deleted. Ambient atmosphere comes from `<AmbientDecor>` inside colored panels instead.

### `<AmbientDecor>` (`src/components/motion/AmbientDecor.tsx`)
Sparse tone-on-tone bedtime decor for colored panels: twinkling stars (`.u-bgstar`, reuses `twinkle`), drifting firefly lanterns (`.u-firefly`, reuses `fireflyDrift`), optional wheat-meadow SVG (`meadow`, hero only). `variant="orange"` (dark-orange stars on the orange hero) or `variant="dark"` (cream stars on twilight panels) — the variant class (`.u-decor-orange`/`.u-decor-dark`) sets the palette vars. Pass `stars`/`fireflies` arrays to control layout, `fireflies={[]}` for stars-only. Consumers: landing hero, dashboard "tonight" card + nudge banner, shelf empty state, reader end-CTA + illustration placeholder, keepsake hero. Ambient loops disabled under reduced motion via the `.u-bgstar/.u-firefly` reduce rule.

### `<PinnedPanel>` (`src/components/motion/PinnedPanel.tsx`)
The hero/FAQ pin extracted as a primitive: `heightVh` wrapper (`.u-pin`) > sticky full-viewport child (`.u-pin-sticky`) > `motion.section` scrubbing `scale 1 → 0.955` + `radius 0 → 44px`. `className` applies to both branches; `pinnedClassName` only when pinned (full-viewport sizing); renders a plain static `<section>` under reduced motion. Consumers: landing FAQ (`faq.tsx`, panel class `.u-faq-panel`) and the keepsake hero (`.kp-hero` / `.kp-hero-panel`, tucked under the nav via `.kp-hero-tuck`).

**Where pins are allowed:** only marketing-grade surfaces — the landing sections and the keepsake hero. Never pin the dashboard, shelf, forms, or reader chapters; those get `<Reveal inView>` entrances and ambient decor only.

### Reader progress hairline — `.read-progress`
Fixed 3px orange bar at the top of the story reader, `scaleX` driven by `useScroll` (`transform-origin: 0 50%`). Not rendered under reduced motion.

Named animation loops (keep names; reuse rather than redefine): `float` (6s ambient bob, `--r` rotation var), `twinkle`/`spTwinkle` (star pulse), `moonDrift`, `shoot` (shooting star), `rise` (sparkle float-up), `fillIn`, `playPulse`, `pulseDot`, `spFloat`. All ambient loops are 2.4–8s and **must** be disabled under `prefers-reduced-motion: reduce`.

### Scroll & entrance motion — Framer Motion primitives (`src/components/motion/`)

The landing composition is modelled on a scroll-driven agency layout, rendered in TellTales tokens (this is **layout/motion only — palette, fonts, and the hard-offset-shadow elevation are unchanged**). Scroll effects use **`framer-motion`** (dependency). Reusable client primitives — always prefer these over hand-rolling scroll logic:

- `<Reveal>` — fade + slide-up entrance. Plays **on mount** by default (mount-based, not hand-rolled observer-gated, so it can't stick under React StrictMode's dev double-mount); pass **`inView`** for below-the-fold content — it switches to framer's own `whileInView` (viewport `once`, `amount: 0.25`), which is StrictMode-safe. Takes `delay` / `index` (stagger) / `y`. Used with `inView` + stagger on the pricing cards (`.plan-wrap` wrapper — entrance transform lives on the wrapper so it never fights the card's hover/featured transforms).
- `<ScrollHighlightText text=…>` — big Young Serif statement whose words fill `--paper-line → --ink` as it scrolls through the viewport (`useScroll` + `useTransform`).
- `<HorizontalScroll>` — pins a section and translates its track on X as you scroll Y; falls back to a normal horizontal-scroll row under reduced motion. (Generic primitive; the landing feature row uses `<FeatureZoom>` instead.)
- `<FeatureZoom cards=… head=…>` — the pinned feature row **and** its hand-off into the dark stories section, in one scroll timeline: intro cards pan left, then the final card slides to centre and zooms to full-bleed while a `--twilight-deep` veil closes over it → seamless black into `.u-stories`. Degrades to a plain horizontal-scroll row under reduced motion. Classes: `.u-fzoom` (360vh pin), `.u-fzoom-sticky`, `.u-fzoom-track` (panning intro cards), `.u-fzoom-finale` / `.u-fzoom-media` (the zooming last card), `.u-fzoom-veil`.
- `<FannedCards>` — cards fan out into a tilted spread on scroll (the dark "story lessons" section; also the keepsake hero book mocks). Spacing tightens as the card count grows; **hovering a card lifts it out of the hand** — cancels its tilt, scales `1.06`, rises, and jumps to the front (`z-index 999`). Optional `minHeight` (default `620`) and `spread` (multiplier on the fan's x/y offsets, default `1`) fit tighter stacks — the keepsake hero uses `minHeight={380} spread={0.55}`. Pass `staticSpread` inside pinned sections: the container never moves through the viewport there, so scroll progress would stay at 0 and the cards would sit stacked forever — `staticSpread` renders the full fan immediately while keeping the hover lift.
- `<Accordion items=…>` — single-open FAQ with `+/−` toggle and animated height (`.faq-*` classes).
- `<SmoothScroll>` — **Lenis** momentum smooth-scroll wrapping the whole app (`src/app/layout.tsx`). Drives native scroll position so all `useScroll` effects keep working; disabled under reduced motion. Lenis CSS lives at the bottom of `globals.css`.

**Every** primitive reads `useReducedMotion()` and collapses to a static, fully-visible state under `prefers-reduced-motion: reduce`. Deps: `framer-motion`, `lenis`.

### Umano landing section classes (`globals.css`)

`.u-hero` (full-bleed `--twilight` panel, rounded bottom, tucked under the nav, with a floating `.u-notify` "tale is ready" card + `.u-hero-book` mock), `.u-statement` (scroll-highlight block), `.u-hcard` (horizontal feature card: rounded media + title + desc), `.u-stories` (**full-bleed `--twilight-deep`** — intentionally *not* a rounded margin card, so `<FeatureZoom>`'s veil lands on one continuous dusk backdrop; `.u-stories-intro` holds the heading + `.u-stories-sub`, `.u-stories-fan` the fanned cards) / `.u-story-card` (the media tile *is* the card) / `.u-story-cap` (name + line as a bottom gradient overlay **on the image** — the only region that stays legible when neighbouring fanned cards overlap it; no CTA button) (dark fanned stories), `.u-faq` / `.faq-row` (dark accordion), `.u-footer` (berry brand card + cream links card + giant faded `.u-footer-watermark`). All keep the signature `2–2.5px` ink border + hard offset shadow.

**Pricing cards (`.plan`).** Equal-height flex columns (CTA pinned to the bottom via `margin-top: auto`) inside `.plan-wrap` `<Reveal inView>` grid children, entering with a stagger. Hover lifts `-6px` with a shadow grow (soft, umano scale). The **featured plan** uses the story-card surface `#1f1d24` (raw `--twilight` vanishes on `--twilight-deep`) plus a hairline cream inset ring and a faint orange under-glow; on hover the ring turns orange and the badge wiggles. Feature checks are **white ✓ on an orange disc** — `--sage` is repointed to orange in this skin, so any sage-disc + orange-glyph combo is invisible. All hover transforms/transitions collapse under `prefers-reduced-motion`. Both plan grids (landing pricing, keepsake bindings) render `<PlanCard>` inside `.pricing-grid`; the old keepsake-only `.kp-price-*` classes are gone. Keepsake adds **click-to-feature**: `.plan-selectable` cards move `.featured` on click, and a non-berry CTA on the dark featured surface gets a translucent white pill (`.plan.featured .plan-cta:not(.btn-berry)` → `rgba(255,255,255,0.14)` bg, white text).

**Unified dark run + footer reveal.** Story-lessons (`.u-stories`), pricing (`#pricing`) and FAQ (`#faq`) form one **full-bleed** `--twilight-deep` block via `.u-dark-section` (no side gutters — the stories/zoom black stays edge-to-edge) with a `.u-dark-inner` (max-width 1400 + 48 gutter) holding the content; `.u-dark-section .section-title/.section-sub` flip to light. The **FAQ is pinned exactly like the hero** (`faq.tsx` via `<PinnedPanel>` — generic `.u-pin` wrapper / `.u-pin-sticky` sticky 100vh / `.u-faq-panel` full-viewport): a full-bleed dark panel scales down in place (`scale 1 → 0.955` + `border-radius 0 → 44px`, `transform-origin: center`) into a rounded card with cream on **all four sides** — so the whole rounded panel stays in view (no square-topped clip from a tall section scrolling past). It holds, then the footer reveals beneath. The footer sits in a `.u-footer-reveal` wrapper (`position: fixed; bottom:0; z-index:0`) pinned behind the page; `.u-main` (`position: relative; z-index:1`, opaque `--cream` bg) carries `margin-bottom: var(--footer-h)` so scrolling past the pinned FAQ lifts the content and reveals the footer underneath (umano pattern). The footer has generous top padding so the panel-overlap zone is blank light bg (never clips the footer content). `--footer-h` = footer height (~584 desktop / ~850 mobile) — keep in sync if the footer's height/padding changes.

---

## 8. Iconography & imagery

- Icons are inline SVG or CSS shapes (clip-path stars, pseudo-element crescents/triangles), not an icon font. Play triangles are CSS borders.
- Remote images allowed only from Supabase Storage (`*.supabase.co/storage/v1/object/**`) and `res.cloudinary.com` (see `next.config.ts`). Use `next/image`; add new hosts to `remotePatterns` before use.
- Generated chapter art aspect ratio is `16/10` (`.sp-illustration`).
- **Ambient video** (hero card story loop `.u-hero-scene-video`; "How it works" feature cards + blueprint fan tiles `.u-hcard-video`): plain `<video autoplay muted loop playsInline poster>` cover-fitting its box. The shared `<LoopVideo>` (`src/components/motion/LoopVideo.tsx`) renders it and, under `prefers-reduced-motion`, swaps the `<video>` for a static `<img>` poster (same class) so there's no ambient motion. Note: Tailwind preflight forces `video { height: auto }`, so the fill rule needs `height: 100% !important` — `inset: 0` alone won't stretch a replaced element.
- **Seamless-loop card art** (the five `<FeatureZoom>` feature cards **and** the five `<FannedCards>` blueprint tiles): each loop is painted in the **same watercolor/gouache picture-book style as the real chapter art** — Seedream renders a still using the chapter illustrator's `STYLE_ANCHOR` (minus its scene-palette clause), then Seedance **image-to-video** animates it with **ambient-only** motion (glow, sway, drift, blink — nothing directional), then Cloudinary bakes a **boomerang** (`fl_splice,l_video:<self>/e_reverse/fl_layer_apply`) so playback is forward→reverse and the first/last frames match — a truly cut-free `<video loop>`. i2v (vs text-to-video) both locks the illustration style and sidesteps the t2v content filter on generated children. Subjects sit on a **flat solid orange (`#FF692E`) watercolor wash** — no scene, keeping the warm picture-book world consistent with the hero. Delivery URLs come from `src/lib/landing-media.ts` (`cardLoop`/`cardPoster`). Regenerate via `scripts/gen-card.ts <id>…`; assets live under Cloudinary `telltales/landing/{card-*,blueprint-*}` (public `upload` type, `-still` = the painted source frame).

**Skeleton loading (`.skeleton` + variants).** Every async surface (media loads, data-backed grids) shows a skeleton, not a blank/empty state, while its fetch is in flight. One primitive in `globals.css`: `.skeleton` — `--paper-line` base with a soft white sheen sweeping via `@keyframes skeletonSheen` (1.6s linear); under `prefers-reduced-motion` the sheen stops and a static surface remains. Shape variants: `.skeleton-media` (absolute `inset: 0`, `--cream-deep` base — drop inside any positioned media box to cover a loading `<video>`/fill-`Image`; used by `<LoopVideo>` and the reader chapter art), `.skeleton-text` (12px pill line; `.lg` = 22px), `.skeleton-avatar` (54×54, r16 — hero-card avatar), `.skeleton-pill` (150×50 pill — kid tabs), `.skeleton-cover` (aspect `5/6.4`, book radius `6px 12px 12px 6px`, **white** base + `--u-card-shadow` so it reads on the cream-deep shelf plank), `.skeleton-seat` (28×28, r8 — plan seat squares). Compose in TSX via `src/components/skeleton.tsx`: `<Skeleton variant>` plus shared composites `<SkeletonBookItem>` (cover + two caption lines, drops into any shelf grid) and `<SkeletonKidCard>` (dashboard hero card). Don't hand-roll new placeholder shimmer — add a variant here instead.

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

**App-page re-skins** live in the final `/* APP PAGES — umano skin */` section of `globals.css`, appended **after** the "UMANO 1:1 SKIN" override block so it wins the cascade. It holds the `.u-card`/`.u-panel-dark`/`.u-chip` primitives, the generalized decor classes (`.u-decor*`, `.u-bgstar`, `.u-firefly`, `.u-meadow`), `.app-foot`, and class-level soft re-skins of the form/reader/dash/kp vocabularies. Elevation must never be inlined in TSX — inline styles beat classes and can't be re-skinned centrally.
