-- Add display_name field to user_profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'display_name') THEN
    ALTER TABLE user_profiles ADD COLUMN display_name TEXT;
  END IF;
END $$;

-- Update existing user_profiles to set display_name = username if null
UPDATE user_profiles
SET display_name = username
WHERE display_name IS NULL AND username IS NOT NULL;

-- Create a function to get user display info
CREATE OR REPLACE FUNCTION get_user_display_info(user_id UUID)
RETURNS TABLE (display_name TEXT, email TEXT, is_admin BOOLEAN, is_moderator BOOLEAN) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.display_name,
    up.email,
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = $1 AND ur.role = 'admin') as is_admin,
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = $1 AND ur.role = 'moderator') as is_moderator
  FROM user_profiles up
  WHERE up.id = $1;
END;
$$;
