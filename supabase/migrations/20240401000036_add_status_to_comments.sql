-- Drop the check constraint if it exists
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_status_check;

-- Make sure the status column exists and has the correct type
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'comments' 
                  AND column_name = 'status') THEN
        ALTER TABLE comments ADD COLUMN status text;
    END IF;
END $$;

-- Set all null statuses to pending
UPDATE comments SET status = 'pending' WHERE status IS NULL;

-- Add check constraint
ALTER TABLE comments ADD CONSTRAINT comments_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected'));