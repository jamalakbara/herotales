-- Enable Realtime for the stories table
-- Run this in Supabase SQL Editor

-- First, check if realtime is already enabled
SELECT tablename, schemaname 
FROM pg_publication_tables 
WHERE schemaname = 'public' AND tablename = 'stories';

-- If the above returns no rows, run this to enable it:
ALTER PUBLICATION supabase_realtime ADD TABLE stories;

-- Verify it's enabled:
SELECT tablename, schemaname 
FROM pg_publication_tables 
WHERE schemaname = 'public' AND tablename = 'stories';

-- Should return 1 row showing: stories | public
