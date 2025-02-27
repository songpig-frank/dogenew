-- Create a function to get user display info with proper access control
CREATE OR REPLACE FUNCTION get_user_display_info(user_id UUID)
RETURNS TABLE (display_name TEXT, email TEXT, is_admin BOOLEAN, is_moderator BOOLEAN) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the current user is an admin or moderator
  DECLARE
    current_user_id UUID;
    is_admin_or_mod BOOLEAN;
  BEGIN
    current_user_id := auth.uid();
    
    SELECT EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = current_user_id AND role IN ('admin', 'moderator')
    ) INTO is_admin_or_mod;
    
    -- For admins/moderators, return full info
    IF is_admin_or_mod THEN
      RETURN QUERY
      SELECT 
        COALESCE(up.display_name, up.username, 'Anonymous') as display_name,
        up.email,
        EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = $1 AND ur.role = 'admin') as is_admin,
        EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = $1 AND ur.role = 'moderator') as is_moderator
      FROM user_profiles up
      WHERE up.id = $1;
    ELSE
      -- For regular users, only return display name and no email
      RETURN QUERY
      SELECT 
        COALESCE(up.display_name, up.username, 'Anonymous') as display_name,
        NULL::TEXT as email,
        FALSE as is_admin,
        FALSE as is_moderator
      FROM user_profiles up
      WHERE up.id = $1;
    END IF;
  END;
END;
$$;

-- Update existing user profiles to ensure display_name is set
UPDATE user_profiles
SET display_name = username
WHERE display_name IS NULL AND username IS NOT NULL;

-- Add display_name to abc user if it doesn't exist
UPDATE user_profiles
SET display_name = 'ABC User'
WHERE email = 'abc@dogecuts.org' AND (display_name IS NULL OR display_name = '');
