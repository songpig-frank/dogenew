-- Add as admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('efede3e7-8e68-4475-8c36-8e8777828367', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Add as moderator
INSERT INTO public.user_roles (user_id, role)
VALUES ('efede3e7-8e68-4475-8c36-8e8777828367', 'moderator')
ON CONFLICT (user_id, role) DO NOTHING;