-- Insert test submissions
INSERT INTO public.submissions (title, description, category, status, likes, comments)
VALUES 
  ('Road Repair Needed', 'There is a large pothole on Main Street that needs immediate attention.', 'Complaint', 'pending', 0, 0),
  ('Great Park Maintenance', 'The city parks team has done an amazing job maintaining Central Park!', 'Praise', 'pending', 0, 0),
  ('Traffic Light Suggestion', 'We need a traffic light at the intersection of Oak and Pine.', 'Recommendation', 'pending', 0, 0);

-- Insert test comments for the first submission
INSERT INTO public.comments (content, submission_id, status)
SELECT 
  'This is a serious safety issue that needs attention.',
  id,
  'pending'
FROM public.submissions
WHERE title = 'Road Repair Needed';

-- Insert test comments for the second submission
INSERT INTO public.comments (content, submission_id, status)
SELECT 
  'I agree, the parks have never looked better!',
  id,
  'pending'
FROM public.submissions
WHERE title = 'Great Park Maintenance';