import { supabase } from "./supabase";

export const createTestData = async () => {
  console.log("Starting createTestData...");
  try {
    // First ensure we have the admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("No user found");
      return { success: false, error: "No user found" };
    }

    console.log("Creating test data with user:", user.id);

    // Add admin role if not exists
    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert({ user_id: user.id, role: "admin" });

    if (roleError) {
      console.error("Error adding admin role:", roleError);
      return { success: false, error: roleError };
    }

    // Create test submissions
    const { data: submissions, error: submissionError } = await supabase
      .from("submissions")
      .upsert([
        {
          title: "Test Submission 1",
          description: "This is a test submission pending moderation",
          category: "Recommendation",
          status: "pending",
          likes: 0,
          comments: 0,
          user_id: user.id,
        },
        {
          title: "Test Submission 2",
          description: "Another test submission needing review",
          category: "Complaint",
          status: "pending",
          likes: 0,
          comments: 0,
          user_id: user.id,
        },
      ])
      .select();

    if (submissionError) throw submissionError;

    // Create test comments
    if (submissions) {
      const { error: commentError } = await supabase.from("comments").insert([
        {
          content: "Test comment 1 pending review",
          submission_id: submissions[0].id,
          status: "pending",
          user_id: user.id,
          upvotes: 0,
          downvotes: 0,
        },
        {
          content: "Test comment 2 needing moderation",
          submission_id: submissions[0].id,
          status: "pending",
          user_id: user.id,
          upvotes: 0,
          downvotes: 0,
        },
      ]);

      if (commentError) throw commentError;
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating test data:", error);
    return { success: false, error };
  }
};
