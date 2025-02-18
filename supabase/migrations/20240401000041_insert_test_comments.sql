-- Insert test submissions if none exist
INSERT INTO submissions (id, title, description, category, status, user_id, likes, comments)
SELECT 
  gen_random_uuid(),
  'Test Submission ' || n,
  'This is test submission ' || n,
  CASE (n % 3)
    WHEN 0 THEN 'Praise'
    WHEN 1 THEN 'Complaint'
    ELSE 'Recommendation'
  END,
  'pending',
  (SELECT user_id FROM user_roles WHERE role = 'admin' LIMIT 1),
  0,
  0
FROM generate_series(1, 3) n
WHERE NOT EXISTS (SELECT 1 FROM submissions LIMIT 1);

-- Insert test comments
INSERT INTO comments (content, submission_id, user_id, status)
SELECT 
  'Test pending comment ' || n,
  (SELECT id FROM submissions ORDER BY created_at DESC LIMIT 1),
  (SELECT user_id FROM user_roles WHERE role = 'admin' LIMIT 1),
  'pending'
FROM generate_series(1, 3) n;
