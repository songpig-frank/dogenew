-- First drop the existing function if it exists
DROP FUNCTION IF EXISTS increment_share_count(UUID);

-- Add share_count column to submissions table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'submissions' 
                  AND column_name = 'share_count') THEN
        ALTER TABLE submissions
        ADD COLUMN share_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create function to increment share count
CREATE OR REPLACE FUNCTION increment_share_count(submission_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE submissions
  SET share_count = COALESCE(share_count, 0) + 1
  WHERE id = submission_id
  RETURNING share_count INTO new_count;
  
  RETURN new_count;
END;
$$;