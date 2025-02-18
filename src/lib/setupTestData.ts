import { supabase } from "./supabase";

export const setupTestData = async () => {
  try {
    // First ensure we have the admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("No user found");
    }

    // Create test submissions
    const { data: submissions, error: submissionError } = await supabase
      .from("submissions")
      .insert([
        {
          title: "Test Pending Submission",
          description: "This is a test submission that needs moderation",
          category: "Recommendation",
          status: "pending",
          user_id: user.id,
          likes: 0,
          comments: 0,
        },
      ])
      .select();

    if (submissionError) throw submissionError;

    // Create test comments
    if (submissions) {
      const { error: commentError } = await supabase.from("comments").insert([
        {
          content: "Test pending comment",
          submission_id: submissions[0].id,
          user_id: user.id,
          status: "pending",
        },
      ]);

      if (commentError) throw commentError;
    }

    return { success: true };
  } catch (error) {
    console.error("Error setting up test data:", error);
    return { success: false, error };
  }
};
