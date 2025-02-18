-- Create social_meta table
CREATE TABLE IF NOT EXISTS social_meta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add OG fields to submissions
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS og_title TEXT,
ADD COLUMN IF NOT EXISTS og_description TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT,
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- Create function to increment share count
CREATE OR REPLACE FUNCTION increment_share_count(submission_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE submissions
  SET share_count = COALESCE(share_count, 0) + 1
  WHERE id = submission_id;
END;
$$;

-- Add RLS policies
ALTER TABLE social_meta ENABLE ROW LEVEL SECURITY;

-- Everyone can read social meta
CREATE POLICY "Social meta is viewable by everyone"
ON social_meta FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify social meta
CREATE POLICY "Only admins can modify social meta"
ON social_meta FOR ALL
TO authenticated
USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- Insert default social meta
INSERT INTO social_meta (type, title, description, image_url)
VALUES 
('default', 'DOGEcuts.org - Government Efficiency Platform', 'Help improve government efficiency by sharing your feedback, suggestions, and experiences.', 'https://dogecuts.org/dogecuts-logo.webp'),
('submission', 'Community Feedback | DOGEcuts.org', 'View and discuss community feedback about government efficiency', 'https://dogecuts.org/dogecuts-logo.webp')
ON CONFLICT (type) DO NOTHING;