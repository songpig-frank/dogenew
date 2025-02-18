-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow admins to moderate submissions" ON submissions;
DROP POLICY IF EXISTS "Allow admins to moderate comments" ON comments;

-- Create new non-recursive policies
CREATE POLICY "Allow admins to moderate submissions"
  ON submissions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'moderator')
  ));

CREATE POLICY "Allow admins to moderate comments"
  ON comments
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'moderator')
  ));

-- Add default status to submissions and comments
ALTER TABLE submissions ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE comments ALTER COLUMN status SET DEFAULT 'pending';

-- Update existing records without status
UPDATE submissions SET status = 'pending' WHERE status IS NULL;
UPDATE comments SET status = 'pending' WHERE status IS NULL;