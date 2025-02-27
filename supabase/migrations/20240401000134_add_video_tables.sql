-- Create table for video keywords
CREATE TABLE IF NOT EXISTS public.video_keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(keyword)
);

-- Create table for featured videos
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

-- Add RLS policies
ALTER TABLE public.video_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_videos ENABLE ROW LEVEL SECURITY;

-- Allow admins and moderators to manage video keywords
CREATE POLICY "Allow admins and moderators to manage video keywords"
    ON public.video_keywords
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Allow admins and moderators to manage featured videos
CREATE POLICY "Allow admins and moderators to manage featured videos"
    ON public.featured_videos
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Allow all users to read featured videos
CREATE POLICY "Allow all users to read featured videos"
    ON public.featured_videos
    FOR SELECT
    USING (true);
