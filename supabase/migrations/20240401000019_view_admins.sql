-- Create a view to see all admins with their emails
CREATE OR REPLACE VIEW public.admin_users AS
SELECT 
    au.email,
    ur.user_id,
    ur.role
FROM auth.users au
JOIN public.user_roles ur ON au.id = ur.user_id
WHERE ur.role = 'admin';

-- Grant access to the view
GRANT SELECT ON public.admin_users TO authenticated;

-- Select all admins
SELECT * FROM public.admin_users;