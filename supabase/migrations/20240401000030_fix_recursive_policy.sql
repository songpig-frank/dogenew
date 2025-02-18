-- Drop all existing policies on user_roles
DROP POLICY IF EXISTS "Enable read access for all users" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;

-- Create a simple policy that allows authenticated users to read all roles
CREATE POLICY "Allow authenticated users to read roles"
ON user_roles FOR SELECT
TO authenticated
USING (true);

-- Allow admins to insert/update roles
CREATE POLICY "Allow admins to manage roles"
ON user_roles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);
