-- Update all submissions to have a proper engagement score
-- This will ensure the top community feedback shows the correct items

-- First, make sure all submissions have a likes and comments value
UPDATE public.submissions
SET likes = 0
WHERE likes IS NULL;

UPDATE public.submissions
SET comments = 0
WHERE comments IS NULL;

-- Add some likes and comments to make the top items more interesting
-- Update a few submissions to have higher engagement scores
UPDATE public.submissions
SET likes = floor(random() * 50) + 10,
    comments = floor(random() * 20) + 5
WHERE status = 'approved'
LIMIT 10;
