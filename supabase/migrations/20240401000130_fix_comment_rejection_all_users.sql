-- Create a function with SECURITY DEFINER to reject comments regardless of user
CREATE OR REPLACE FUNCTION admin_reject_comment(comment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Use explicit schema and table name with SECURITY DEFINER privilege
  UPDATE public.comments
  SET status = 'rejected', moderated_at = NOW()
  WHERE id = comment_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_reject_comment(UUID) TO authenticated;
