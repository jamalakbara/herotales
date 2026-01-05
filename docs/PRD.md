# Product Requirements Document (PRD): HeroTales AI

**Version:** 1.0  
**Date:** January 2026  
**Status:** Draft / MVP Specification  
**Author:** Product Strategy Lead  

---

## 1. Executive Summary
HeroTales AI is a specialized Micro SaaS designed for parents to create personalized, values-based children's stories. By leveraging AI (Next.js, OpenAI, ElevenLabs), the platform generates unique narratives where the child is the hero, teaching core life lessons through consistent visual storytelling and audio narration.

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
- **Text (GPT-4o-mini):** Generate a 5-chapter story based on the selected Blueprint.
- **Visuals (DALL-E 3):** Generate 1 image per chapter.
- **Consistency Logic:** Use `gen_id` and a persistent Character Master Description to maintain the child’s appearance across all images.

### 4.3 Image Persistence Pipeline
- **Problem:** AI image URLs expire within 1 hour.
- **Requirement:** The system must automatically download the DALL-E image and upload it to **Supabase Storage** for permanent hosting.

### 4.4 Audio Narrator
- **Feature:** A "Read to Me" button.
- **Tech:** Integration with **ElevenLabs API** (warm, storytelling-optimized voices).

---

## 5. Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15+ (App Router) |
| **Database** | Supabase (PostgreSQL) |
| **Storage** | Supabase Buckets (Image Hosting) |
| **Authentication** | Supabase Auth |
| **AI Models** | OpenAI (Text & Images), ElevenLabs (Audio) |
| **Payments** | Stripe (Subscription & One-time Physical Book purchase) |
| **Deployment** | Vercel |

---

## 6. Database Schema (High-Level)
- **Users Table:** ID, Email, Stripe_Subscription_Status.
- **Children Table:** ID, Parent_ID, Nickname, Character_Description, Age.
- **Stories Table:** ID, Child_ID, Theme, Full_Text (JSON), Created_At.
- **Images Table:** ID, Story_ID, Chapter_Index, Supabase_URL, Gen_ID.

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
- **Phase 1 (MVP):** Text generation + Character-consistent images + Supabase integration.
- **Phase 2:** Audio narration and mobile-web optimization.
- **Phase 3:** Stripe integration and "Print-on-Demand" book ordering.