-- Fix the infinite recursion in user_roles policy that's affecting video operations

-- First, drop the problematic policies
DROP POLICY IF EXISTS user_roles_select_policy ON user_roles;
DROP POLICY IF EXISTS user_roles_insert_policy ON user_roles;
DROP POLICY IF EXISTS user_roles_update_policy ON user_roles;
DROP POLICY IF EXISTS user_roles_delete_policy ON user_roles;

-- Create simpler policies that don't cause recursion
CREATE POLICY user_roles_select_policy ON user_roles 
  FOR SELECT USING (true);

CREATE POLICY user_roles_insert_policy ON user_roles 
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

CREATE POLICY user_roles_update_policy ON user_roles 
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

CREATE POLICY user_roles_delete_policy ON user_roles 
  FOR DELETE USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

-- Add direct access policies for featured_videos table
DROP POLICY IF EXISTS featured_videos_insert_policy ON featured_videos;
DROP POLICY IF EXISTS featured_videos_select_policy ON featured_videos;
DROP POLICY IF EXISTS featured_videos_update_policy ON featured_videos;
DROP POLICY IF EXISTS featured_videos_delete_policy ON featured_videos;

-- Create new policies for featured_videos
CREATE POLICY featured_videos_select_policy ON featured_videos FOR SELECT USING (true);
CREATE POLICY featured_videos_insert_policy ON featured_videos FOR INSERT WITH CHECK (true);
CREATE POLICY featured_videos_update_policy ON featured_videos FOR UPDATE USING (true);
CREATE POLICY featured_videos_delete_policy ON featured_videos FOR DELETE USING (true);
