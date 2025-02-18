-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to view approved comments" ON comments;
DROP POLICY IF EXISTS "Allow admins and moderators to view all comments" ON comments;
DROP POLICY IF EXISTS "Allow authenticated users to create comments" ON comments;
DROP POLICY IF EXISTS "Allow admins and moderators to update comments" ON comments;

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create new policies with simplified rules
CREATE POLICY "Allow users to view approved comments"
  ON comments FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Allow admins and moderators to view all comments"
  ON comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Allow authenticated users to create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert test comments if none exist
INSERT INTO comments (content, submission_id, user_id, status)
SELECT 
  'Test pending comment ' || n,
  (SELECT id FROM submissions ORDER BY created_at DESC LIMIT 1),
  (SELECT user_id FROM user_roles WHERE role = 'admin' LIMIT 1),
  'pending'
FROM generate_series(1, 3) n
WHERE NOT EXISTS (SELECT 1 FROM comments WHERE status = 'pending' LIMIT 1);