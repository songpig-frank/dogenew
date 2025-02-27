-- Fix the issue with email not showing in moderation screens

-- Create a function to get submission with user email
CREATE OR REPLACE FUNCTION get_submission_with_email(submission_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  status TEXT,
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
    s.user_id,
    COALESCE(p.username, 'Anonymous') as username,
    COALESCE(u.email, p.email) as email,
    COALESCE(s.is_anonymous, false) as is_anonymous
  FROM 
    submissions s
  LEFT JOIN 
    user_profiles p ON s.user_id = p.id
  LEFT JOIN 
    auth.users u ON s.user_id = u.id
  WHERE 
    s.id = submission_id;
  
  RETURN;
END;
$$;

-- Create a function to get comment with user email
CREATE OR REPLACE FUNCTION get_comment_with_email(comment_id UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  submission_id UUID,
  status TEXT,
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
    c.user_id,
    COALESCE(p.username, 'Anonymous') as username,
    COALESCE(u.email, p.email) as email,
    COALESCE(c.is_anonymous, false) as is_anonymous
  FROM 
    comments c
  LEFT JOIN 
    user_profiles p ON c.user_id = p.id
  LEFT JOIN 
    auth.users u ON c.user_id = u.id
  WHERE 
    c.id = comment_id;
  
  RETURN;
END;
$$;

-- Create a function to get all pending submissions with user emails
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
    COALESCE(p.username, 'Anonymous') as username,
    COALESCE(u.email, p.email) as email,
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

-- Create a function to get all pending comments with user emails
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
    COALESCE(p.username, 'Anonymous') as username,
    COALESCE(u.email, p.email) as email,
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

-- Update the submissions table to ensure it has an email column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'submissions' 
                 AND column_name = 'email') THEN
    ALTER TABLE public.submissions ADD COLUMN email TEXT;
  END IF;

  -- Update existing submissions with email from auth.users
  UPDATE public.submissions s
  SET email = u.email
  FROM auth.users u
  WHERE s.user_id = u.id AND s.email IS NULL;

  -- Update existing submissions with email from user_profiles as fallback
  UPDATE public.submissions s
  SET email = p.email
  FROM public.user_profiles p
  WHERE s.user_id = p.id AND s.email IS NULL;
END$$;

-- Update the comments table to ensure it has an email column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'comments' 
                 AND column_name = 'email') THEN
    ALTER TABLE public.comments ADD COLUMN email TEXT;
  END IF;

  -- Update existing comments with email from auth.users
  UPDATE public.comments c
  SET email = u.email
  FROM auth.users u
  WHERE c.user_id = u.id AND c.email IS NULL;

  -- Update existing comments with email from user_profiles as fallback
  UPDATE public.comments c
  SET email = p.email
  FROM public.user_profiles p
  WHERE c.user_id = p.id AND c.email IS NULL;
END$$;
