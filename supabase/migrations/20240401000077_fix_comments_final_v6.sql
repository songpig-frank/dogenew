-- Drop and recreate comment_votes table first since it depends on comments
DROP TABLE IF EXISTS comment_votes CASCADE;

-- Drop and recreate comments table
DROP TABLE IF EXISTS comments CASCADE;

-- Create comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  submission_id UUID REFERENCES submissions(id),
  status TEXT DEFAULT 'approved',
  username TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0
);

-- Create comment_votes table
CREATE TABLE comment_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  vote_type TEXT CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;

-- Create simple policies
DROP POLICY IF EXISTS "Enable read access for all users" ON comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON comments;
DROP POLICY IF EXISTS "Enable update for comment owners" ON comments;

CREATE POLICY "Enable read access for all users"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for comment owners"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Add test comment
INSERT INTO comments (content, submission_id, username, status)
VALUES ('Test comment', '5e2f61fa-48d9-4f64-a7b1-99bb04b85268', 'TestUser', 'approved');
