-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to manage video keywords" ON public.video_keywords;
DROP POLICY IF EXISTS "Allow authenticated users to manage featured videos" ON public.featured_videos;

-- Create simpler policies without any role checks
CREATE POLICY "Allow all operations on video keywords"
    ON public.video_keywords
    FOR ALL
    USING (true);

CREATE POLICY "Allow all operations on featured videos"
    ON public.featured_videos
    FOR ALL
    USING (true);
