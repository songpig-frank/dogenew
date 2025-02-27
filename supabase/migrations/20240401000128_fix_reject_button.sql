-- Create a more direct function to reject comments
CREATE OR REPLACE FUNCTION do_reject_comment(comment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE comments
  SET status = 'rejected', moderated_at = NOW()
  WHERE id = comment_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION do_reject_comment(UUID) TO authenticated;
