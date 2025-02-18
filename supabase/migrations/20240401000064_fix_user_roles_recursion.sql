-- First drop all existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_roles;
DROP POLICY IF EXISTS "Enable write access for admins" ON user_roles;
DROP POLICY IF EXISTS "Admins can do everything on user_roles" ON user_roles;
DROP POLICY IF EXISTS "Users can read their own role" ON user_roles;

-- Create a simple policy that allows all authenticated users to read
CREATE POLICY "Allow all authenticated users to read"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Create a simple policy for write operations
CREATE POLICY "Allow admins to write"
  ON user_roles
  FOR ALL
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  ));
