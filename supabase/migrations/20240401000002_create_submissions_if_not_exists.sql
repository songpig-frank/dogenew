-- Create submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Praise', 'Complaint', 'Recommendation')),
  media_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0
);