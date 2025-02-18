-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON submissions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON submissions;
DROP POLICY IF EXISTS "Users can update their own submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can update any submission" ON submissions;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Allow admins to manage roles" ON user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON user_roles;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON user_roles;

-- Disable RLS on all tables
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions DISABLE ROW LEVEL SECURITY;