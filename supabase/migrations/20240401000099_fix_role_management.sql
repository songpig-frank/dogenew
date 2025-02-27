-- Create a function with SECURITY DEFINER to update user roles
CREATE OR REPLACE FUNCTION public.admin_update_user_role(user_id UUID, user_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  -- Update or insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id, user_role)
  ON CONFLICT (user_id) 
  DO UPDATE SET role = user_role;
  
  -- Check if update was successful
  GET DIAGNOSTICS success = ROW_COUNT;
  
  IF success THEN
    RAISE NOTICE 'User % role updated to %', user_id, user_role;
  END IF;
  
  RETURN success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.admin_update_user_role(UUID, TEXT) TO authenticated;
