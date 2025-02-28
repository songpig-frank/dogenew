-- Fix the infinite recursion in user_roles policy that's affecting ad creation

-- First, drop the problematic policy on ads table
DROP POLICY IF EXISTS "Allow admin full access to ads" ON public.ads;

-- Create a new policy that doesn't cause recursion
CREATE POLICY "Allow admin full access to ads" 
  ON public.ads FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      JOIN public.user_roles ON auth.users.id = public.user_roles.user_id
      WHERE auth.users.id = auth.uid() AND public.user_roles.role IN ('admin', 'moderator')
    )
  );

-- Also fix the policy on ad_placements
DROP POLICY IF EXISTS "Allow admin full access to ad placements" ON public.ad_placements;

CREATE POLICY "Allow admin full access to ad placements" 
  ON public.ad_placements FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      JOIN public.user_roles ON auth.users.id = public.user_roles.user_id
      WHERE auth.users.id = auth.uid() AND public.user_roles.role IN ('admin', 'moderator')
    )
  );

-- Fix the policies for ad_impressions and ad_clicks
DROP POLICY IF EXISTS "Allow admin read access to ad_impressions" ON public.ad_impressions;

CREATE POLICY "Allow admin read access to ad_impressions" 
  ON public.ad_impressions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      JOIN public.user_roles ON auth.users.id = public.user_roles.user_id
      WHERE auth.users.id = auth.uid() AND public.user_roles.role IN ('admin', 'moderator')
    )
  );

DROP POLICY IF EXISTS "Allow admin read access to ad_clicks" ON public.ad_clicks;

CREATE POLICY "Allow admin read access to ad_clicks" 
  ON public.ad_clicks FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      JOIN public.user_roles ON auth.users.id = public.user_roles.user_id
      WHERE auth.users.id = auth.uid() AND public.user_roles.role IN ('admin', 'moderator')
    )
  );

-- Add a policy to allow all users to insert ad impressions and clicks
DROP POLICY IF EXISTS "Allow insert to ad_impressions" ON public.ad_impressions;

CREATE POLICY "Allow insert to ad_impressions" 
  ON public.ad_impressions FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert to ad_clicks" ON public.ad_clicks;

CREATE POLICY "Allow insert to ad_clicks" 
  ON public.ad_clicks FOR INSERT 
  WITH CHECK (true);

-- Add a policy to allow all users to view active ads
DROP POLICY IF EXISTS "Allow public read access to active ads" ON public.ads;

CREATE POLICY "Allow public read access to active ads" 
  ON public.ads FOR SELECT 
  USING (active = true);
