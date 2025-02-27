-- Add RLS policies for anonymous users to youtube_channels table
CREATE POLICY youtube_channels_insert_policy_anon ON youtube_channels FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY youtube_channels_select_policy_anon ON youtube_channels FOR SELECT TO anon USING (true);
CREATE POLICY youtube_channels_update_policy_anon ON youtube_channels FOR UPDATE TO anon USING (true);
CREATE POLICY youtube_channels_delete_policy_anon ON youtube_channels FOR DELETE TO anon USING (true);

-- Add RLS policies for anonymous users to featured_videos table
CREATE POLICY featured_videos_insert_policy_anon ON featured_videos FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY featured_videos_select_policy_anon ON featured_videos FOR SELECT TO anon USING (true);
CREATE POLICY featured_videos_update_policy_anon ON featured_videos FOR UPDATE TO anon USING (true);
CREATE POLICY featured_videos_delete_policy_anon ON featured_videos FOR DELETE TO anon USING (true);

-- Add RLS policies for anonymous users to video_keywords table
CREATE POLICY video_keywords_insert_policy_anon ON video_keywords FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY video_keywords_select_policy_anon ON video_keywords FOR SELECT TO anon USING (true);
CREATE POLICY video_keywords_update_policy_anon ON video_keywords FOR UPDATE TO anon USING (true);
CREATE POLICY video_keywords_delete_policy_anon ON video_keywords FOR DELETE TO anon USING (true);