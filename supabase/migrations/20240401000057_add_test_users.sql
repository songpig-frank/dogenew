-- Create test admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'super_admin@dogecuts.org', '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF', NOW(), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'moderator@dogecuts.org', '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add user profiles
INSERT INTO public.user_profiles (id, username, is_anonymous)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'super_admin', false),
  ('00000000-0000-0000-0000-000000000002', 'moderator', false)
ON CONFLICT (id) DO NOTHING;

-- Add roles
INSERT INTO public.user_roles (user_id, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'moderator')
ON CONFLICT (user_id) DO NOTHING;
