import { supabase } from "./supabase";

/**
 * Gets user display information with proper access control
 * - For regular users: Only returns display name
 * - For admins/moderators: Returns display name and email
 */
export const getUserDisplayInfo = async (userId: string) => {
  try {
    // Use the security definer function to get user info
    const { data, error } = await supabase.rpc("get_user_display_info", {
      user_id: userId,
    });

    if (error) {
      console.error("Error using RPC function:", error);

      // Fallback to direct query with proper access control
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if current user is admin/moderator
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const isAdminOrMod = roles?.some((r) =>
        ["admin", "moderator"].includes(r.role),
      );

      // Get user profile
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("username, display_name, email")
        .eq("id", userId)
        .single();

      return {
        displayName: profile?.display_name || profile?.username || "Anonymous",
        // Only return email for admins/moderators
        email: isAdminOrMod ? profile?.email : null,
        isAdmin: roles?.some((r) => r.role === "admin") || false,
        isModerator: roles?.some((r) => r.role === "moderator") || false,
      };
    }

    return {
      displayName: data?.display_name || "Anonymous",
      email: data?.email, // This will be null for non-admin/mod users due to the RPC function
      isAdmin: data?.is_admin || false,
      isModerator: data?.is_moderator || false,
    };
  } catch (error) {
    console.error("Error fetching user display info:", error);
    return {
      displayName: "Anonymous",
      email: null,
      isAdmin: false,
      isModerator: false,
    };
  }
};

/**
 * Determines if the current user can see sensitive information about another user
 */
export const canViewUserDetails = async (targetUserId: string) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if current user is admin or moderator
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    return roles?.role === "admin" || roles?.role === "moderator";
  } catch (error) {
    console.error("Error checking user permissions:", error);
    return false;
  }
};
