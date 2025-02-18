-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON comments;

-- Recreate comments table
DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  submission_id UUID REFERENCES submissions(id),
  status TEXT DEFAULT 'pending',
  username TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0
);

-- Create simple policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for comment owners"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_submission_id ON comments(submission_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Insert test comment
INSERT INTO comments (content, submission_id, username, status)
VALUES ('Test comment', '5e2f61fa-48d9-4f64-a7b1-99bb04b85268', 'TestUser', 'approved');