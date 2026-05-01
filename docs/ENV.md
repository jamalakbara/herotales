# Environment & Setup

This project pairs Next.js 16 (App Router) with Supabase (Auth + Postgres + Storage), OpenAI (text + images), and Inngest (async story-generation pipeline). Stripe and ElevenLabs are deliberately deferred.

---

## Required environment variables

Create `.env.local` at the repo root with the following keys.

| Var | Where used | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server Supabase clients | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server (RLS-respecting) clients | Public anon key from Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | `src/lib/supabase/admin.ts` (Inngest only) | **Never** import the admin client from any code that ships to the browser. |
| `OPENAI_API_KEY` | `src/lib/openai.ts` | Account must have access to `gpt-4o-mini` and `gpt-image-1`. |
| `INNGEST_EVENT_KEY` | `src/lib/inngest/client.ts` | From Inngest Cloud → Event keys. Optional locally if running `inngest-cli dev`. |
| `INNGEST_SIGNING_KEY` | `src/app/api/inngest/route.ts` (`serve`) | Required in production; `inngest-cli dev` works without it. |
| `NEXT_PUBLIC_APP_URL` | Email links / future webhooks | e.g. `http://localhost:3000` in dev, full origin in prod. |

Do **not** commit `.env.local`. Vercel/your host should hold the same set as project-level env vars.

---

## One-time Supabase setup

1. Create a new Supabase project. Note the project ref + anon key + service-role key.
2. Apply the schema:
   - `supabase db push` (CLI), **or**
   - paste `supabase/migrations/0001_init.sql` into the SQL editor.
3. Verify the `handle_new_user` trigger fires on `auth.users` insert (creates a `profiles` row).
4. Storage → create bucket **`story-assets`**:
   - Public: **off**
   - The app mints 1-hour signed URLs on read; never set this bucket public.
5. Auth → Providers → Email: enable email + password. Disable email confirmations only if you want frictionless local testing.
6. Auth → URL Configuration → set Site URL to `NEXT_PUBLIC_APP_URL` and add your production origin to allowed redirect URLs.

---

## OpenAI setup

- Generate an API key with access to:
  - `gpt-4o-mini` (text + character description)
  - `gpt-image-1` (chapter art, including `images.edit` with `input_fidelity: "high"`)
- Set a sensible monthly cap on the key while iterating — image generation is the dominant cost.

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
5. `POST /api/user/delete` wipes storage + DB + auth user (COPPA compliance).

---

## Deferred (intentionally not wired)

- **Stripe** — keepsake checkout, subscriptions, plan-driven quota recompute. Quota is a fixed `profiles.story_quota_monthly` default until billing lands.
- **ElevenLabs** — chapter narration. The reader's "Read to me" button + audio bar render in a dimmed/disabled state with a `// TODO: Phase 2 — ElevenLabs` marker.
- **Print-on-demand vendor** (Lulu/Blurb) — keepsake "Order" CTAs are inert (`disabled`) with `// TODO: Phase 3 — Stripe` markers.

When wiring these later: add `chapter_audio` and `keepsake_orders` tables, plus the matching env vars (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ELEVENLABS_API_KEY`, etc.), and remove the disabled state on the relevant CTAs.
