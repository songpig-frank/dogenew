// Direct database operations without using RLS policies

export const directAddKeyword = async (keyword: string) => {
  try {
    // Use fetch to directly call the Supabase REST API
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/video_keywords`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({ keyword }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add keyword: ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error in directAddKeyword:", error);
    return { success: false, error };
  }
};

export const directFetchKeywords = async () => {
  try {
    // Use fetch to directly call the Supabase REST API
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/video_keywords?select=*&order=created_at.desc`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch keywords: ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error in directFetchKeywords:", error);
    return { success: false, error };
  }
};

export const directRemoveKeyword = async (keyword: string) => {
  try {
    // Use fetch to directly call the Supabase REST API
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/video_keywords?keyword=eq.${encodeURIComponent(keyword)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to remove keyword: ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in directRemoveKeyword:", error);
    return { success: false, error };
  }
};
