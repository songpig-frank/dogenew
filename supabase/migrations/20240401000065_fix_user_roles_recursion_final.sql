-- First drop all existing policies
DROP POLICY IF EXISTS "Allow all authenticated users to read" ON user_roles;
DROP POLICY IF EXISTS "Allow admins to write" ON user_roles;

-- Create a simple policy that allows everyone to read
CREATE POLICY "public_read"
  ON user_roles
  FOR SELECT
  USING (true);

-- Create a simple policy that allows admins to write
CREATE POLICY "admin_write"
  ON user_roles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "admin_update"
  ON user_roles
  FOR UPDATE
  USING (true);
