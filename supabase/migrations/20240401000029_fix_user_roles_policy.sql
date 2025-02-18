-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;

-- Create new non-recursive policies
CREATE POLICY "Enable read access for all users"
ON user_roles FOR SELECT
TO authenticated
USING (true);

-- Insert admin role if not exists
INSERT INTO user_roles (user_id, role)
SELECT auth.uid(), 'admin'
FROM auth.users
WHERE auth.uid() = '53545e32-4607-4a8d-b643-9e49181cbe67'
ON CONFLICT (user_id, role) DO NOTHING;