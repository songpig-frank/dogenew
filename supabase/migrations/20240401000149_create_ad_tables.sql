-- Create ads table
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('banner', 'sidebar', 'inline')),
  position TEXT NOT NULL CHECK (position IN ('top', 'bottom', 'left', 'right', 'content')),
  ad_code TEXT,
  image_url TEXT,
  link_url TEXT,
  width TEXT,
  height TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  targeting JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad_placements table
CREATE TABLE IF NOT EXISTS public.ad_placements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('header', 'footer', 'sidebar', 'content')),
  ad_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad_impressions table for tracking
CREATE TABLE IF NOT EXISTS public.ad_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID NOT NULL REFERENCES public.ads(id),
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad_clicks table for tracking
CREATE TABLE IF NOT EXISTS public.ad_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID NOT NULL REFERENCES public.ads(id),
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;

-- Create policies for ads table
CREATE POLICY "Allow public read access to active ads" 
  ON public.ads FOR SELECT 
  USING (active = true);

CREATE POLICY "Allow admin full access to ads" 
  ON public.ads FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  ));

-- Create policies for ad_placements table
CREATE POLICY "Allow public read access to active ad placements" 
  ON public.ad_placements FOR SELECT 
  USING (active = true);

CREATE POLICY "Allow admin full access to ad placements" 
  ON public.ad_placements FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  ));

-- Create policies for ad_impressions table
CREATE POLICY "Allow insert to ad_impressions" 
  ON public.ad_impressions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow admin read access to ad_impressions" 
  ON public.ad_impressions FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  ));

-- Create policies for ad_clicks table
CREATE POLICY "Allow insert to ad_clicks" 
  ON public.ad_clicks FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow admin read access to ad_clicks" 
  ON public.ad_clicks FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  ));

-- Create function to record ad impression
CREATE OR REPLACE FUNCTION public.record_ad_impression(ad_id UUID, user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- Insert impression record
  INSERT INTO public.ad_impressions (ad_id, user_id, ip_address, user_agent, referrer)
  VALUES (ad_id, user_id, NULL, NULL, NULL);
  
  -- Update impression count
  UPDATE public.ads
  SET impressions = impressions + 1
  WHERE id = ad_id;
 END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to record ad click
CREATE OR REPLACE FUNCTION public.record_ad_click(ad_id UUID, user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- Insert click record
  INSERT INTO public.ad_clicks (ad_id, user_id, ip_address, user_agent, referrer)
  VALUES (ad_id, user_id, NULL, NULL, NULL);
  
  -- Update click count
  UPDATE public.ads
  SET clicks = clicks + 1
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default ad placements
INSERT INTO public.ad_placements (name, location, active)
VALUES 
  ('Top Banner', 'header', true),
  ('Sidebar', 'sidebar', true),
  ('In-Content', 'content', true),
  ('Footer', 'footer', true);

-- Insert sample ads
INSERT INTO public.ads (name, type, position, image_url, link_url, width, height, active)
VALUES 
  ('Top Banner Ad', 'banner', 'top', 'https://via.placeholder.com/728x90?text=Top+Banner+Ad', 'https://example.com/affiliate', '728px', '90px', true),
  ('Sidebar Ad', 'sidebar', 'right', 'https://via.placeholder.com/300x600?text=Sidebar+Ad', 'https://example.com/affiliate', '300px', '600px', true),
  ('In-Content Ad', 'inline', 'content', 'https://via.placeholder.com/728x90?text=In-Content+Ad', 'https://example.com/affiliate', '728px', '90px', true),
  ('Bottom Banner Ad', 'banner', 'bottom', 'https://via.placeholder.com/728x90?text=Bottom+Banner+Ad', 'https://example.com/affiliate', '728px', '90px', true);
