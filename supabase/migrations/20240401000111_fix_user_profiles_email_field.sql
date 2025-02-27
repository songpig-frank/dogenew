-- Add email column to user_profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'email') THEN
        ALTER TABLE public.user_profiles ADD COLUMN email TEXT;
    END IF;
END$$;

-- Update the handle_new_user function to properly handle email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create a user profile with display_name set to username
  INSERT INTO public.user_profiles (id, username, display_name, email, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    email = EXCLUDED.email;
  
  -- Create a user role (default to 'user')
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the transaction
  RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Create a function to manually sync user profiles with auth users
CREATE OR REPLACE FUNCTION public.sync_user_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN 
    SELECT id, email, raw_user_meta_data, created_at 
    FROM auth.users
  LOOP
    -- Insert or update user profile
    INSERT INTO public.user_profiles (id, username, display_name, email, created_at)
    VALUES (
      auth_user.id,
      COALESCE(auth_user.raw_user_meta_data->>'username', split_part(auth_user.email, '@', 1)),
      COALESCE(auth_user.raw_user_meta_data->>'username', split_part(auth_user.email, '@', 1)),
      auth_user.email,
      auth_user.created_at
    )
    ON CONFLICT (id) DO UPDATE SET
      username = COALESCE(EXCLUDED.username, public.user_profiles.username),
      display_name = COALESCE(EXCLUDED.display_name, public.user_profiles.display_name),
      email = EXCLUDED.email;
      
    -- Create user role if missing
    INSERT INTO public.user_roles (user_id, role)
    VALUES (auth_user.id, 'user')
    ON CONFLICT (user_id) DO NOTHING;
  END LOOP;
END;
$$;

-- Run the sync function to update existing profiles
SELECT sync_user_profiles();
