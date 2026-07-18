# Story Creation — E2E Test & Character/Image Consistency Report

**Date:** 2026-07-17 → 18
**Method:** Full live browser E2E through the real UI (`/stories/new`), driven with Chrome automation against the local dev stack (Next dev `:3000` + Inngest dev `:8288`, hosted Neon DB, Cloudinary, Anthropic Haiku text, BytePlus Seedream images).
**Coverage:** 10 stories generated (8 field-coverage + 2 repeat-consistency). Every one reached `status: ready` with 5 chapters + 5 images.
**Ground truth:** Every submission was verified against the **database** (stories + children + chapter_images tables), not just the UI. All 50 generated images were downloaded via signed Cloudinary URLs and visually inspected; per-story montage strips are in [`docs/story-test-assets/`](./story-test-assets/).

---

## 1. Verdict

- **Form correctness: PASS.** Every field on the form maps to the correct API/schema field and persists correctly — nickname, age, all 4 pronoun modes, all detail-tag modes, character description, all 5 blueprints, hook (incl. empty + 240-char truncation), all 3 lengths, and both new-hero and pick-existing-hero flows.
- **Character consistency: STRONG (better than the code predicted).** Within every story the hero is the *same child* across all 5 pages — same face, hair, skin, outfit, props, silhouette. Even across 3 independent generations of the *same* hero (repeat test), the character stays highly consistent **despite no image seed and no reference image** being used. The detailed, reused "locked character sheet" text carries the consistency.
- **Story ↔ image sync: STRONG.** Each chapter image depicts its chapter's `caption`/scene.
- **Weak spots are not within-story drift** but: homogeneous auto-generated heroes, age not reflected visually, a quota UI/back-end mismatch, a dead "let me type" pronoun input, and a stale cover preview in existing-hero mode. Details below.

---

## 2. Scenario matrix (as executed)

