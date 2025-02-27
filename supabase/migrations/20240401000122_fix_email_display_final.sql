-- Fix email display in moderation screens

-- Create a function to directly get user emails
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
  
  RETURN user_email;
END;
$$;

-- Update submissions table with emails
UPDATE submissions s
SET email = (
  SELECT email FROM auth.users WHERE id = s.user_id
)
WHERE s.email IS NULL AND s.user_id IS NOT NULL;

-- Update comments table with emails
UPDATE comments c
SET email = (
  SELECT email FROM auth.users WHERE id = c.user_id
)
WHERE c.email IS NULL AND c.user_id IS NOT NULL;

-- Create a function to get all pending submissions with complete user info
CREATE OR REPLACE FUNCTION get_moderation_submissions()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  status TEXT,
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
    s.status,
    s.created_at,
    s.user_id,
    COALESCE(p.username, CASE WHEN s.is_anonymous THEN 'Anonymous' ELSE s.username END) as username,
    COALESCE(s.email, u.email, p.email) as email,
    COALESCE(s.is_anonymous, false) as is_anonymous
  FROM 
    submissions s
  LEFT JOIN 
    user_profiles p ON s.user_id = p.id
  LEFT JOIN 
    auth.users u ON s.user_id = u.id
  WHERE 
    s.status = 'pending'
  ORDER BY
    s.created_at DESC;
  
  RETURN;
END;
$$;

-- Create a function to get all pending comments with complete user info
CREATE OR REPLACE FUNCTION get_moderation_comments()
RETURNS TABLE (
  id UUID,
  content TEXT,
  submission_id UUID,
  status TEXT,
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
    c.status,
    c.created_at,
    c.user_id,
    COALESCE(p.username, CASE WHEN c.is_anonymous THEN 'Anonymous' ELSE c.username END) as username,
    COALESCE(c.email, u.email, p.email) as email,
    COALESCE(c.is_anonymous, false) as is_anonymous
  FROM 
    comments c
  LEFT JOIN 
    user_profiles p ON c.user_id = p.id
  LEFT JOIN 
    auth.users u ON c.user_id = u.id
  WHERE 
    c.status = 'pending'
  ORDER BY
    c.created_at DESC;
  
  RETURN;
END;
$$;
