-- Fix array syntax in featured_videos table
ALTER TABLE public.featured_videos ALTER COLUMN keywords TYPE jsonb USING keywords::jsonb;

-- Insert sample videos with proper jsonb format
INSERT INTO public.featured_videos (video_id, title, channel_title, published_at, thumbnail_url, view_count, platform, keywords)
VALUES 
('Z1JC0YlBy-s', 'Government Waste Investigation Report', 'News Channel', '2023-05-15T14:30:00Z', 'https://i.ytimg.com/vi/Z1JC0YlBy-s/mqdefault.jpg', '15432', 'youtube', '["government","waste"]'::jsonb),
('NlvB93cQ0bI', 'Taxpayer Money Misuse Report', 'Watchdog Group', '2023-05-10T09:15:00Z', 'https://i.ytimg.com/vi/NlvB93cQ0bI/mqdefault.jpg', '8921', 'youtube', '["taxpayer","government"]'::jsonb),
('GnrqTFEIR3M', 'Government Efficiency Analysis', 'Policy Center', '2023-05-05T16:45:00Z', 'https://i.ytimg.com/vi/GnrqTFEIR3M/mqdefault.jpg', '12345', 'youtube', '["government","efficiency"]'::jsonb)
ON CONFLICT (video_id) DO NOTHING;
