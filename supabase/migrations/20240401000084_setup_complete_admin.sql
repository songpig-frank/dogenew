-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Create user_profiles table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  blocked BOOLEAN DEFAULT FALSE,
  blocked_reason TEXT,
  blocked_at TIMESTAMPTZ,
  CONSTRAINT fk_user
    FOREIGN KEY(id) 
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  user_id UUID PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_user
    FOREIGN KEY(user_id) 
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Everyone can read roles"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify roles"
  ON public.user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Function to update user password
CREATE OR REPLACE FUNCTION update_user_password(user_email TEXT, new_password TEXT)
RETURNS void AS $$
BEGIN
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ensure admin exists
CREATE OR REPLACE FUNCTION ensure_admin()
RETURNS void AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- First check if admin exists
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = 'super_admin@dogecuts.org';
  
  -- If admin doesn't exist, create it
  IF admin_id IS NULL THEN
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      uuid_generate_v4(),
      'super_admin@dogecuts.org',
      crypt('Wd5gks22%%', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"super_admin"}',
      true,
      'authenticated'
    )
    RETURNING id INTO admin_id;
  ELSE
    -- Update existing admin's password
    PERFORM update_user_password('super_admin@dogecuts.org', 'Wd5gks22%%');
  END IF;

  -- Ensure profile exists
  INSERT INTO public.user_profiles (id, username)
  VALUES (admin_id, 'super_admin')
  ON CONFLICT (id) DO UPDATE
  SET username = 'super_admin';

  -- Ensure admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_id, 'admin')
  ON CONFLICT (user_id) DO UPDATE
  SET role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the function to ensure admin exists
SELECT ensure_admin();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
