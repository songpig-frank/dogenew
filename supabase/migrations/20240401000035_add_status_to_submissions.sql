-- Drop the check constraint if it exists
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_status_check;

-- Make sure the status column exists and has the correct type
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'submissions' 
                  AND column_name = 'status') THEN
        ALTER TABLE submissions ADD COLUMN status text;
    END IF;
END $$;

-- Set all null statuses to pending
UPDATE submissions SET status = 'pending' WHERE status IS NULL;

-- Add check constraint
ALTER TABLE submissions ADD CONSTRAINT submissions_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected'));