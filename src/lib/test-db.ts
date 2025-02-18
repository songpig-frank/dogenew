import { supabase } from "./supabase";

export const testDatabase = async () => {
  try {
    console.log("Testing database connection...");

    // Test submissions table
    const { data: submissionData, error: submissionError } = await supabase
      .from("submissions")
      .select("count");

    console.log("Submission test:", {
      data: submissionData,
      error: submissionError,
    });

    // Test comments table
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .select("count");

    console.log("Comment test:", { data: commentData, error: commentError });

    // Test user roles
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("count");

    console.log("Role test:", { data: roleData, error: roleError });

    return {
      submissions: !submissionError,
      comments: !commentError,
      roles: !roleError,
    };
  } catch (error) {
    console.error("Database test failed:", error);
    return { error };
  }
};
