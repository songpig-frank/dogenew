-- Add RLS policies for youtube_channels table
CREATE POLICY youtube_channels_insert_policy ON youtube_channels FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY youtube_channels_select_policy ON youtube_channels FOR SELECT TO authenticated USING (true);
CREATE POLICY youtube_channels_update_policy ON youtube_channels FOR UPDATE TO authenticated USING (true);
CREATE POLICY youtube_channels_delete_policy ON youtube_channels FOR DELETE TO authenticated USING (true);

-- Add RLS policies for featured_videos table
CREATE POLICY featured_videos_insert_policy ON featured_videos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY featured_videos_select_policy ON featured_videos FOR SELECT TO authenticated USING (true);
CREATE POLICY featured_videos_update_policy ON featured_videos FOR UPDATE TO authenticated USING (true);
CREATE POLICY featured_videos_delete_policy ON featured_videos FOR DELETE TO authenticated USING (true);

-- Add RLS policies for video_keywords table
CREATE POLICY video_keywords_insert_policy ON video_keywords FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY video_keywords_select_policy ON video_keywords FOR SELECT TO authenticated USING (true);
CREATE POLICY video_keywords_update_policy ON video_keywords FOR UPDATE TO authenticated USING (true);
CREATE POLICY video_keywords_delete_policy ON video_keywords FOR DELETE TO authenticated USING (true);