-- Add moderated_at column to comments table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'moderated_at') THEN
        ALTER TABLE public.comments ADD COLUMN moderated_at TIMESTAMPTZ;
    END IF;
END
$$;

-- Create a function to reject comments without using moderated_at
CREATE OR REPLACE FUNCTION simple_reject_comment(comment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.comments
  SET status = 'rejected'
  WHERE id = comment_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION simple_reject_comment(UUID) TO authenticated;
