-- Create direct functions for ad operations that bypass RLS policies

-- Function to create an ad without going through RLS
CREATE OR REPLACE FUNCTION public.direct_create_ad(
  p_name TEXT,
  p_type TEXT,
  p_position TEXT,
  p_ad_code TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_link_url TEXT DEFAULT NULL,
  p_width TEXT DEFAULT NULL,
  p_height TEXT DEFAULT NULL,
  p_active BOOLEAN DEFAULT TRUE
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  INSERT INTO public.ads (
    name,
    type,
    position,
    ad_code,
    image_url,
    link_url,
    width,
    height,
    active,
    impressions,
    clicks
  ) VALUES (
    p_name,
    p_type,
    p_position,
    p_ad_code,
    p_image_url,
    p_link_url,
    p_width,
    p_height,
    p_active,
    0,
    0
  ) RETURNING to_jsonb(ads.*) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update an ad without going through RLS
CREATE OR REPLACE FUNCTION public.direct_update_ad(
  p_id UUID,
  p_name TEXT DEFAULT NULL,
  p_type TEXT DEFAULT NULL,
  p_position TEXT DEFAULT NULL,
  p_ad_code TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_link_url TEXT DEFAULT NULL,
  p_width TEXT DEFAULT NULL,
  p_height TEXT DEFAULT NULL,
  p_active BOOLEAN DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_updates TEXT := '';
BEGIN
  -- Build dynamic SQL for updates
  IF p_name IS NOT NULL THEN v_updates := v_updates || 'name = ' || quote_literal(p_name) || ', '; END IF;
  IF p_type IS NOT NULL THEN v_updates := v_updates || 'type = ' || quote_literal(p_type) || ', '; END IF;
  IF p_position IS NOT NULL THEN v_updates := v_updates || 'position = ' || quote_literal(p_position) || ', '; END IF;
  IF p_ad_code IS NOT NULL THEN v_updates := v_updates || 'ad_code = ' || quote_literal(p_ad_code) || ', '; END IF;
  IF p_image_url IS NOT NULL THEN v_updates := v_updates || 'image_url = ' || quote_literal(p_image_url) || ', '; END IF;
  IF p_link_url IS NOT NULL THEN v_updates := v_updates || 'link_url = ' || quote_literal(p_link_url) || ', '; END IF;
  IF p_width IS NOT NULL THEN v_updates := v_updates || 'width = ' || quote_literal(p_width) || ', '; END IF;
  IF p_height IS NOT NULL THEN v_updates := v_updates || 'height = ' || quote_literal(p_height) || ', '; END IF;
  IF p_active IS NOT NULL THEN v_updates := v_updates || 'active = ' || p_active || ', '; END IF;
  
  -- Add updated_at
  v_updates := v_updates || 'updated_at = NOW()';
  
  -- Execute the update
  EXECUTE 'UPDATE public.ads SET ' || v_updates || ' WHERE id = $1 RETURNING to_jsonb(ads.*)' INTO v_result USING p_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete an ad without going through RLS
CREATE OR REPLACE FUNCTION public.direct_delete_ad(p_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM public.ads WHERE id = p_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all ads without going through RLS
CREATE OR REPLACE FUNCTION public.direct_get_all_ads() RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_agg(to_jsonb(ads.*)) INTO v_result FROM public.ads ORDER BY created_at DESC;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active ads without going through RLS
CREATE OR REPLACE FUNCTION public.direct_get_active_ads() RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_agg(to_jsonb(ads.*)) INTO v_result FROM public.ads WHERE active = TRUE ORDER BY created_at DESC;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
