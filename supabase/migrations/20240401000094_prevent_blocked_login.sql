-- Create a function to check if a user is blocked before allowing login
CREATE OR REPLACE FUNCTION auth.check_user_blocked()
RETURNS TRIGGER AS $$
DECLARE
  is_blocked BOOLEAN;
BEGIN
  -- Check if the user is blocked
  SELECT blocked INTO is_blocked FROM public.user_profiles WHERE id = NEW.id;
  
  -- If the user is blocked, prevent login by raising an exception
  IF is_blocked = TRUE THEN
    RAISE EXCEPTION 'User account is blocked';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that runs before a user signs in
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'check_blocked_before_signin'
  ) THEN
    CREATE TRIGGER check_blocked_before_signin
      BEFORE UPDATE ON auth.users
      FOR EACH ROW
      WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
      EXECUTE FUNCTION auth.check_user_blocked();
  END IF;
END
$$;

-- Make sure the handle_new_user function creates both profile and role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into user_profiles
  INSERT INTO public.user_profiles (id, username, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.created_at
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;

-- Fix the block_user function to ensure it works properly
CREATE OR REPLACE FUNCTION public.block_user(user_id UUID, reason TEXT)
RETURNS VOID AS $$
BEGIN
  -- Update user profile
  UPDATE public.user_profiles
  SET 
    blocked = TRUE,
    blocked_reason = reason,
    blocked_at = NOW()
  WHERE id = user_id;
  
  -- Archive user content
  UPDATE public.submissions
  SET archived = TRUE
  WHERE user_id = user_id;
  
  UPDATE public.comments
  SET archived = TRUE
  WHERE user_id = user_id;
  
  -- Log the action
  RAISE NOTICE 'User % blocked with reason: %', user_id, reason;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the unblock_user function
CREATE OR REPLACE FUNCTION public.unblock_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_profiles
  SET 
    blocked = FALSE,
    blocked_reason = NULL,
    blocked_at = NULL
  WHERE id = user_id;
  
  -- Log the action
  RAISE NOTICE 'User % unblocked', user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure all existing auth users have profiles and roles
INSERT INTO public.user_profiles (id, username, created_at)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)), 
  created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user' FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id) DO NOTHING;
