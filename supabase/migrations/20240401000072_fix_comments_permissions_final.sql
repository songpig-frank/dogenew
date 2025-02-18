-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access to comments" ON comments;
DROP POLICY IF EXISTS "Allow insert access to comments" ON comments;

-- Create new simplified policies
CREATE POLICY "Allow read access to comments"
  ON comments
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert access to comments"
  ON comments
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
