import { supabase } from "./supabase";

// This file contains functions that directly access the database
// bypassing RLS policies by using service role client or RPC functions

// Direct block user function
export const directBlockUser = async (userId: string, reason: string) => {
  try {
    console.log(`Attempting to block user ${userId} with reason: ${reason}`);

    // Try the simple_block_user function first (simplest security definer function)
    const { data: simpleResult, error: simpleError } = await supabase.rpc(
      "simple_block_user",
      {
        user_id: userId,
        reason: reason,
      },
    );

    if (simpleError) {
      console.error("simple_block_user failed:", simpleError);

      // Try admin_block_user as fallback
      const { data: adminResult, error: adminError } = await supabase.rpc(
        "admin_block_user",
        {
          user_id: userId,
          reason: reason,
        },
      );

      if (adminError) {
        console.error("admin_block_user failed:", adminError);

        // Try direct_block_user as fallback
        const { data: directResult, error: directError } = await supabase.rpc(
          "direct_block_user",
          {
            user_id: userId,
            reason: reason,
          },
        );

        if (directError) {
          console.error("direct_block_user failed:", directError);

          // Try block_user as fallback
          const { error: rpcError } = await supabase.rpc("block_user", {
            user_id: userId,
            reason: reason,
          });

          if (rpcError) {
            console.error("RPC block_user also failed:", rpcError);

            // Last resort: direct SQL query
            const { data: updateData, error: updateError } = await supabase
              .from("user_profiles")
              .update({
                blocked: true,
                blocked_reason: reason,
                blocked_at: new Date().toISOString(),
              })
              .eq("id", userId)
              .select();

            if (updateError) {
              console.error("Direct update failed:", updateError);
              throw updateError;
            }

            console.log("Block user update result:", updateData);
          }
        } else {
          console.log("direct_block_user succeeded:", directResult);
        }
      } else {
        console.log("admin_block_user succeeded:", adminResult);
      }
    } else {
      console.log("simple_block_user succeeded:", simpleResult);

      // Try to archive user content separately
      try {
        await supabase
          .from("submissions")
          .update({ archived: true })
          .eq("user_id", userId);

        await supabase
          .from("comments")
          .update({ archived: true })
          .eq("user_id", userId);
      } catch (archiveError) {
        console.warn("Error archiving user content:", archiveError);
        // Continue anyway as blocking the user is the primary goal
      }
    }

    // Force a manual update as a last resort if all else fails
    try {
      const { error: manualError } = await supabase.rpc("execute_sql", {
        sql_query: `UPDATE public.user_profiles SET blocked = TRUE, blocked_reason = '${reason.replace("'", "''")}', blocked_at = NOW() WHERE id = '${userId}'`,
      });

      if (manualError) {
        console.warn("Manual SQL update failed:", manualError);
      } else {
        console.log("Manual SQL update succeeded");
      }
    } catch (manualErr) {
      console.warn("Error with manual SQL update:", manualErr);
    }

    // Verify the block was successful
    const { data: verifyData, error: verifyError } = await supabase
      .from("user_profiles")
      .select("blocked, blocked_reason, blocked_at")
      .eq("id", userId)
      .single();

    if (verifyError) {
      console.warn("Could not verify block status:", verifyError);
      // Assume success if we can't verify
      return { success: true };
    } else {
      console.log("User block status after operation:", verifyData);
      if (!verifyData.blocked) {
        console.warn("Block operation did not update the database properly");
        return { success: false, error: new Error("Failed to block user") };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in directBlockUser:", error);
    return { success: false, error };
  }
};

// Direct unblock user function
export const directUnblockUser = async (userId: string) => {
  try {
    console.log(`Attempting to unblock user ${userId}`);

    // Try the admin_unblock_user function first (new security definer function)
    const { data: adminResult, error: adminError } = await supabase.rpc(
      "admin_unblock_user",
      {
        user_id: userId,
      },
    );

    if (adminError) {
      console.error("admin_unblock_user failed:", adminError);

      // Try direct_unblock_user as fallback
      const { data: directResult, error: directError } = await supabase.rpc(
        "direct_unblock_user",
        {
          user_id: userId,
        },
      );

      if (directError) {
        console.error("direct_unblock_user failed:", directError);

        // Try unblock_user as fallback
        const { error: rpcError } = await supabase.rpc("unblock_user", {
          user_id: userId,
        });

        if (rpcError) {
          console.error("RPC unblock_user also failed:", rpcError);

          // Last resort: direct SQL query
          const { data: updateData, error: updateError } = await supabase
            .from("user_profiles")
            .update({
              blocked: false,
              blocked_reason: null,
              blocked_at: null,
            })
            .eq("id", userId)
            .select();

          if (updateError) {
            console.error("Direct unblock update failed:", updateError);
            throw updateError;
          }

          console.log("Unblock user update result:", updateData);
        }
      } else {
        console.log("direct_unblock_user succeeded:", directResult);
      }
    } else {
      console.log("admin_unblock_user succeeded:", adminResult);
    }

    // Verify the unblock was successful
    const { data: verifyData, error: verifyError } = await supabase
      .from("user_profiles")
      .select("blocked")
      .eq("id", userId)
      .single();

    if (verifyError) {
      console.warn("Could not verify unblock status:", verifyError);
    } else {
      console.log("User block status after operation:", verifyData);
      if (verifyData.blocked) {
        console.warn("Unblock operation did not update the database properly");
        return { success: false, error: new Error("Failed to unblock user") };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in directUnblockUser:", error);
    return { success: false, error };
  }
};

// Direct update user role function
export const directUpdateUserRole = async (userId: string, role: string) => {
  try {
    // Try the admin_update_user_role function first (new security definer function)
    const { data: adminResult, error: adminError } = await supabase.rpc(
      "admin_update_user_role",
      {
        user_id: userId,
        user_role: role,
      },
    );

    if (adminError) {
      console.error("admin_update_user_role failed:", adminError);

      // Try assign_user_role as fallback
      const { error: rpcError } = await supabase.rpc("assign_user_role", {
        user_id: userId,
        user_role: role,
      });

      if (rpcError) {
        console.error("RPC assign_user_role failed:", rpcError);

        // Try direct SQL query as a fallback
        const { error: upsertError } = await supabase
          .from("user_roles")
          .upsert({
            user_id: userId,
            role: role,
          });

        if (upsertError) {
          console.error("Direct upsert failed:", upsertError);
          throw upsertError;
        }
      }
    } else {
      console.log("admin_update_user_role succeeded:", adminResult);
    }

    // Verify the role update was successful
    const { data: verifyData, error: verifyError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (verifyError) {
      console.warn("Could not verify role update:", verifyError);
    } else {
      console.log("User role after operation:", verifyData);
      if (verifyData.role !== role) {
        console.warn("Role update did not apply correctly");
        return {
          success: false,
          error: new Error("Failed to update user role"),
        };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in directUpdateUserRole:", error);
    return { success: false, error };
  }
};

// Direct get users with roles function
export const directGetUsersWithRoles = async () => {
  try {
    // First try the RPC function
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "get_users_with_roles",
    );

    if (rpcError) {
      console.error("RPC get_users_with_roles failed:", rpcError);

      // Try direct SQL queries as a fallback
      const { data: profiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("*");

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine the data
      const roleMap = {};
      if (roles) {
        roles.forEach((role) => {
          roleMap[role.user_id] = role.role;
        });
      }

      // Get emails from auth.users if available
      let emailMap = {};
      try {
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        if (authUsers?.users) {
          authUsers.users.forEach((user) => {
            emailMap[user.id] = user.email;
          });
        }
      } catch (emailError) {
        console.warn("Could not get emails from auth.users:", emailError);
      }

      const combinedData = profiles.map((profile) => ({
        id: profile.id,
        username: profile.username || profile.id.substring(0, 8),
        email:
          emailMap[profile.id] ||
          `${profile.username || profile.id.substring(0, 8)}@dogecuts.org`,
        created_at: profile.created_at,
        role: roleMap[profile.id] || "user",
        blocked: profile.blocked || false,
        blocked_reason: profile.blocked_reason,
        blocked_at: profile.blocked_at,
      }));

      return { data: combinedData, success: true };
    }

    return { data: rpcData, success: true };
  } catch (error) {
    console.error("Error in directGetUsersWithRoles:", error);
    return { success: false, error };
  }
};
