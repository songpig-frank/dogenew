-- Add display_name column to user_profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'display_name') THEN
        ALTER TABLE public.user_profiles ADD COLUMN display_name TEXT;
        
        -- Update existing profiles to have display_name = username
        UPDATE public.user_profiles 
        SET display_name = username 
        WHERE display_name IS NULL;
    END IF;
END$$;

-- Create a function to get user display info with proper access control
CREATE OR REPLACE FUNCTION public.get_user_display_info(user_id UUID)
RETURNS TABLE (
    display_name TEXT,
    email TEXT,
    is_admin BOOLEAN,
    is_moderator BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    current_user_role TEXT;
    is_admin_or_mod BOOLEAN;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Check if current user is admin or moderator
    SELECT role INTO current_user_role 
    FROM public.user_roles 
    WHERE user_id = current_user_id 
    LIMIT 1;
    
    is_admin_or_mod := current_user_role IN ('admin', 'moderator');
    
    -- Return user info based on access level
    RETURN QUERY 
    SELECT 
        p.display_name,
        CASE WHEN is_admin_or_mod THEN p.email ELSE NULL END,
        r.role = 'admin',
        r.role = 'moderator'
    FROM 
        public.user_profiles p
    LEFT JOIN 
        public.user_roles r ON p.id = r.user_id
    WHERE 
        p.id = user_id;
 END;
$$;
