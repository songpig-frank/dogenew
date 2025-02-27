-- Fix admin email display in moderation screens

-- Create a function to directly access auth.users emails with text output
CREATE OR REPLACE FUNCTION get_auth_email(user_id UUID)
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

-- Update the get_pending_submissions_with_emails function to use direct auth.users access
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
    (SELECT email FROM auth.users WHERE id = s.user_id) as email,
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

-- Update the get_pending_comments_with_emails function to use direct auth.users access
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
    (SELECT email FROM auth.users WHERE id = c.user_id) as email,
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

-- Create a function to get all users with their emails for admin display
CREATE OR REPLACE FUNCTION get_users_with_emails()
RETURNS TABLE (
  id UUID,
  username TEXT,
  email TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  blocked BOOLEAN,
  blocked_reason TEXT,
  blocked_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    COALESCE(p.username, 'Anonymous') as username,
    (SELECT email FROM auth.users WHERE id = p.id) as email,
    COALESCE(r.role, 'user') as role,
    p.created_at,
    COALESCE(p.blocked, false) as blocked,
    p.blocked_reason,
    p.blocked_at
  FROM 
    user_profiles p
  LEFT JOIN
    user_roles r ON p.id = r.user_id
  ORDER BY
    p.created_at DESC;
  
  RETURN;
END;
$$;
