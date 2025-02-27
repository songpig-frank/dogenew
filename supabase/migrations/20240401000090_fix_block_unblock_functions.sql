-- Create or replace the block_user function to ensure it works properly
CREATE OR REPLACE FUNCTION block_user(
  user_id UUID,
  reason TEXT
) RETURNS VOID AS $$
BEGIN
  -- Update user profile
  UPDATE user_profiles
  SET 
    blocked = TRUE,
    blocked_reason = reason,
    blocked_at = NOW()
  WHERE id = user_id;
  
  -- Archive user content
  UPDATE submissions
  SET archived = TRUE
  WHERE user_id = user_id;
  
  UPDATE comments
  SET archived = TRUE
  WHERE user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the unblock_user function to ensure it works properly
CREATE OR REPLACE FUNCTION unblock_user(
  user_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET 
    blocked = FALSE,
    blocked_reason = NULL,
    blocked_at = NULL
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the blocked column exists and has the right default
ALTER TABLE user_profiles
ALTER COLUMN blocked SET DEFAULT FALSE;

-- Make sure the cow user is blocked
UPDATE user_profiles
SET 
  blocked = TRUE,
  blocked_reason = 'because it was a cow not human',
  blocked_at = NOW()
WHERE id = '11530b58-3f6c-4e47-8c90-1be4786f93f3';
