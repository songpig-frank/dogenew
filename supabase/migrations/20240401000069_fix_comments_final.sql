-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;

-- Create new policies
CREATE POLICY "Anyone can view comments" ON comments
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON comments
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Add necessary indexes
CREATE INDEX IF NOT EXISTS idx_comments_submission_id ON comments(submission_id);

-- Grant permissions
GRANT SELECT ON comments TO anon;
GRANT SELECT, INSERT ON comments TO authenticated;

-- Update existing comments to approved
UPDATE comments SET status = 'approved' WHERE status IS NULL;