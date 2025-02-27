-- Fix the DO block syntax in previous migrations

-- Create a function to manually create profiles for users that don't have them
CREATE OR REPLACE FUNCTION public.create_missing_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_user RECORD;
  username_val TEXT;
  display_name_val TEXT;
  counter INT;
  unique_username TEXT;
  profile_exists BOOLEAN;
BEGIN
  -- Loop through all auth users
  FOR auth_user IN 
    SELECT id, email, raw_user_meta_data, created_at 
    FROM auth.users
  LOOP
    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE id = auth_user.id) INTO profile_exists;
    
    IF NOT profile_exists THEN
      -- Generate username and display name
      username_val := COALESCE(auth_user.raw_user_meta_data->>'username', split_part(auth_user.email, '@', 1));
      display_name_val := username_val;
      unique_username := username_val;
      counter := 0;
      
      -- Handle username conflicts
      WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = unique_username) LOOP
        counter := counter + 1;
        unique_username := username_val || counter;
      END LOOP;
      
      -- Create profile
      BEGIN
        INSERT INTO public.user_profiles (id, username, display_name, email, created_at)
        VALUES (
          auth_user.id,
          unique_username,
          display_name_val,
          auth_user.email,
          auth_user.created_at
        );
        RAISE NOTICE 'Created profile for user %', auth_user.id;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating profile for user %: %', auth_user.id, SQLERRM;
      END;
    END IF;
    
    -- Check if role exists
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth_user.id) THEN
      -- Create role
      BEGIN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (auth_user.id, 'user');
        RAISE NOTICE 'Created role for user %', auth_user.id;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating role for user %: %', auth_user.id, SQLERRM;
      END;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Profile sync complete';
END;
$$;

-- Create a function to fix the specific user bbb@dogecuts.org
CREATE OR REPLACE FUNCTION public.fix_specific_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  username_val TEXT := 'bbb';
BEGIN
  -- Find the user ID for bbb@dogecuts.org
  SELECT id INTO user_id FROM auth.users WHERE email = 'bbb@dogecuts.org';
  
  IF user_id IS NOT NULL THEN
    -- Create profile if it doesn't exist
    INSERT INTO public.user_profiles (id, username, display_name, email, created_at)
    VALUES (
      user_id,
      username_val,
      username_val,
      'bbb@dogecuts.org',
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      display_name = EXCLUDED.display_name,
      email = EXCLUDED.email;
    
    -- Create role if it doesn't exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_id, 'user')
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Fixed user bbb@dogecuts.org with ID %', user_id;
  ELSE
    RAISE NOTICE 'User bbb@dogecuts.org not found in auth.users';
  END IF;
END;
$$;

-- Run the functions
SELECT create_missing_profiles();
SELECT fix_specific_user();
