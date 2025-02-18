-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('submission-media', 'submission-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies directly on objects table
CREATE POLICY "Anyone can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'submission-media');

CREATE POLICY "Anyone can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'submission-media');