-- Add email field to submissions table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'email') THEN
    ALTER TABLE submissions ADD COLUMN email TEXT;
  END IF;
END $$;

-- Add email field to comments table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'email') THEN
    ALTER TABLE comments ADD COLUMN email TEXT;
  END IF;
END $$;
