-- Create comment_votes table
CREATE TABLE IF NOT EXISTS comment_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS comment_votes_comment_id_idx ON comment_votes(comment_id);
CREATE INDEX IF NOT EXISTS comment_votes_user_id_idx ON comment_votes(user_id);