| # | Story ID (short) | Hero mode | Name | Age | Pronouns (submitted) | Details | Char-desc | Blueprint | Hook | Length | Result |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `94a30e6a` | new | Maya | 5 | she/her | 2 preset | auto | Bravery | default sleepover (119) | Bedtime | ✅ ready |
| 2 | `c8984299` | new | Leo | 3 | he/him | preset+custom (`loves trains`) | auto | Kindness | new-sibling (110) | Shortie | ✅ ready |
| 3 | `84d07184` | new | Sam | 8 | they/them | rich (5 tags) | **user-written** | Persistence | first-day-school (90) | Long tale | ✅ ready |
| 4 | `94053930` | new | Ari | 2 | **"let me type" → they/them** | none (empty) | auto | Honesty | doctor-visit (78) | Shortie | ✅ ready |
| 5 | `6d503134` | new | Juno | 6 | she/her | preset | **user-written** | Patience | losing-a-tooth (103) | Bedtime | ✅ ready |
| 6 | `c9054194` | **existing** | Alex | 8 | he/him | (existing) | (existing) | Bravery | swim-lessons (93) | Long tale | ✅ ready |
| 7 | `62651447` | new | Kai | 7 | he/him | custom-only (`loves outer space`) | auto | Persistence | **empty → null** | Bedtime | ✅ ready |
| 8 | `06997035` | new | Nia | 4 | she/her | 3 preset | **user-written** | Kindness | **240-char (truncated)** | Shortie | ✅ ready |
| 9 | `e67b0e9e` | existing | Maya | 5 | she/her | (same child as #1) | (same as #1) | Bravery | default | Bedtime | ✅ ready |
| 10 | `d79eeb9e` | existing | Maya | 5 | she/her | (same child as #1) | (same as #1) | Bravery | default | Bedtime | ✅ ready |

Coverage achieved: all 5 blueprints, all 3 lengths, all 4 pronoun modes, ages 2–8 (both bounds), new vs existing hero, empty/preset/custom/rich/3-tag details, with/without character description, empty & max-length hook.

**#1, #9, #10 all reference the same Maya child** (`cid 4b38c14a`) with an identical locked character description — this makes them a clean 3-sample test of how much the *same* input drifts across separate generations (see §5).

---

## 3. Form correctness — field by field (verified in DB)

| Field | What was tested | DB result | Notes |
|---|---|---|---|
| **Nickname** | 7 new names + 1 existing | All stored verbatim on the child row | No client-side max length; server Zod max 40. |
| **Age** | 2, 3, 4, 5, 6, 7, 8 | Stored as int (`age`) | Every chip value round-trips. |
| **Pronouns** | she/her, he/him, they/them, "let me type" | `she/her`, `he/him`, `they/them`; **"let me type" stored as `they/them`** | Spaces stripped (`she / her`→`she/her`). See finding F2. |
| **Detail tags** | empty, preset, preset+custom, custom-only, 3, rich-5 | All stored as `detail_tags[]`; custom-add works | Ari `[]`, Kai `["loves outer space"]`, Sam 5 tags, etc. |
| **Character description** | provided (Sam/Juno/Nia) vs auto | User text stored verbatim; auto-generated when blank | See finding F5 (tags dropped when desc provided). |
| **Value blueprint** | all 5 | Stored correctly on story row | Bravery/Honesty/Patience/Kindness/Persistence all verified. |
| **Hook** | default, replaced, empty, 240-char | Empty → `null` (Kai); long input **truncated to exactly 240** (Nia) | Truncation confirmed at UI (`240/240`) and DB (`length=240`). |
| **Narrator voice** | left at default | Stored (`Juniper`) | No generative effect — narration is Phase 2 (ElevenLabs deferred). Not varied. |
| **Story length** | Shortie, Bedtime, Long tale | Stored correctly | But content scales only modestly — see finding F8. |
| **New vs existing hero** | both | New-hero creates a reusable child row; existing-hero links the correct `child_id` | Alex (#6) and Maya (#9,#10) linked to the right pre-existing children. |

**Every field is wired correctly.** No mismatches between UI label and persisted value.

---

## 4. Within-story character consistency (the core question)

For each story the 5 chapter images were inspected side-by-side. **All 10 stories: strong, near-identical character across all 5 pages** — face shape, hair, skin tone, signature outfit, accessory, and overall silhouette hold from chapter 1 to 5.

| Story | Consistency (1–5) | Evidence |
|---|---|---|
| S01 Maya | 5 | Curly chestnut hair, yellow sun-motif tee, denim overalls, red hi-tops, stuffed fox, lantern — identical every page. |
| S02 Leo | 5 | Train-engineer cap, red tee, denim overalls, fox — stable. |
| S03 Sam | 5 | Two afro puff-buns, mustard raincoat, teal boots, brass compass — exactly matches the user description on all 5. |
| S04 Ari | 4.5 | Yellow star tee, denim overalls, red sneakers; teddy at bedtime — consistent (slight hair-volume variance). |
| S05 Juno | 5 | Strawberry-blonde waves, green corduroy pinafore over striped top, brown boots, daisy clip — matches user desc. |
| S06 Alex | 5 | Chestnut waves, green eyes, blue dino hoodie, **green earphones** (tag honored), red sneakers — stable at the pool. |
| S07 Kai | 5 | Curly black hair, space-motif blue tee, grey shorts, **telescope** (tag honored), constellations — stable. |
| S08 Nia | 5 | Afro puffs w/ red beads, red felt crown, red polka-dot dress, white sneakers — matches user desc every page. |

**Story↔image sync: strong.** Captions clearly drive the scene: owl for "Nighttime Hoots," pool/swim-ring for the swim story, planting/garden for Patience, telescope + constellations for the space story, shared reading for Kindness, a spilled cup for Honesty. No off-scene images observed.

**Text quality (spot-checked S03/S04/S07):** always exactly 5 chapters; pronouns used consistently (Sam & Ari clean `they/them`, Kai `he/him`); no markdown/emoji; warm restful endings; blueprint and hook woven in (not lectured). Empty hook (Kai) handled gracefully.

---

## 5. Repeat-consistency — same input, 3 separate generations

Stories **#1, #9, #10** use the identical Maya child (same locked description) + Bravery + Bedtime + default hook. Their story *text* regenerated differently each time (titles: *Nighttime Hoots* / *Magical Nightlight* / *Nighttime Adventure*, temperature 0.85), but the **character render stayed highly consistent** across all 15 images: same curly chestnut hair, yellow sun/​sunflower tee, denim overalls, red sneakers, fox, lantern.

See [`docs/story-test-assets/REPEAT_Maya_grid.png`](./story-test-assets/REPEAT_Maya_grid.png) (rows = #1 / #9 / #10).

**This is the headline result.** The code has **no seed and no reference image** passed to BytePlus (`src/lib/byteplus.ts`), and each of the 50 images is an independent generation. The concern going in was silhouette drift. In practice, because the locked character-sheet paragraph is detailed and injected verbatim into every prompt (`src/lib/prompts/image.ts`), Seedream reproduces the character reliably both within a story and across separate runs. Drift is minor (a sun icon vs a sunflower on the shirt; slight hair volume).

---

## 6. Findings & recommendations

### Bugs / UX issues
- **F1 — Quota UI vs back-end mismatch (functional).** The monthly quota default is **5** (`schema.ts:28`, enforced at `api/stories/route.ts:97`, HTTP 402 "Monthly story quota reached"). But the form footer hardcodes **"Lantern plan, 28 left this month."** Submitting the 6th story of the month is blocked while the UI still says 28 left. *This actually blocked scenario #5 mid-test.* → Make the footer read real quota (`quota.remaining`) and disable/label the button when `remaining <= 0`.
  *(To finish the run I temporarily raised the dev quota, then restored the profile to its original state: `story_quota_monthly=5`, `stories_used_this_month=1`.)*
- **F2 — "Let me type" pronoun has no input on the story form.** Selecting it does **not** reveal a text field (the hero form at `/heroes/new` does). It silently submits `they/them`. → Either add the freeform input here too, or rename the chip to "they/them (or type on hero page)".
- **F3 — Cover preview ignores existing-hero selection (cosmetic).** In pick-existing mode the live preview still shows *"Maya & the Brave Lantern · Ages 5 · following Maya · ON MAYA'S SHELF"* regardless of which hero is selected. The submission itself is correct (right `child_id`), but the preview is misleading. → Bind the preview to the selected existing hero.

### Generation-quality observations
- **F4 — Auto-generated heroes are homogeneous.** Heroes with *no* user description (Maya, Leo, Ari, Kai) all converge to the same look: round/cherubic face, hazel/green eyes, chestnut curls, yellow top + denim overalls + red sneakers. They read like the same child re-colored. Only user-written descriptions (Sam, Juno, Nia) produced distinctive heroes. Likely causes: the description model (Haiku @ 0.6) defaults to a template, and the default detail tags ("curly hair") plus the warm style anchor bias every hero the same way. → Push the character-sheet prompt for more diversity (vary hair texture/color, skin tone, build, outfit palette), and/or seed it from age + tags more aggressively.
- **F5 — Detail tags are dropped when a character description is provided.** Sam's `wears glasses` tag never appears because a user description was supplied and it didn't mention glasses (the `character-description` step returns the user text unchanged; tags are only used when auto-generating). → Merge tags into the user description, or feed tags to the image prompt separately.
- **F6 — Stated age isn't reflected visually.** Sam (8), Alex (8) and Kai (7) all render as ~3–5-year-olds, like every other hero. → Inject explicit age cues into the character-sheet/image prompt if age fidelity matters.
- **F7 — Ubiquitous props.** A glowing lantern appears in nearly every image (it's baked into `STYLE_ANCHOR` — "gold lantern glow"), and red sneakers recur across auto-heroes. The stuffed fox appears whenever the fox tag is set. Intentional as house style, but worth noting it flattens variety.
- **F8 — Length labels are aspirational.** Word counts were Shortie ≈ 276, Bedtime ≈ 359, Long tale ≈ 390. Length *does* scale, but "Long tale / 20 min read" is ~390 words (~2–3 min read aloud), and the reader shows "12 min"/"20 min". → Either lengthen Long-tale output substantially or adjust the displayed read-time estimates.

### Consistency mechanism — optional hardening
Consistency is good today, but if drift ever appears (e.g. after a model change), the cheapest levers are: pass a stable per-story `seed` to BytePlus, or generate chapter-0 first and pass it as an image reference to chapters 1–4. Neither is needed right now.

---

## 7. Artifacts

- Per-story montage strips (5 chapters left→right): `docs/story-test-assets/S01_Maya_strip.png` … `S10_MayaR_strip.png`
- Repeat-consistency grid (rows = #1/#9/#10): `docs/story-test-assets/REPEAT_Maya_grid.png`
- Source stories remain in the DB (`stories` / `chapter_images`) and on each hero's shelf for manual review.

## 8. Test integrity notes
- Ran against the real production code path (real form → `POST /api/stories` → Inngest `generate-story` pipeline → Anthropic + BytePlus → Cloudinary). No mocks.
- The only state change beyond creating the test stories was temporarily raising and then **restoring** the dev quota (F1); the profile row is back to its original values.
- Narrator voice was not varied because narration is a deferred (Phase 2) feature with no effect on generated output.
