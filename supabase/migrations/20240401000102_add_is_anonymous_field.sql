-- Add is_anonymous field to submissions table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'is_anonymous') THEN
    ALTER TABLE submissions ADD COLUMN is_anonymous BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add is_anonymous field to comments table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'is_anonymous') THEN
    ALTER TABLE comments ADD COLUMN is_anonymous BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Update existing submissions to have is_anonymous = true if username is 'Anonymous'
UPDATE submissions
SET is_anonymous = TRUE
WHERE username = 'Anonymous' OR username IS NULL;

-- Update existing comments to have is_anonymous = true if username is 'Anonymous'
UPDATE comments
SET is_anonymous = TRUE
WHERE username = 'Anonymous' OR username IS NULL;
