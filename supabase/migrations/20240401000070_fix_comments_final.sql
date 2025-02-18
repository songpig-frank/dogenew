-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;

-- Create new policies
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Update existing comments to approved
UPDATE comments SET status = 'approved' WHERE status IS NULL;

-- Add RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON comments TO anon;
GRANT SELECT, INSERT ON comments TO authenticated;

-- Add index
CREATE INDEX IF NOT EXISTS idx_comments_submission_id ON comments(submission_id);

-- Fix comment count trigger
CREATE OR REPLACE FUNCTION update_submission_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE submissions
    SET comments = comments + 1
    WHERE id = NEW.submission_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE submissions
    SET comments = comments - 1
    WHERE id = OLD.submission_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_submission_comment_count ON comments;
CREATE TRIGGER update_submission_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_submission_comment_count();