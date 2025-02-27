-- Create a simpler block function with no RLS checks
CREATE OR REPLACE FUNCTION public.simple_block_user(user_id UUID, reason TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Direct update to user_profiles table
  UPDATE public.user_profiles
  SET 
    blocked = TRUE,
    blocked_reason = reason,
    blocked_at = NOW()
  WHERE id = user_id;
  
  -- Return true regardless of whether the update succeeded
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.simple_block_user(UUID, TEXT) TO authenticated;
