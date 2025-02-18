INSERT INTO public.user_roles (user_id, role)
VALUES ('575c69f6-3cb4-465f-9283-11f93f8d9fd6', 'moderator')
ON CONFLICT (user_id, role) DO NOTHING;