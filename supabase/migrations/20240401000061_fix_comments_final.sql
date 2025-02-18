-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.comments;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.comments;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.comments;

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