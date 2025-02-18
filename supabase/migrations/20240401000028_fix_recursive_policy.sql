-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;

-- Create new non-recursive policies
CREATE POLICY "Users can view their own roles"
ON user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Ensure public submissions are viewable
DROP POLICY IF EXISTS "Anyone can view approved submissions" ON submissions;
CREATE POLICY "Anyone can view approved submissions"
ON submissions FOR SELECT
TO public
USING (status = 'approved' OR auth.uid() = user_id);

-- Allow authenticated users to create submissions
DROP POLICY IF EXISTS "Authenticated users can create submissions" ON submissions;
CREATE POLICY "Authenticated users can create submissions"
ON submissions FOR INSERT
TO authenticated
WITH CHECK (true);

-- Insert test admin role if not exists
INSERT INTO user_roles (user_id, role)
VALUES ('53545e32-4607-4a8d-b643-9e49181cbe67', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;