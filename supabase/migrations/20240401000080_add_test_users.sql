-- Create test users
DO $$
DECLARE
  user1_id UUID;
  user2_id UUID;
  user3_id UUID;
BEGIN
  -- Create test user 1
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    'test1@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"testuser1"}'
  )
  RETURNING id INTO user1_id;

  -- Create test user 2
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    'test2@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"testuser2"}'
  )
  RETURNING id INTO user2_id;

  -- Create test user 3
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    'test3@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"testuser3"}'
  )
  RETURNING id INTO user3_id;

  -- Create user profiles
  INSERT INTO public.user_profiles (id, username) VALUES
    (user1_id, 'testuser1'),
    (user2_id, 'testuser2'),
    (user3_id, 'testuser3');

  -- Assign roles
  INSERT INTO public.user_roles (user_id, role) VALUES
    (user1_id, 'moderator'),
    (user2_id, 'user'),
    (user3_id, 'user');

END $$;
