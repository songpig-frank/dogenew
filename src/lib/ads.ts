import { supabase } from "./supabase";
import { Ad, AdPlacement } from "./types/ads";

// Fetch all ads
export const fetchAds = async (): Promise<Ad[]> => {
  try {
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching ads:", error);
    return [];
  }
};

// Fetch active ads
export const fetchActiveAds = async (): Promise<Ad[]> => {
  try {
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching active ads:", error);
    return [];
  }
};

// Fetch ad by id
export const fetchAdById = async (id: string): Promise<Ad | null> => {
  try {
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching ad ${id}:`, error);
    return null;
  }
};

// Create new ad
export const createAd = async (
  ad: Omit<Ad, "id" | "created_at" | "updated_at" | "impressions" | "clicks">,
): Promise<Ad | null> => {
  try {
    const { data, error } = await supabase
      .from("ads")
      .insert([
        {
          ...ad,
          impressions: 0,
          clicks: 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating ad:", error);
    return null;
  }
};

// Update existing ad
export const updateAd = async (
  id: string,
  ad: Partial<Ad>,
): Promise<Ad | null> => {
  try {
    const { data, error } = await supabase
      .from("ads")
      .update({
        ...ad,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating ad ${id}:`, error);
    return null;
  }
};

// Delete ad
export const deleteAd = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("ads").delete().eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting ad ${id}:`, error);
    return false;
  }
};

// Record ad impression
export const recordAdImpression = async (adId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc("record_ad_impression", {
      ad_id: adId,
    });
    if (error) throw error;
  } catch (error) {
    console.error(`Error recording impression for ad ${adId}:`, error);
  }
};

// Record ad click
export const recordAdClick = async (adId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc("record_ad_click", { ad_id: adId });
    if (error) throw error;
  } catch (error) {
    console.error(`Error recording click for ad ${adId}:`, error);
  }
};

// Fetch ad placements
export const fetchAdPlacements = async (): Promise<AdPlacement[]> => {
  try {
    const { data, error } = await supabase
      .from("ad_placements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching ad placements:", error);
    return [];
  }
};

// Update ad placement
export const updateAdPlacement = async (
  id: string,
  placement: Partial<AdPlacement>,
): Promise<AdPlacement | null> => {
  try {
    const { data, error } = await supabase
      .from("ad_placements")
      .update({
        ...placement,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating ad placement ${id}:`, error);
    return null;
  }
};

// Get ads for a specific location
export const getAdsByLocation = async (location: string): Promise<Ad[]> => {
  try {
    // First get the placement
    const { data: placement, error: placementError } = await supabase
      .from("ad_placements")
      .select("*")
      .eq("location", location)
      .eq("active", true)
      .single();

    if (placementError) throw placementError;
    if (!placement || !placement.ad_ids || !Array.isArray(placement.ad_ids)) {
      return [];
    }

    // Then get the ads assigned to this placement
    const { data: ads, error: adsError } = await supabase
      .from("ads")
      .select("*")
      .in("id", placement.ad_ids)
      .eq("active", true);

    if (adsError) throw adsError;
    return ads || [];
  } catch (error) {
    console.error(`Error fetching ads for location ${location}:`, error);
    return [];
  }
};
