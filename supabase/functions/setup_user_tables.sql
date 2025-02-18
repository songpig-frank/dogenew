-- Create function to set up user_profiles table
CREATE OR REPLACE FUNCTION create_user_profiles_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    blocked BOOLEAN DEFAULT FALSE,
    blocked_reason TEXT,
    blocked_at TIMESTAMPTZ
  );

  -- Create index
  CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);

  -- Enable RLS
  ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

  -- Create policies
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
  CREATE POLICY "Public profiles are viewable by everyone"
    ON public.user_profiles FOR SELECT
    USING (true);

  DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
  CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);
END;
$$ LANGUAGE plpgsql;

-- Create function to set up user_roles table
CREATE OR REPLACE FUNCTION create_user_roles_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Create index
  CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

  -- Enable RLS
  ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

  -- Create policies
  DROP POLICY IF EXISTS "Everyone can read roles" ON public.user_roles;
  CREATE POLICY "Everyone can read roles"
    ON public.user_roles FOR SELECT
    USING (true);

  DROP POLICY IF EXISTS "Only admins can modify roles" ON public.user_roles;
  CREATE POLICY "Only admins can modify roles"
    ON public.user_roles FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
      )
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to ensure admin user exists
CREATE OR REPLACE FUNCTION ensure_admin_user()
RETURNS void AS $$
BEGIN
  -- Insert admin user profile if not exists
  INSERT INTO public.user_profiles (id, username)
  SELECT id, 'super_admin'
  FROM auth.users
  WHERE email = 'super_admin@dogecuts.org'
  ON CONFLICT (id) DO NOTHING;

  -- Ensure admin role
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'
  FROM auth.users
  WHERE email = 'super_admin@dogecuts.org'
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;