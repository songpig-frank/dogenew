-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS increment_likes(UUID);
DROP FUNCTION IF EXISTS decrement_likes(UUID);

-- Create the increment_likes function
CREATE OR REPLACE FUNCTION increment_likes(submission_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE submissions
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = submission_id;
  
  -- For debugging
  RAISE NOTICE 'Incremented likes for submission %', submission_id;
END;
$$;

-- Create the decrement_likes function
CREATE OR REPLACE FUNCTION decrement_likes(submission_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE submissions
  SET likes = GREATEST(0, COALESCE(likes, 0) - 1)
  WHERE id = submission_id;
  
  -- For debugging
  RAISE NOTICE 'Decremented likes for submission %', submission_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_likes(UUID) TO authenticated;

-- Ensure the submissions table has a default value for likes
ALTER TABLE submissions ALTER COLUMN likes SET DEFAULT 0;

-- Update any null likes to 0
UPDATE submissions SET likes = 0 WHERE likes IS NULL;

-- Add a trigger to ensure likes never goes below 0
CREATE OR REPLACE FUNCTION ensure_non_negative_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.likes < 0 THEN
    NEW.likes := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_likes_non_negative ON submissions;
CREATE TRIGGER ensure_likes_non_negative
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION ensure_non_negative_likes();
