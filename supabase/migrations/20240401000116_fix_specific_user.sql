-- Fix the specific user bbb@dogecuts.org
DO $$
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
END$$;
