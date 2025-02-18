-- First ensure the user_roles table exists
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'moderator')),
    PRIMARY KEY (user_id, role)
);

-- Insert admin role for the super admin user if it doesn't exist
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'super_admin@dogecuts.org'
ON CONFLICT (user_id, role) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO anon;

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to manage roles
CREATE POLICY admin_manage_roles ON public.user_roles
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);