-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Everyone can view roles" ON public.user_roles;

-- Create new policies without recursion
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
);

-- Everyone can view roles
CREATE POLICY "Everyone can view roles"
ON public.user_roles
FOR SELECT
USING (true);

-- Drop and recreate submission policies
DROP POLICY IF EXISTS "Anyone can view approved submissions" ON public.submissions;

CREATE POLICY "Anyone can view approved submissions"
ON public.submissions
FOR SELECT
USING (
    status = 'approved'
    OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('moderator', 'admin')
    )
    OR user_id = auth.uid()
);