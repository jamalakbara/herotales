-- Story Audio Table
-- Stores generated audio narration for each chapter

CREATE TABLE IF NOT EXISTS story_audio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_index INTEGER NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(story_id, chapter_index)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_story_audio_story_id ON story_audio(story_id);

-- RLS policies
ALTER TABLE story_audio ENABLE ROW LEVEL SECURITY;

-- Users can view audio for stories they own (through children)
CREATE POLICY "Users can view their story audio"
  ON story_audio FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories s
      JOIN children c ON s.child_id = c.id
      WHERE s.id = story_audio.story_id
      AND c.parent_id = auth.uid()
    )
  );

-- Only the system can insert audio (via service role)
-- Users don't directly insert audio
