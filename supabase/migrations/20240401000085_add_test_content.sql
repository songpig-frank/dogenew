-- Insert test submission
INSERT INTO public.submissions (
  id,
  title,
  description,
  category,
  status,
  likes,
  comments,
  user_id,
  username
) VALUES (
  uuid_generate_v4(),
  'Test Submission for Moderation',
  'This is a test submission that needs to be moderated',
  'Recommendation',
  'pending',
  0,
  0,
  (SELECT id FROM auth.users WHERE email = 'super_admin@dogecuts.org'),
  'super_admin'
);

-- Insert test comment
INSERT INTO public.comments (
  content,
  submission_id,
  user_id,
  status,
  upvotes,
  downvotes,
  username
) VALUES (
  'This is a test comment that needs moderation',
  (SELECT id FROM public.submissions ORDER BY created_at DESC LIMIT 1),
  (SELECT id FROM auth.users WHERE email = 'super_admin@dogecuts.org'),
  'pending',
  0,
  0,
  'super_admin'
);
