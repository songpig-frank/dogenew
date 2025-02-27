-- Create a function to directly block a user that bypasses RLS
CREATE OR REPLACE FUNCTION public.direct_block_user(user_id UUID, reason TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  -- Update user profile
  UPDATE public.user_profiles
  SET 
    blocked = TRUE,
    blocked_reason = reason,
    blocked_at = NOW()
  WHERE id = user_id;
  
  -- Check if update was successful
  GET DIAGNOSTICS success = ROW_COUNT;
  
  -- Archive user content if update was successful
  IF success THEN
    UPDATE public.submissions
    SET archived = TRUE
    WHERE user_id = user_id;
    
    UPDATE public.comments
    SET archived = TRUE
    WHERE user_id = user_id;
    
    RAISE NOTICE 'User % blocked with reason: %', user_id, reason;
  END IF;
  
  RETURN success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to directly unblock a user that bypasses RLS
CREATE OR REPLACE FUNCTION public.direct_unblock_user(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  -- Update user profile
  UPDATE public.user_profiles
  SET 
    blocked = FALSE,
    blocked_reason = NULL,
    blocked_at = NULL
  WHERE id = user_id;
  
  -- Check if update was successful
  GET DIAGNOSTICS success = ROW_COUNT;
  
  IF success THEN
    RAISE NOTICE 'User % unblocked', user_id;
  END IF;
  
  RETURN success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.direct_block_user(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.direct_unblock_user(UUID) TO authenticated;
