-- Create admin user if not exists
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Ensure user profile exists
INSERT INTO user_profiles (id, username, email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin',
  'admin@example.com'
)
ON CONFLICT (id) DO NOTHING;

-- Ensure admin role exists
INSERT INTO user_roles (user_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin'
)
ON CONFLICT (user_id) DO NOTHING;
