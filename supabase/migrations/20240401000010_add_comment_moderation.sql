-- Add status column to comments table
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add moderated_content column
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS moderated_content TEXT;

-- Add moderation_reason column
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS moderation_reason TEXT;

-- Add moderator_id column
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS moderator_id UUID
REFERENCES auth.users(id);

-- Add moderated_at timestamp
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

-- Create a view for approved comments only
CREATE OR REPLACE VIEW public.approved_comments AS
SELECT *
FROM comments
WHERE status = 'approved' OR status = 'pending';

-- Update RLS policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy for viewing comments
CREATE POLICY "Users can view approved or pending comments"
ON comments FOR SELECT
USING (status IN ('approved', 'pending'));

-- Policy for creating comments
CREATE POLICY "Users can create comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for moderators to update comments
CREATE POLICY "Moderators can update comments"
ON comments FOR UPDATE
USING (auth.uid() IN (
  SELECT user_id FROM user_roles WHERE role = 'moderator'
));
