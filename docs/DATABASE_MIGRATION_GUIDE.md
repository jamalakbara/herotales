# Database Migration Guide

## Apply the Generation Status Migration

You need to apply the database migration to add generation status tracking to the `stories` table.

## Option 1: Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**
5. Copy the entire contents of `docs/add_generation_status_migration.sql`
6. Paste into the SQL editor
7. Click **"Run"** (or press Cmd/Ctrl + Enter)

You should see a success message. Your `stories` table now has the new columns!

## Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Apply the migration
supabase db push

# Or run the migration file directly
psql $DATABASE_URL < docs/add_generation_status_migration.sql
```

## Verify Migration

After applying, verify the migration worked:

1. Go to **Table Editor** → **stories** table
2. You should see these new columns:
   - `generation_status` (text, default: 'pending')
   - `progress` (integer, default: 0)
   - `error_message` (text, nullable)
   - `generation_started_at` (timestamptz, nullable)
   - `generation_completed_at` (timestamptz, nullable)

## What Changed?

- **Existing stories**: Automatically marked as `completed` with `progress: 100`
- **New stories**: Start with `pending` status and track progress in real-time
- **Realtime enabled**: Frontend automatically receives updates when status changes

## Ready to Test!

Once the migration is applied, you're ready to test the new background job system! 🎉

See `docs/INNGEST_SETUP.md` for next steps.
