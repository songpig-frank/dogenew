-- Fix the handle_new_user function to not use DECLARE outside of a BEGIN block
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
  username_val TEXT;
  display_name_val TEXT;
  counter INT;
  unique_username TEXT;
 BEGIN
  FOR auth_user IN 
    SELECT id, email, raw_user_meta_data, created_at 
    FROM auth.users
  LOOP
    -- Get username from metadata or email
    username_val := COALESCE(auth_user.raw_user_meta_data->>'username', split_part(auth_user.email, '@', 1));
    display_name_val := username_val;
    unique_username := username_val;
    counter := 0;
    
    -- Check if this user already has a profile
    IF EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth_user.id) THEN
      -- User already has a profile, just update it
      UPDATE public.user_profiles
      SET email = auth_user.email
      WHERE id = auth_user.id;
    ELSE
      -- Handle username conflicts by adding a number suffix
      WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = unique_username) LOOP
        counter := counter + 1;
        unique_username := username_val || counter;
      END LOOP;
      
      -- Insert new profile
      INSERT INTO public.user_profiles (id, username, display_name, email, created_at)
      VALUES (
        auth_user.id,
        unique_username,
        display_name_val,
        auth_user.email,
        auth_user.created_at
      );
    END IF;
    
    -- Create user role if missing
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth_user.id) THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (auth_user.id, 'user');
    END IF;
  END LOOP;
 END;
$$;

-- Run the sync function to update existing profiles
SELECT sync_user_profiles();
