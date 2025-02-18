-- Add status column to comments table
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Update existing comments to have pending status
UPDATE comments SET status = 'pending' WHERE status IS NULL;

-- Add status to submissions table if not exists
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Update existing submissions to have pending status
UPDATE submissions SET status = 'pending' WHERE status IS NULL;