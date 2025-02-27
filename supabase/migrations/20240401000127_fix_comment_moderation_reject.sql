-- Create a function to directly reject a comment
CREATE OR REPLACE FUNCTION reject_comment(comment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE comments
  SET status = 'rejected', moderated_at = NOW()
  WHERE id = comment_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reject_comment(UUID) TO authenticated;
