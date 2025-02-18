-- Create a function to handle the like toggle transaction
CREATE OR REPLACE FUNCTION toggle_like(p_submission_id UUID, p_user_id UUID, p_is_liked BOOLEAN)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Begin transaction
  IF p_is_liked THEN
    -- Add like
    INSERT INTO user_interactions (submission_id, user_id, type)
    VALUES (p_submission_id, p_user_id, 'like');

    -- Increment likes count
    UPDATE submissions
    SET likes = COALESCE(likes, 0) + 1
    WHERE id = p_submission_id;
  ELSE
    -- Remove like
    DELETE FROM user_interactions
    WHERE submission_id = p_submission_id
    AND user_id = p_user_id
    AND type = 'like';

    -- Decrement likes count
    UPDATE submissions
    SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
    WHERE id = p_submission_id;
  END IF;

  -- Commit is automatic at function end
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION toggle_like(UUID, UUID, BOOLEAN) TO authenticated;

-- Ensure likes column has a default value
ALTER TABLE submissions ALTER COLUMN likes SET DEFAULT 0;

-- Update any null likes to 0
UPDATE submissions SET likes = 0 WHERE likes IS NULL;
