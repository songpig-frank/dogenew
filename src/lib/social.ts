import { supabase } from "./supabase";

interface SocialMeta {
  title: string;
  description: string;
  image_url: string;
}

export const getSocialMeta = async (
  type: string = "default",
): Promise<SocialMeta | null> => {
  try {
    const { data, error } = await supabase
      .from("social_meta")
      .select("*")
      .eq("type", type)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching social meta:", error);
    return null;
  }
};

export const getSubmissionMeta = async (submissionId: string) => {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("og_title, og_description, og_image, title, description")
      .eq("id", submissionId)
      .single();

    if (error) throw error;

    // Use custom OG tags if set, otherwise use submission content
    return {
      title: data.og_title || data.title,
      description: data.og_description || data.description,
      image:
        data.og_image ||
        (await getSocialMeta("submission"))?.image_url ||
        "https://dogecuts.org/dogecuts-logo.webp",
    };
  } catch (error) {
    console.error("Error fetching submission meta:", error);
    return null;
  }
};

export const incrementShareCount = async (submissionId: string) => {
  try {
    const { data, error } = await supabase.rpc("increment_share_count", {
      submission_id: submissionId,
    });

    if (error) throw error;
    console.log("Share count updated:", data);
    return data;
  } catch (error) {
    console.error("Error incrementing share count:", error);
    throw error;
  }
};

export const updateSubmissionMeta = async (
  submissionId: string,
  meta: {
    og_title?: string;
    og_description?: string;
    og_image?: string;
  },
) => {
  try {
    const { error } = await supabase
      .from("submissions")
      .update(meta)
      .eq("id", submissionId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating submission meta:", error);
    throw error;
  }
};
