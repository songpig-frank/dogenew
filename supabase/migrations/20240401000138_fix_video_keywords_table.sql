-- Drop existing video_keywords table if it exists
DROP TABLE IF EXISTS public.video_keywords;

-- Create a new video_keywords table without RLS
CREATE TABLE public.video_keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(keyword)
);

-- Disable RLS on the table
ALTER TABLE public.video_keywords DISABLE ROW LEVEL SECURITY;

-- Grant all privileges to authenticated users
GRANT ALL ON public.video_keywords TO authenticated;

-- Create featured_videos table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.featured_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    channel_title TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    thumbnail_url TEXT,
    view_count TEXT,
    platform TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(video_id)
);

-- Disable RLS on featured_videos
ALTER TABLE public.featured_videos DISABLE ROW LEVEL SECURITY;

-- Grant all privileges to authenticated users
GRANT ALL ON public.featured_videos TO authenticated;
