-- Create functions for user management that bypass RLS policies

-- Function to create a user profile
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_username TEXT,
  user_created_at TIMESTAMPTZ
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_profiles (id, username, created_at)
  VALUES (user_id, user_username, user_created_at)
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign a role to a user
CREATE OR REPLACE FUNCTION assign_user_role(
  user_id UUID,
  user_role TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (user_id, user_role)
  ON CONFLICT (user_id) DO UPDATE SET role = user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to block a user
CREATE OR REPLACE FUNCTION block_user(
  user_id UUID,
  reason TEXT
) RETURNS VOID AS $$
BEGIN
  -- Update user profile
  UPDATE user_profiles
  SET blocked = TRUE,
      blocked_reason = reason,
      blocked_at = NOW()
  WHERE id = user_id;
  
  -- Archive user content
  UPDATE submissions
  SET archived = TRUE
  WHERE user_id = user_id;
  
  UPDATE comments
  SET archived = TRUE
  WHERE user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unblock a user
CREATE OR REPLACE FUNCTION unblock_user(
  user_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET blocked = FALSE,
      blocked_reason = NULL,
      blocked_at = NULL
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add roles for the new users from the screenshots
INSERT INTO user_roles (user_id, role)
VALUES 
('1f530b58-3f5c-4e47-8c90-fbef47a7f3f7', 'admin'),
('31c976ca-b037-4c35-9ce3-7f04a7754a6e', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
