-- Add roles for existing users
INSERT INTO user_roles (user_id, role)
SELECT id, 'user' FROM user_profiles
WHERE id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id) DO NOTHING;

-- Add admin role for specific users
UPDATE user_roles
SET role = 'admin'
WHERE user_id IN (
  '1f530b58-3f5c-4e47-8c90-fbef47a7f3f7',
  '31c976ca-b037-4c35-9ce3-7f04a7754a6e'
);

-- Make sure all auth users have profiles
INSERT INTO user_profiles (id, username, created_at)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'username', email), 
  created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO NOTHING;
