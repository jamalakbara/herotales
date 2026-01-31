-- Migration: Add generation status tracking to stories table
-- This enables tracking of background story generation progress and status

-- Add generation status columns
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS generation_status TEXT DEFAULT 'pending' CHECK (
  generation_status IN ('pending', 'generating_text', 'generating_images', 'saving', 'completed', 'failed')
),
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS generation_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS generation_completed_at TIMESTAMPTZ;

-- Create index for querying by status (useful for monitoring)
CREATE INDEX IF NOT EXISTS idx_stories_generation_status ON stories(generation_status);

-- Create index for querying recent generations
CREATE INDEX IF NOT EXISTS idx_stories_generation_started_at ON stories(generation_started_at DESC);

-- Update existing stories to have 'completed' status (backwards compatibility)
UPDATE stories 
SET generation_status = 'completed', 
    progress = 100,
    generation_completed_at = created_at
WHERE is_published = TRUE AND generation_status = 'pending';

-- Comment the table for documentation
COMMENT ON COLUMN stories.generation_status IS 'Current status of story generation: pending, generating_text, generating_images, saving, completed, failed';
COMMENT ON COLUMN stories.progress IS 'Generation progress from 0 to 100';
COMMENT ON COLUMN stories.error_message IS 'Error message if generation failed';
COMMENT ON COLUMN stories.generation_started_at IS 'Timestamp when generation started';
COMMENT ON COLUMN stories.generation_completed_at IS 'Timestamp when generation completed or failed';
