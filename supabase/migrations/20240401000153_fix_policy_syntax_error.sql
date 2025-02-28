-- Fix the policy syntax error by removing the WITH CHECK clause that uses NEW

-- Drop the problematic policy
DROP POLICY IF EXISTS "Allow all users to update ad impressions and clicks" ON public.ads;

-- Create a simpler policy that allows updates to impressions and clicks
CREATE POLICY "Allow all users to update ad impressions and clicks" 
  ON public.ads FOR UPDATE 
  USING (true);

-- Create a function to safely update ad impressions
CREATE OR REPLACE FUNCTION public.safe_update_ad_impression(ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.ads
  SET impressions = impressions + 1
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to safely update ad clicks
CREATE OR REPLACE FUNCTION public.safe_update_ad_click(ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.ads
  SET clicks = clicks + 1
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the record_ad_impression function to use the safe update function
CREATE OR REPLACE FUNCTION public.record_ad_impression(ad_id UUID, user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- Insert impression record
  INSERT INTO public.ad_impressions (ad_id, user_id, ip_address, user_agent, referrer)
  VALUES (ad_id, user_id, NULL, NULL, NULL);
  
  -- Update impression count using the safe function
  PERFORM public.safe_update_ad_impression(ad_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the record_ad_click function to use the safe update function
CREATE OR REPLACE FUNCTION public.record_ad_click(ad_id UUID, user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- Insert click record
  INSERT INTO public.ad_clicks (ad_id, user_id, ip_address, user_agent, referrer)
  VALUES (ad_id, user_id, NULL, NULL, NULL);
  
  -- Update click count using the safe function
  PERFORM public.safe_update_ad_click(ad_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
