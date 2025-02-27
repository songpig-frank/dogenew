-- Fix the blocked status for users

-- Update the cow user to be blocked
UPDATE user_profiles
SET 
  blocked = TRUE,
  blocked_reason = 'because it was a cow not human',
  blocked_at = NOW()
WHERE id = '11530b58-3f5c-4e47-8c90-1be4786f93f3';

-- Make sure all user_profiles have the blocked column
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT FALSE;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ;

-- Create a direct access function to get user profiles with their roles
CREATE OR REPLACE FUNCTION get_users_with_roles()
RETURNS TABLE (
  id UUID,
  username TEXT,
  email TEXT,
  created_at TIMESTAMPTZ,
  role TEXT,
  blocked BOOLEAN,
  blocked_reason TEXT,
  blocked_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.email,
    p.created_at,
    r.role,
    p.blocked,
    p.blocked_reason,
    p.blocked_at
  FROM 
    user_profiles p
  LEFT JOIN 
    user_roles r ON p.id = r.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
