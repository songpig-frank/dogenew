-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to create comments" ON comments;
DROP POLICY IF EXISTS "Allow admins and moderators to update comments" ON comments;
DROP POLICY IF EXISTS "Allow users to view approved comments" ON comments;

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow admins and moderators to update comments"
  ON comments
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'moderator')
  ));

CREATE POLICY "Allow users to view approved comments"
  ON comments
  FOR SELECT
  USING (
    status = 'approved'
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'moderator')
    )
  );