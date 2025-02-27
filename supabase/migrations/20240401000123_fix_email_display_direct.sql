-- Direct fix for email display in moderation screens

-- Create a function to directly access auth.users emails
CREATE OR REPLACE FUNCTION get_auth_user_email(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;
  RETURN user_email;
END;
$$;

-- Create a function to get all pending submissions with emails directly from auth.users
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
      s.email
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

-- Create a function to get all pending comments with emails directly from auth.users
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
      c.email
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
