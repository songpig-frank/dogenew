-- Replace YOUR_USER_ID with your actual user ID from the Authentication -> Users page
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Also add moderator role if you want
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'moderator')
ON CONFLICT (user_id, role) DO NOTHING;
