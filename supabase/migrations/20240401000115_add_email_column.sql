-- Add email column to user_profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'email') THEN
        ALTER TABLE public.user_profiles ADD COLUMN email TEXT;
        
        -- Update existing profiles with email from auth.users
        UPDATE public.user_profiles p
        SET email = u.email
        FROM auth.users u
        WHERE p.id = u.id AND p.email IS NULL;
    END IF;
END$$;
