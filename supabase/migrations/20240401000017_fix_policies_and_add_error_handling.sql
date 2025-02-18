-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Everyone can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Anyone can view approved submissions" ON public.submissions;

-- Create new simplified policies
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (EXISTS (
    SELECT 1 FROM auth.users WHERE auth.uid() = id
));

-- Everyone can view roles
CREATE POLICY "Everyone can view roles"
ON public.user_roles
FOR SELECT
USING (true);

-- Submissions policy
CREATE POLICY "Anyone can view submissions"
ON public.submissions
FOR SELECT
USING (true);

-- Add error handling to toggle_like function
CREATE OR REPLACE FUNCTION public.toggle_like(
    p_submission_id uuid,
    p_user_id uuid,
    p_is_liked boolean
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete existing interaction if any
    DELETE FROM public.user_interactions
    WHERE submission_id = p_submission_id
    AND user_id = p_user_id
    AND type = 'like';

    -- If liking, insert new interaction
    IF p_is_liked THEN
        INSERT INTO public.user_interactions (submission_id, user_id, type)
        VALUES (p_submission_id, p_user_id, 'like');
        
        -- Increment likes
        UPDATE public.submissions
        SET likes = likes + 1
        WHERE id = p_submission_id;
    ELSE
        -- Decrement likes
        UPDATE public.submissions
        SET likes = GREATEST(likes - 1, 0)
        WHERE id = p_submission_id;
    END IF;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in toggle_like: %', SQLERRM;
END;
$$;