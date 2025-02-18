-- Update the existing super admin user's password
UPDATE auth.users
SET encrypted_password = crypt('Wd5gks22%%', gen_salt('bf'))
WHERE email = 'super_admin@dogecuts.org';

-- Ensure user profile exists
INSERT INTO user_profiles (id, username, email)
SELECT id, 'super_admin', email
FROM auth.users
WHERE email = 'super_admin@dogecuts.org'
ON CONFLICT (id) DO UPDATE
SET username = 'super_admin',
    email = 'super_admin@dogecuts.org';

-- Ensure admin role exists
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'super_admin@dogecuts.org'
ON CONFLICT (user_id) DO UPDATE
SET role = 'admin';
