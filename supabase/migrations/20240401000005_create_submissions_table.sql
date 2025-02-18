-- Create submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Praise', 'Complaint', 'Recommendation')),
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts
CREATE POLICY "Allow anonymous submissions"
  ON public.submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow public reads
CREATE POLICY "Allow public reads"
  ON public.submissions
  FOR SELECT
  TO anon
  USING (true);