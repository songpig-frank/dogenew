import { supabase } from "./supabase";

export const setupUserTables = async () => {
  try {
    // Create user_profiles table
    const { error: profilesError } = await supabase.rpc(
      "create_user_profiles_table",
    );
    if (profilesError) throw profilesError;

    // Create user_roles table
    const { error: rolesError } = await supabase.rpc("create_user_roles_table");
    if (rolesError) throw rolesError;

    // Ensure admin user exists
    const { error: adminError } = await supabase.rpc("ensure_admin_user");
    if (adminError) throw adminError;

    return { success: true };
  } catch (error) {
    console.error("Error setting up user tables:", error);
    return { success: false, error };
  }
};
