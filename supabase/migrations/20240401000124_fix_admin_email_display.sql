-- Fix email display in admin panels

-- Create a function to directly access auth.users emails
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- First try to get from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;
  
  -- If not found, try user_profiles
  IF user_email IS NULL THEN
    SELECT email INTO user_email FROM user_profiles WHERE id = user_id;
  END IF;
  
  RETURN COALESCE(user_email, 'No email available');
END;
$$;

-- Update the get_pending_submissions_with_emails function
CREATE OR REPLACE FUNCTION get_pending_submissions_with_emails()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ,
  user_id UUID,
  username TEXT,
  email TEXT,
  is_anonymous BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.title,
    s.description,
    s.category,
    s.created_at,
    s.user_id,
    COALESCE(s.username, 'Anonymous') as username,
    COALESCE(
      (SELECT email FROM auth.users WHERE id = s.user_id),
      s.email,
      'No email available'
    ) as email,
    COALESCE(s.is_anonymous, false) as is_anonymous
  FROM 
    submissions s
  WHERE 
    s.status = 'pending'
  ORDER BY
    s.created_at DESC;
  
  RETURN;
END;
$$;

-- Update the get_pending_comments_with_emails function
CREATE OR REPLACE FUNCTION get_pending_comments_with_emails()
RETURNS TABLE (
  id UUID,
  content TEXT,
  submission_id UUID,
  created_at TIMESTAMPTZ,
  user_id UUID,
  username TEXT,
  email TEXT,
  is_anonymous BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.content,
    c.submission_id,
    c.created_at,
    c.user_id,
    COALESCE(c.username, 'Anonymous') as username,
    COALESCE(
      (SELECT email FROM auth.users WHERE id = c.user_id),
      c.email,
      'No email available'
    ) as email,
    COALESCE(c.is_anonymous, false) as is_anonymous
  FROM 
    comments c
  WHERE 
    c.status = 'pending'
  ORDER BY
    c.created_at DESC;
  
  RETURN;
END;
$$;

-- Update existing submissions with email from auth.users
DO $$
BEGIN
  UPDATE submissions s
  SET email = (SELECT email FROM auth.users WHERE id = s.user_id)
  WHERE s.user_id IS NOT NULL AND (s.email IS NULL OR s.email = '');
END$$;

-- Update existing comments with email from auth.users
DO $$
BEGIN
  UPDATE comments c
  SET email = (SELECT email FROM auth.users WHERE id = c.user_id)
  WHERE c.user_id IS NOT NULL AND (c.email IS NULL OR c.email = '');
END$$;
