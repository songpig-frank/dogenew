-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can delete their own comments" ON public.comments;

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies
CREATE POLICY "Anyone can read comments"
    ON public.comments FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert comments"
    ON public.comments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update their own comments"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can delete their own comments"
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

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'comments' AND column_name = 'username') THEN
        ALTER TABLE public.comments ADD COLUMN username text;
    END IF;
END $$;