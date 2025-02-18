-- Insert test submissions
INSERT INTO submissions (title, description, category, status, likes, comments)
VALUES 
  ('Road Repair Needed', 'There is a large pothole on Main Street that needs immediate attention.', 'Complaint', 'pending', 0, 0),
  ('Great Park Maintenance', 'The city parks team has done an amazing job maintaining Central Park!', 'Praise', 'pending', 0, 0),
  ('Traffic Light Suggestion', 'We need a traffic light at the intersection of Oak and Pine.', 'Recommendation', 'pending', 0, 0);

-- Insert test comments
INSERT INTO comments (content, submission_id, status)
SELECT 
  'This is a serious safety issue that needs attention.',
  id,
  'pending'
FROM submissions
WHERE title = 'Road Repair Needed';

INSERT INTO comments (content, submission_id, status)
SELECT 
  'I agree, the parks have never looked better!',
  id,
  'pending'
FROM submissions
WHERE title = 'Great Park Maintenance';