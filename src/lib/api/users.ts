import { supabase } from "../supabase";
import { UserProfile, UserRole, UserStats } from "../types/user";

export const fetchUsers = async ({
  page = 1,
  limit = 10,
  search = "",
  role,
}: {
  page?: number;
  limit?: number;
  search?: string;
  role?: "admin" | "moderator" | "user";
}) => {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Get user profiles with roles
    let query = supabase.from("user_profiles").select(`
        id,
        username,
        created_at,
        blocked,
        blocked_reason,
        blocked_at
      `);

    // Apply filters
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Get paginated data
    const { data: users, error } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get roles separately
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role");

    // Combine users with their roles
    const usersWithRoles = (users || []).map((user) => ({
      ...user,
      role: roles?.find((r) => r.user_id === user.id)?.role || "user",
    }));

    // Filter by role if needed
    const filteredUsers =
      role && role !== "all"
        ? usersWithRoles.filter((u) => u.role === role)
        : usersWithRoles;

    return {
      users: filteredUsers,
      total: filteredUsers.length,
      page,
      totalPages: Math.ceil(filteredUsers.length / limit),
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: string) => {
  try {
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role })
      .eq("user_id", userId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

export const blockUser = async (userId: string, reason: string) => {
  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        blocked: true,
        blocked_reason: reason,
        blocked_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;

    // Archive user's content
    await supabase
      .from("submissions")
      .update({ archived: true })
      .eq("user_id", userId);

    await supabase
      .from("comments")
      .update({ archived: true })
      .eq("user_id", userId);
  } catch (error) {
    console.error("Error blocking user:", error);
    throw error;
  }
};

export const unblockUser = async (userId: string) => {
  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        blocked: false,
        blocked_reason: null,
        blocked_at: null,
      })
      .eq("id", userId);

    if (error) throw error;
  } catch (error) {
    console.error("Error unblocking user:", error);
    throw error;
  }
};

export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const [submissions, comments, likes] = await Promise.all([
      supabase
        .from("submissions")
        .select("count")
        .eq("user_id", userId)
        .single(),
      supabase.from("comments").select("count").eq("user_id", userId).single(),
      supabase
        .from("user_interactions")
        .select("count")
        .eq("user_id", userId)
        .eq("type", "like")
        .single(),
    ]);

    return {
      total_submissions: submissions.count || 0,
      total_comments: comments.count || 0,
      total_likes: likes.count || 0,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error;
  }
};
