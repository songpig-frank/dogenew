-- Create YouTube channels table
CREATE TABLE IF NOT EXISTS public.youtube_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('approved', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.youtube_channels ENABLE ROW LEVEL SECURITY;

-- Create featured videos table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.featured_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  channel_title TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  thumbnail_url TEXT,
  view_count TEXT,
  platform TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.featured_videos ENABLE ROW LEVEL SECURITY;

-- Create video keywords table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.video_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.video_keywords ENABLE ROW LEVEL SECURITY;