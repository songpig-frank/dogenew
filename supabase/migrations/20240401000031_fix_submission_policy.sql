-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON submissions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON submissions;

-- Create new policies
CREATE POLICY "Anyone can read submissions"
ON submissions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create submissions"
ON submissions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their own submissions"
ON submissions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any submission"
ON submissions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);