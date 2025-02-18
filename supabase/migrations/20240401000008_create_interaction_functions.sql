-- Create the increment_likes function
CREATE OR REPLACE FUNCTION increment_likes(submission_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE submissions
  SET likes = likes + 1
  WHERE id = submission_id;
END;
$$;

-- Create the decrement_likes function
CREATE OR REPLACE FUNCTION decrement_likes(submission_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE submissions
  SET likes = GREATEST(0, likes - 1)
  WHERE id = submission_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_likes(UUID) TO authenticated;

-- Add RLS policies for user_interactions
CREATE POLICY "Enable insert for authenticated users only"
  ON public.user_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id"
  ON public.user_interactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable select for users based on user_id"
  ON public.user_interactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
