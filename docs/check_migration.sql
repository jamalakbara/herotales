-- Quick diagnostic query to check if migration was applied
-- Run this in Supabase SQL Editor

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'stories' 
  AND column_name IN ('generation_status', 'progress', 'error_message', 'generation_started_at', 'generation_completed_at')
ORDER BY column_name;

-- If this returns 0 rows, the migration was NOT applied
-- If this returns 5 rows, the migration WAS applied
