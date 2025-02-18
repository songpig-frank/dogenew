import { supabase } from "./supabase";

export const setupTables = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Create test users
    const testUsers = [
      { id: user.id, username: "admin", role: "admin" },
      { id: crypto.randomUUID(), username: "moderator1", role: "moderator" },
      { id: crypto.randomUUID(), username: "user1", role: "user" },
      { id: crypto.randomUUID(), username: "user2", role: "user" },
      { id: crypto.randomUUID(), username: "user3", role: "user" },
    ];

    // Insert user profiles
    for (const testUser of testUsers) {
      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert({
          id: testUser.id,
          username: testUser.username,
          created_at: new Date().toISOString(),
        })
        .select();

      if (profileError && profileError.code !== "23505") {
        // Ignore duplicate key error
        console.error("Error creating profile:", profileError);
      }

      // Insert user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({
          user_id: testUser.id,
          role: testUser.role,
        })
        .select();

      if (roleError && roleError.code !== "23505") {
        // Ignore duplicate key error
        console.error("Error creating role:", roleError);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error setting up tables:", error);
    return { success: false, error };
  }
};
