export interface Ad {
  id: string;
  name: string;
  type: "banner" | "sidebar" | "inline";
  position: "top" | "bottom" | "left" | "right" | "content";
  ad_code?: string;
  image_url?: string;
  link_url?: string;
  width?: string;
  height?: string;
  active: boolean;
  start_date?: string;
  end_date?: string;
  impressions?: number;
  clicks?: number;
  targeting?: {
    pages?: string[];
    devices?: ("mobile" | "tablet" | "desktop")[];
    countries?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface AdPlacement {
  id: string;
  name: string;
  location: "header" | "footer" | "sidebar" | "content";
  adIds: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}
