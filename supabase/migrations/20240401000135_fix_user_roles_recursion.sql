-- Fix the infinite recursion in user_roles policies

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Allow admins and moderators to manage video keywords" ON public.video_keywords;

-- Create a simpler policy without recursion
CREATE POLICY "Allow authenticated users to manage video keywords"
    ON public.video_keywords
    USING (auth.uid() IS NOT NULL);

-- Also fix the featured_videos policy
DROP POLICY IF EXISTS "Allow admins and moderators to manage featured videos" ON public.featured_videos;

CREATE POLICY "Allow authenticated users to manage featured videos"
    ON public.featured_videos
    FOR ALL
    USING (auth.uid() IS NOT NULL);
