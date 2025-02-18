-- Add status column to submissions table
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add moderation fields
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS moderator_id UUID REFERENCES auth.users(id);

-- Update RLS policies for submissions
CREATE POLICY "Moderators can update submission status"
ON public.submissions
FOR UPDATE
USING (
    auth.uid() IN (
        SELECT user_id FROM public.user_roles 
        WHERE role IN ('moderator', 'admin')
    )
)
WITH CHECK (true);

-- Only show approved submissions in public views
DROP POLICY IF EXISTS "Anyone can view submissions" ON public.submissions;
CREATE POLICY "Anyone can view approved submissions"
ON public.submissions
FOR SELECT
USING (
    status = 'approved' 
    OR auth.uid() IN (
        SELECT user_id FROM public.user_roles
        WHERE role IN ('moderator', 'admin')
    )
    OR auth.uid() = user_id
);
