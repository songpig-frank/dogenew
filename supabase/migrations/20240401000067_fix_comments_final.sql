-- Drop existing policies
DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;

-- Create simplified policies
CREATE POLICY "Anyone can view comments" ON comments
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON comments
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_comments_submission_id ON comments(submission_id);

-- Grant necessary permissions
GRANT SELECT ON comments TO anon;
GRANT SELECT, INSERT ON comments TO authenticated;