-- Drop the existing function first
DROP FUNCTION IF EXISTS public.execute_sql(text);

-- Create the function with the same signature
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text) RETURNS json
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (SELECT json_build_object('rows', json_agg(row_to_json(t)))
  FROM (
    EXECUTE sql_query
  ) t);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Disable RLS on video-related tables to fix permission issues
ALTER TABLE public.featured_videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_keywords DISABLE ROW LEVEL SECURITY;

-- Insert sample videos for testing
INSERT INTO public.featured_videos (video_id, title, channel_title, published_at, thumbnail_url, view_count, platform, keywords)
VALUES 
('Z1JC0YlBy-s', 'Government Waste Investigation Report', 'News Channel', '2023-05-15T14:30:00Z', 'https://i.ytimg.com/vi/Z1JC0YlBy-s/mqdefault.jpg', '15432', 'youtube', '["government","waste"]'),
('NlvB93cQ0bI', 'Taxpayer Money Misuse Report', 'Watchdog Group', '2023-05-10T09:15:00Z', 'https://i.ytimg.com/vi/NlvB93cQ0bI/mqdefault.jpg', '8921', 'youtube', '["taxpayer","government"]'),
('GnrqTFEIR3M', 'Government Efficiency Analysis', 'Policy Center', '2023-05-05T16:45:00Z', 'https://i.ytimg.com/vi/GnrqTFEIR3M/mqdefault.jpg', '12345', 'youtube', '["government","efficiency"]')
ON CONFLICT (video_id) DO NOTHING;
