-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read approved comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Admins/mods can update any comment" ON public.comments;

-- Create new policies
CREATE POLICY "Anyone can read comments"
  ON public.comments
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create comments"
  ON public.comments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update comments"
  ON public.comments
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete comments"
  ON public.comments
  FOR DELETE
  USING (true);