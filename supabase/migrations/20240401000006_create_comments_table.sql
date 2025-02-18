-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    content TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access"
    ON public.comments FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert"
    ON public.comments FOR INSERT
    WITH CHECK (true);

-- Create indexes
CREATE INDEX comments_submission_id_idx ON public.comments(submission_id);
CREATE INDEX comments_user_id_idx ON public.comments(user_id);
