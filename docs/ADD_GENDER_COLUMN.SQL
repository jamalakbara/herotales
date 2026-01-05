-- Add gender column to children table
-- Run this in your Supabase SQL Editor

ALTER TABLE children 
ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT 'boy' 
CHECK (gender IN ('boy', 'girl'));

-- Update existing records (optional - set a default)
-- UPDATE children SET gender = 'boy' WHERE gender IS NULL;
