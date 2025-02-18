-- First add username columns if they don't exist
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS username TEXT;

-- Create function to generate a unique username from email
CREATE OR REPLACE FUNCTION generate_username_from_email(email TEXT)
RETURNS TEXT AS $$
DECLARE
  base_username TEXT;
  test_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Extract everything before @ and remove special characters
  base_username := regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9]', '', 'g');
  
  -- Initial try with just the base username
  test_username := base_username;
  
  -- Keep trying with incrementing numbers until we find a unique username
  WHILE EXISTS (SELECT 1 FROM user_profiles WHERE username = test_username) LOOP
    counter := counter + 1;
    test_username := base_username || counter;
  END LOOP;
  
  RETURN test_username;
END;
$$ LANGUAGE plpgsql;

-- Add usernames for users who don't have them
INSERT INTO user_profiles (id, username, is_anonymous)
SELECT 
  au.id,
  generate_username_from_email(au.email),
  false
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Add username to submissions that don't have them
UPDATE submissions s
SET username = (SELECT username FROM user_profiles up WHERE up.id = s.user_id)
WHERE s.username IS NULL AND s.user_id IS NOT NULL;

-- Add username to comments that don't have them
UPDATE comments c
SET username = (SELECT username FROM user_profiles up WHERE up.id = c.user_id)
WHERE c.username IS NULL AND c.user_id IS NOT NULL;