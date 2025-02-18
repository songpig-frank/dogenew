-- Drop existing policies and triggers
DROP POLICY IF EXISTS "Allow read access to comments" ON comments;
DROP POLICY IF EXISTS "Allow insert access to comments" ON comments;

-- Ensure comments table exists with correct structure
CREATE TABLE IF NOT EXISTS comments (
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
CREATE POLICY "Enable read access for all users"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Reset RLS
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_submission_id ON comments(submission_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
