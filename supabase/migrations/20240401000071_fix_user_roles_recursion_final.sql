-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access to user_roles" ON user_roles;
DROP POLICY IF EXISTS "Allow admin access to user_roles" ON user_roles;

-- Create new simplified policies
CREATE POLICY "Allow read access to user_roles"
  ON user_roles
  FOR SELECT
  USING (true);

CREATE POLICY "Allow admin access to user_roles"
  ON user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );
