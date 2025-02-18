-- Add social sharing columns to submissions table
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS og_title TEXT,
ADD COLUMN IF NOT EXISTS og_description TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT,
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- Create social_meta table
CREATE TABLE IF NOT EXISTS social_meta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to increment share count
CREATE OR REPLACE FUNCTION increment_share_count(submission_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE submissions
  SET share_count = COALESCE(share_count, 0) + 1
  WHERE id = submission_id
  RETURNING share_count INTO new_count;
  
  RETURN new_count;
END;
$$;