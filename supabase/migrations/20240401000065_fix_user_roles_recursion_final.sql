-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

-- Create new policy without recursion
CREATE POLICY "Users can view their own roles" ON user_roles
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'moderator')
    LIMIT 1
  )
);