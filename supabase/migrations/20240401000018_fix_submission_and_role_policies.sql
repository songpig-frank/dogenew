-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Everyone can view roles" ON public.user_roles;

-- Create new submission policies
CREATE POLICY "Public can only view approved submissions"
ON public.submissions FOR SELECT
USING (
    status = 'approved'
    OR auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role IN ('admin', 'moderator')
    )
    OR user_id = auth.uid()
);

-- Create new role policies
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (
    auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
    )
);

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

-- Enable RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = $1
        AND role = 'admin'
    );
END;
$$;

-- Create function to check if user is moderator
CREATE OR REPLACE FUNCTION public.is_moderator(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = $1
        AND role IN ('admin', 'moderator')
    );
END;
$$;