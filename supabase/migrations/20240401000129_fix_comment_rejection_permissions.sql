-- Create a function to directly reject a comment with elevated permissions
CREATE OR REPLACE FUNCTION super_reject_comment(comment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Use explicit schema and table name
  UPDATE public.comments
  SET status = 'rejected', moderated_at = NOW()
  WHERE id = comment_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION super_reject_comment(UUID) TO authenticated;

-- Create a function to get pending comments with user info
CREATE OR REPLACE FUNCTION get_pending_comments_with_user_info()
RETURNS SETOF public.comments AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.comments
  WHERE status = 'pending'
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_pending_comments_with_user_info() TO authenticated;
