-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON user_roles;
DROP POLICY IF EXISTS "Allow admins to manage roles" ON user_roles;

-- Create a simple policy that allows all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
ON user_roles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
