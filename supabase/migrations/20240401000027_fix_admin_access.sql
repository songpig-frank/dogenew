-- Drop existing policies
DROP POLICY IF EXISTS admin_access_submissions ON submissions;
DROP POLICY IF EXISTS admin_access_comments ON comments;

-- Create new policies for admin access
CREATE POLICY admin_access_submissions ON submissions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

CREATE POLICY admin_access_comments ON comments
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Ensure the super admin has the admin role
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'super_admin@dogecuts.org'
ON CONFLICT (user_id, role) DO NOTHING;

-- Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON submissions TO authenticated;
GRANT ALL ON comments TO authenticated;