-- This migration fixes the user_profiles table by ensuring it has all required columns

-- First, add the email column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'email') THEN
        ALTER TABLE public.user_profiles ADD COLUMN email TEXT;
    END IF;

    -- Add display_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'display_name') THEN
        ALTER TABLE public.user_profiles ADD COLUMN display_name TEXT;
    END IF;

    -- Add is_anonymous column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'is_anonymous') THEN
        ALTER TABLE public.user_profiles ADD COLUMN is_anonymous BOOLEAN DEFAULT FALSE;
    END IF;

    -- Update existing profiles to have display_name = username if null
    UPDATE public.user_profiles 
    SET display_name = username 
    WHERE display_name IS NULL;

    -- Update existing profiles with email from auth.users
    UPDATE public.user_profiles p
    SET email = u.email
    FROM auth.users u
    WHERE p.id = u.id AND p.email IS NULL;

    -- Fix the handle_new_user function to properly handle all fields
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      username_val TEXT;
      display_name_val TEXT;
      counter INT := 0;
      unique_username TEXT;
    BEGIN
      -- Get username from metadata or email
      username_val := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
      display_name_val := username_val;
      unique_username := username_val;
      
      -- Handle username conflicts by adding a number suffix
      WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = unique_username) LOOP
        counter := counter + 1;
        unique_username := username_val || counter;
      END LOOP;
      
      -- Create a user profile with all fields
      INSERT INTO public.user_profiles (id, username, display_name, email, created_at, is_anonymous)
      VALUES (
        NEW.id,
        unique_username,
        display_name_val,
        NEW.email,
        NEW.created_at,
        FALSE
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

    -- Create a function to manually create missing profiles
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
            INSERT INTO public.user_profiles (id, username, display_name, email, created_at, is_anonymous)
            VALUES (
              auth_user.id,
              unique_username,
              display_name_val,
              auth_user.email,
              auth_user.created_at,
              FALSE
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

    -- Run the function to create missing profiles
    PERFORM create_missing_profiles();

    -- Fix the specific user bbb@dogecuts.org if it exists
    DECLARE
      bbb_user_id UUID;
    BEGIN
      -- Find the user ID for bbb@dogecuts.org
      SELECT id INTO bbb_user_id FROM auth.users WHERE email = 'bbb@dogecuts.org';
      
      IF bbb_user_id IS NOT NULL THEN
        -- Create profile if it doesn't exist
        INSERT INTO public.user_profiles (id, username, display_name, email, created_at, is_anonymous)
        VALUES (
          bbb_user_id,
          'bbb',
          'bbb',
          'bbb@dogecuts.org',
          NOW(),
          FALSE
        )
        ON CONFLICT (id) DO UPDATE SET
          username = EXCLUDED.username,
          display_name = EXCLUDED.display_name,
          email = EXCLUDED.email;
        
        -- Create role if it doesn't exist
        INSERT INTO public.user_roles (user_id, role)
        VALUES (bbb_user_id, 'user')
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'Fixed user bbb@dogecuts.org with ID %', bbb_user_id;
      END IF;
    END;

END$$;
