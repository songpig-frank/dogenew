-- Add upvotes and downvotes columns to comments table if they don't exist
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS upvotes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes integer DEFAULT 0;