-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.comments;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.comments;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.comments;

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "Anyone can read comments"
    ON public.comments FOR SELECT
    USING (true);

CREATE POLICY "Anyone can create comments"
    ON public.comments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own comments"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);

-- Ensure comments table has required columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'comments' AND column_name = 'status') THEN
        ALTER TABLE public.comments ADD COLUMN status text DEFAULT 'approved';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'comments' AND column_name = 'upvotes') THEN
        ALTER TABLE public.comments ADD COLUMN upvotes integer DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'comments' AND column_name = 'downvotes') THEN
        ALTER TABLE public.comments ADD COLUMN downvotes integer DEFAULT 0;
    END IF;
END $$;