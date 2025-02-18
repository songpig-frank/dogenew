-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Allow admins to manage roles" ON user_roles;

-- Create a simple policy that allows all authenticated users to read roles
CREATE POLICY "Allow all authenticated users to read roles"
ON user_roles FOR SELECT
TO authenticated
USING (true);

-- Create a policy that allows admins to manage roles without recursion
CREATE POLICY "Allow admins to manage roles"
ON user_roles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id
    AND id = '53545e32-4607-4a8d-b643-9e49181cbe67'
  )
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Ensure the default admin exists
INSERT INTO user_roles (user_id, role)
VALUES ('53545e32-4607-4a8d-b643-9e49181cbe67', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;