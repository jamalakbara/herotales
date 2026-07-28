# Environment & Setup

This project pairs Next.js 16 (App Router) with Clerk (auth), Neon Postgres via Drizzle ORM, Cloudinary (private image storage), Anthropic/BytePlus/OpenAI (text + images), and Inngest (async story-generation pipeline). Stripe and ElevenLabs are deliberately deferred.

---

## Required environment variables

Create `.env.local` at the repo root with the following keys.

| Var | Where used | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Browser + server Clerk SDK (`@clerk/nextjs`) | Public publishable key from the Clerk dashboard. |
| `CLERK_SECRET_KEY` | Server/Inngest Clerk backend client (`clerkClient`) | **Server-only** — never ships to the browser. Used by `POST /api/user/delete` to delete the Clerk user. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Clerk redirect config | Point at the in-app `/sign-in` and `/sign-up` routes. |
| `DATABASE_URL` | Neon Postgres via Drizzle (`src/lib/db/index.ts`) | Neon connection string (`postgresql://…`). Drizzle `neon-http` client; **no RLS** — the app scopes every query by the Clerk `userId`. |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary image storage (`src/lib/cloudinary.ts`) | **API secret is server/Inngest-only.** Story images upload as `type: authenticated` (private), served via signed delivery URLs. |
| `ANTHROPIC_API_KEY` | `src/lib/anthropic.ts` (default story-text provider, via `vertexai.ts`) | Claude Haiku for story text. If unset, every text call falls back to OpenAI. |
| `ANTHROPIC_TEXT_MODEL` | `src/lib/anthropic.ts` | Optional. Overrides the Haiku model id. Default `claude-haiku-4-5`. |
| `BYTEPLUS_API_KEY` | `src/lib/byteplus.ts` (default image provider, via `vertexai.ts`) | BytePlus ModelArk (Seedream) for chapter art. If unset, every image call falls back to DALL-E. |
| `BYTEPLUS_BASE_URL` | `src/lib/byteplus.ts` | Optional. ModelArk API base. Default `https://ark.ap-southeast.bytepluses.com/api/v3`. |
| `BYTEPLUS_IMAGE_MODEL` | `src/lib/byteplus.ts` | Optional. Seedream model id. Default `seedream-4-0-250828` (confirm the exact id in the BytePlus console). |
| `BYTEPLUS_VIDEO_MODEL` | `src/lib/byteplus.ts` (`generateBytePlusVideo`) | Optional. Seedance (video) model id for the async task API. Default `seedance-1-0-pro-250528`. Used by `scripts/gen-card-videos.ts` to build the landing "How it works" card loops. |
| `OPENAI_API_KEY` | `src/lib/openai.ts` (fallback provider, via `vertexai.ts`) | Fallback for both stages. Account must have access to `gpt-4o` (text) and `dall-e-3` (images). |
| `INNGEST_EVENT_KEY` | `src/lib/inngest/client.ts` | From Inngest Cloud → Event keys. Optional locally if running `inngest-cli dev`. |
| `INNGEST_SIGNING_KEY` | `src/app/api/inngest/route.ts` (`serve`) | Required in production; `inngest-cli dev` works without it. |
| `NEXT_PUBLIC_APP_URL` | Email links / future webhooks | e.g. `http://localhost:3000` in dev, full origin in prod. |
| `COMING_SOON` | Middleware (`src/proxy.ts`) | **Server-only** pre-launch gate. When `="true"`, auth + all protected routes (`/dashboard`, `/stories`, `/shelf`, `/heroes`, `/keepsake-books`, `/sign-in`, `/sign-up`) redirect to the `/coming-soon` splash; the marketing landing, `/coming-soon`, and `POST /api/waitlist` stay open. Set only in the **Production** scope; leave unset in Preview + local. Unset it to launch — no code change. |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis (`src/lib/redis.ts`) | **Server-only.** REST endpoint for the Upstash Redis DB. Powers rate limiting, hot-path caching (quota/dashboard/children/story), signed-URL caching, and the story-gen dedup lock. **Optional** — if unset, every Redis path fails open (cache → Postgres, locks/limits → allow). |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis (`src/lib/redis.ts`) | **Server-only.** REST auth token paired with the URL above. Both must be present for Redis to activate. |

Do **not** commit `.env.local`. Vercel/your host should hold the same set as project-level env vars.

### Environments (Production / Preview / Local)

One Vercel project (`herotales`): `main`→Production, `development` branch→Preview, local via `.env.local`. Production runs prod instances/keys **and the pre-launch gate**; Preview + local run dev instances/keys with the gate **off**, so e2e testing happens on preview URLs while the domain shows the coming-soon wall.

| Var | Production (`main`) | Preview (`development`) | Local (`.env.local`) |
| --- | --- | --- | --- |
| `COMING_SOON` | `true` | *(unset)* | *(unset)* |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | prod (`pk_live_`/`sk_live_`) | dev (`pk_test_`/`sk_test_`) | dev (`pk_test_`/`sk_test_`) |
| `DATABASE_URL` | prod Neon | dev Neon branch | dev Neon branch |
| `CLOUDINARY_*`, `ANTHROPIC_*`, `BYTEPLUS_*`, `OPENAI_API_KEY` | shared | shared | shared |
| `UPSTASH_REDIS_*`, `INNGEST_*` | prod | reuse prod | optional locally |
| `NEXT_PUBLIC_APP_URL` | prod domain | preview URL | `http://localhost:3000` |

