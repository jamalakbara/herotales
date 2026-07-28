# Product Requirements Document (PRD): TellTales

**Version:** 1.1  
**Date:** January 2026  
**Status:** Draft / MVP Specification  
**Author:** Product Strategy Lead  

> **Naming:** the product ships as **TellTales** (see `src/app/layout.tsx`, `package.json`). "HeroTales AI" was the original working title and is retained only in historical copy.

---

## 1. Executive Summary
HeroTales AI is a specialized Micro SaaS designed for parents to create personalized, values-based children's stories. By leveraging AI (Next.js, Claude, BytePlus, OpenAI, ElevenLabs), the platform generates unique narratives where the child is the hero, teaching core life lessons through consistent visual storytelling and audio narration.

---

## 2. Product Objectives
- **Personalization:** Put the child at the center of the story (name, appearance, age).
- **Educational Value:** Use "Value Blueprints" to teach Bravery, Honesty, Patience, etc.
- **Retention:** Create a daily bedtime ritual that parents value enough to subscribe to.
- **Physical Upsell:** Convert digital stories into high-margin physical keepsake books.

---

## 3. Target Audience
- **Parents (2-8 year olds):** Seeking screen-time alternatives and character-building tools.
- **Educators:** Looking for custom stories to address specific classroom behaviors.
- **Grandparents:** Looking for unique, personalized gifts.

---

## 4. Functional Requirements

### 4.1 Story Configuration
- **User Inputs:** Child's name, age, gender (for pronouns), and "Lesson of the Day."
- **Theme Selection:** A dropdown menu featuring 5 core blueprints:
  1. Bravery (Overcoming fear)
  2. Honesty (Accountability)
  3. Patience (Waiting/Growth)
  4. Kindness (Empathy)
  5. Persistence (Resilience)

### 4.2 AI Generation Engine (The "Brain")
- **Text (Claude Haiku, JSON mode; OpenAI `gpt-4o` fallback):** Generate a 5-chapter story based on the selected Blueprint. Output validated against `StoryDocSchema` (Zod).
- **Visuals (BytePlus Seedream; OpenAI `dall-e-3` fallback):** Generate 1 image per chapter, plus a dedicated book-cover illustration per story.
- **Hero portrait (once per child):** the first time a hero is used, a locked portrait is generated (same `STYLE_ANCHOR`) and stored on `children.portrait_storage_path`, reused across all that hero's stories. It surfaces on the existing-hero picker (`stories/new`).
- **Consistency Logic:** A persistent Character Master Description (generated first) is threaded into every image prompt, **and** the locked hero portrait is fed as a BytePlus **image-to-image reference** (Seedream `image` field, `sequential_image_generation: "disabled"`) into the cover + every chapter render — so the character stays visually identical across pages, not just described. On the `dall-e-3` fallback the reference is dropped (text-only); the master description still anchors it.
- **Cover:** the generated cover art (`stories.cover_storage_path`) is shown behind the shelf book cards with the title/blueprint over an ink scrim; absent → the solid accent card.
- **Orchestration:** the whole flow runs as an **Inngest** function (`generate-story`) built from idempotent `step.run` stages: load story/child → character description → **hero portrait (gated on absence)** → generate text → **cover image** → per-chapter image → upload to Cloudinary (private) → mark ready.

> **Implementation note:** the model wrapper is `src/lib/vertexai.ts` (filename is historical — not Google Vertex). It routes each stage to a default provider with an OpenAI fallback: text → Claude Haiku (`src/lib/anthropic.ts`) else `gpt-4o`; images → BytePlus Seedream (`src/lib/byteplus.ts`) else `dall-e-3`. OpenAI client is `src/lib/openai.ts`.

### 4.3 Image Persistence Pipeline
- **Problem:** AI image URLs expire within 1 hour.
- **Requirement:** The system must automatically download the generated image and upload it to **Cloudinary** (as `type: authenticated`, private) for permanent hosting, served via signed delivery URLs.

### 4.4 Audio Narrator
- **Feature:** A "Read to Me" button.
- **Tech:** Integration with **ElevenLabs API** (warm, storytelling-optimized voices).

---

## 5. Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Database** | Neon Postgres via Drizzle ORM (`DATABASE_URL`, no RLS — queries scoped by `userId`) |
| **Storage** | Cloudinary — private images (`type: authenticated`), signed delivery URLs |
| **Authentication** | Clerk (`@clerk/nextjs`; route protection via `clerkMiddleware` in `src/proxy.ts`) |
| **Async pipeline** | Inngest (`generate-story` function, served at `/api/inngest`) |
| **AI Models** | Text: Claude Haiku → OpenAI `gpt-4o` fallback. Images: BytePlus Seedream → `dall-e-3` fallback. ElevenLabs (audio) *deferred* |
| **Validation** | Zod v4 (`src/lib/types.ts`) |
| **Styling** | Tailwind v4 + hand-authored classes — see `docs/DESIGN_SYSTEM.md` |
| **Payments** | Stripe (Subscription & one-time physical book) *deferred* |
| **Deployment** | Vercel |

---

## 6. Database Schema (High-Level)
- **Users Table:** ID, Email, Stripe_Subscription_Status.
- **Children Table:** ID, Parent_ID, Nickname, Character_Description, Age.
- **Stories Table:** ID, Child_ID, Theme, Full_Text (JSON), Created_At.
- **Images Table:** ID, Story_ID, Chapter_Index, Storage_Path (Cloudinary public id), Gen_ID.

---

## 7. Compliance & Privacy (COPPA Focus)
- **Data Minimization:** No storage of real surnames or sensitive child data.
- **Consent:** Verification of adulthood via Stripe Credit Card authentication.
- **Accountability:** "Delete All My Data" function easily accessible in settings.

---

## 8. Success Metrics (KPIs)
- **Monthly Recurring Revenue (MRR):** Target $1,000 within 3 months of launch.
- **Story Completion Rate:** % of users who read all 5 chapters.
- **Churn Rate:** Aim for < 5% by focusing on the "Daily Bedtime Habit."

---

## 9. Roadmap
- **Phase 1 (MVP):** Text generation + Character-consistent images + Clerk / Neon / Cloudinary integration.
- **Phase 2:** Audio narration and mobile-web optimization.
- **Phase 3:** Stripe integration and "Print-on-Demand" book ordering.