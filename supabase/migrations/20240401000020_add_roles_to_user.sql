-- Add admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('53545e32-4607-4a8d-b643-9e49181cbe67', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Add moderator role
INSERT INTO public.user_roles (user_id, role)
VALUES ('53545e32-4607-4a8d-b643-9e49181cbe67', 'moderator')
ON CONFLICT (user_id, role) DO NOTHING;

-- View current admins
SELECT * FROM public.admin_users;