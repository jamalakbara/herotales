-- 1. Create a table for Children (associated with a Parent/User)
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL, -- Use nicknames for COPPA compliance
  age_group INTEGER CHECK (age_group > 0 AND age_group < 13),
  character_description TEXT, -- The "Master Style Guide" for this child
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create a table for Stories
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  theme TEXT NOT NULL, -- e.g., 'Bravery', 'Honesty'
  title TEXT,
  full_story_json JSONB, -- Stores the text for all 5 chapters
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create a table for Story Images (Permanent Storage)
CREATE TABLE story_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  chapter_index INTEGER NOT NULL, -- 1 through 5
  image_url TEXT NOT NULL, -- This will be your Supabase Bucket URL
  openai_gen_id TEXT, -- To track character consistency
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Set up Row Level Security (RLS)
-- Ensures parents can only see THEIR children's stories
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their own children" 
  ON children FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can view stories for their children" 
  ON stories FOR SELECT USING (
    EXISTS (SELECT 1 FROM children WHERE children.id = stories.child_id AND children.parent_id = auth.uid())
  );