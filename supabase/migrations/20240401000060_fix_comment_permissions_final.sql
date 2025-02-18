-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.comments;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.comments;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.comments;

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Enable read access for all users"
    ON public.comments FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for users based on user_id"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);