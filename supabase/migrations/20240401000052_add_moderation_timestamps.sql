-- Add moderation timestamps to submissions
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id);

-- Add moderation timestamps to comments
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id);

-- Create moderation stats view
CREATE OR REPLACE VIEW moderation_stats AS
SELECT
  moderator.id as moderator_id,
  up.username,
  COUNT(DISTINCT s.id) as submissions_moderated,
  COUNT(DISTINCT c.id) as comments_moderated,
  AVG(EXTRACT(EPOCH FROM (s.moderated_at - s.created_at))/60) as avg_submission_response_time,
  AVG(EXTRACT(EPOCH FROM (c.moderated_at - c.created_at))/60) as avg_comment_response_time
FROM auth.users moderator
LEFT JOIN user_profiles up ON up.id = moderator.id
LEFT JOIN submissions s ON s.moderated_by = moderator.id
LEFT JOIN comments c ON c.moderated_by = moderator.id
WHERE moderator.id IN (
  SELECT user_id FROM user_roles WHERE role IN ('admin', 'moderator')
)
GROUP BY moderator.id, up.username;