Only **Clerk** and **Neon** have a distinct dev instance; everything else is shared. Set scoped vars with `vercel env add <NAME> <production|preview>` (Preview can be pinned to the branch with `--git-branch development`).

---

## One-time backend setup

### Clerk (auth)
1. Create a Clerk application; copy the publishable + secret keys into env.
2. Enable Email + Password (and any social providers you want) under **User & Authentication**.
3. Set the sign-in/sign-up URLs to the in-app routes (`/sign-in`, `/sign-up`) via `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL`. Route protection is handled in `src/proxy.ts` (`clerkMiddleware` + `createRouteMatcher`).

### Neon Postgres (database)
1. Create a Neon project; copy the pooled connection string into `DATABASE_URL`.
2. Apply the Drizzle schema (`src/lib/db/schema.ts`):
   - `npm run db:generate` then `npm run db:migrate`, **or**
   - `npm run db:push` to sync the schema directly (dev).
3. There is **no RLS** — access control lives in app code, so every query is scoped by the authenticated Clerk `userId`. A `profiles` row is created for a user on first authenticated use.

### Cloudinary (image storage)
1. Create a Cloudinary account; copy cloud name + API key + API secret into env.
2. No public folder/bucket config needed: story images upload as `type: authenticated` (private) and are served only through signed delivery URLs (`signedImageUrl`). The API secret must stay server/Inngest-only.

### Upstash Redis (rate limiting + caching)
1. Provision an Upstash Redis database — via the Vercel Marketplace (**Storage → Upstash**, which injects `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` into the project) or from the Upstash console.
2. Copy both REST vars into env. HTTP-based (`@upstash/redis`) — no TCP pool to manage on serverless.
3. **Entirely optional.** With the vars unset the app runs unchanged: `src/lib/redis.ts` helpers fail open — caches fall back to Postgres, and the rate limiter (`@upstash/ratelimit`) + dedup lock allow every request. Local dev needs no Upstash.
4. What it backs: per-user rate limits on story create + mutations, cached quota/dashboard/children/story reads, long-lived signed-image-URL cache, and the story-generation dedup lock (prevents double-submit duplicate stories).

---

## AI providers (default → fallback)

Story generation runs through one swappable wrapper (`src/lib/vertexai.ts`) with a primary provider and an OpenAI fallback per stage:

- **Story text** → Claude Haiku (`ANTHROPIC_API_KEY`); on any Anthropic error, falls back to OpenAI `gpt-4o`.
- **Chapter images** → BytePlus ModelArk / Seedream (`BYTEPLUS_API_KEY`); on any BytePlus error, falls back to OpenAI `dall-e-3`.

Setup:

- **Anthropic** — generate a key with access to Claude Haiku (`claude-haiku-4-5`). Story text uses JSON mode (prefilled `{` + parsed against `StoryDocSchema`).
- **BytePlus** — create a ModelArk API key and confirm the Seedream model id in the console (set `BYTEPLUS_IMAGE_MODEL`). The endpoint is OpenAI-shaped: `POST {BYTEPLUS_BASE_URL}/images/generations`.
- **OpenAI (fallback)** — key must have access to `gpt-4o` (text) and `dall-e-3` (images).
- Set a sensible monthly cap on each key while iterating — image generation is the dominant cost.

---

## Inngest setup

### Local
```bash
npx inngest-cli dev
```
Runs at `http://localhost:8288`. Auto-discovers the Next dev server's `/api/inngest` endpoint. `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` are optional locally.

### Production (Inngest Cloud)
1. Create an app in Inngest Cloud, copy event key + signing key into env.
2. Deploy. Inngest auto-discovers functions via the `/api/inngest` route on first event.
3. Confirm `generate-story` shows up under Functions.

---

## Local boot

```bash
npm install
npm run dev          # Next on :3000
npx inngest-cli dev  # Inngest on :8288 (separate terminal)
```

Then:
1. Visit `/sign-up` → create account → land on `/dashboard` (empty state).
2. From `/stories/new`, fill the form → POST `/api/stories` returns `{ story_id }` → redirected to `/stories/[id]`.
3. Reader polls every 2 s; the Inngest pipeline fills `full_text` + `chapter_images` rows. Within ~30–60 s the page hydrates with 5 chapters of art.
4. Toggle favorite, browse `/shelf`, preview `/keepsake-books`.
5. `POST /api/user/delete` wipes Cloudinary images + DB profile (FK-cascades children/stories/chapter_images) + the Clerk user (COPPA compliance).

---

## Deferred (intentionally not wired)

- **Stripe** — keepsake checkout, subscriptions, plan-driven quota recompute. Quota is a fixed `profiles.story_quota_monthly` default until billing lands.
- **ElevenLabs** — chapter narration. The reader's "Read to me" button + audio bar render in a dimmed/disabled state with a `// TODO: Phase 2 — ElevenLabs` marker.
- **Print-on-demand vendor** (Lulu/Blurb) — keepsake "Order" CTAs are inert (`disabled`) with `// TODO: Phase 3 — Stripe` markers.

When wiring these later: add `chapter_audio` and `keepsake_orders` tables, plus the matching env vars (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ELEVENLABS_API_KEY`, etc.), and remove the disabled state on the relevant CTAs.
