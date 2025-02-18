-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access to comments" ON comments;
DROP POLICY IF EXISTS "Allow insert access to comments" ON comments;

-- Create new simplified policies
CREATE POLICY "Allow read access to comments"
  ON comments
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert access to comments"
  ON comments
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_submission_id ON comments(submission_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Ensure status column exists and has default
ALTER TABLE comments 
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN status SET NOT NULL;

-- Reset RLS
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
