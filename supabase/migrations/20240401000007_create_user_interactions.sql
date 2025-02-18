CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, submission_id, type)
);

CREATE OR REPLACE FUNCTION increment_likes(submission_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE submissions
  SET likes = likes + 1
  WHERE id = submission_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_likes(submission_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE submissions
  SET likes = GREATEST(0, likes - 1)
  WHERE id = submission_id;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own interactions"
  ON user_interactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions"
  ON user_interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions"
  ON user_interactions
  FOR DELETE
  USING (auth.uid() = user_id);