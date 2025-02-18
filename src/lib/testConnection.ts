import { supabase } from "./supabase";

export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from("submissions").select("count");

    if (error) {
      console.error("Database test failed:", error.message);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Connection test failed:", err);
    return { success: false, error: err };
  }
};
