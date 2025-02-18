-- Drop existing policies
DROP POLICY IF EXISTS "Admins can do everything on user_roles" ON user_roles;
DROP POLICY IF EXISTS "Users can read their own role" ON user_roles;

-- Create simplified policies
CREATE POLICY "Enable read access for authenticated users"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable write access for admins"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );
