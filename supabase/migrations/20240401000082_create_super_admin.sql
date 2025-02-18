-- Create the super admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'super_admin@dogecuts.org',
  crypt('Wd5gks22%%', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create the user profile
INSERT INTO public.user_profiles (id, username)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'super_admin'
)
ON CONFLICT (id) DO NOTHING;

-- Ensure admin role
INSERT INTO public.user_roles (user_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin'
)
ON CONFLICT (user_id) DO NOTHING;
