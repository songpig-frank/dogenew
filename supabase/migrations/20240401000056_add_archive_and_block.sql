-- Add archived status to submissions
ALTER TABLE submissions
ADD COLUMN archived BOOLEAN DEFAULT FALSE;

-- Add blocked status and reason to user_profiles
ALTER TABLE user_profiles
ADD COLUMN blocked BOOLEAN DEFAULT FALSE,
ADD COLUMN blocked_reason TEXT,
ADD COLUMN blocked_at TIMESTAMPTZ;

-- Create view for active (non-archived) submissions
CREATE VIEW active_submissions AS
SELECT *
FROM submissions
WHERE archived = FALSE;

-- Create function to archive submission
CREATE OR REPLACE FUNCTION archive_submission(submission_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE submissions
  SET archived = TRUE
  WHERE id = submission_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to block user
CREATE OR REPLACE FUNCTION block_user(user_id UUID, reason TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET 
    blocked = TRUE,
    blocked_reason = reason,
    blocked_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;