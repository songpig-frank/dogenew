import { supabase } from "./supabase";

export const testConnection = async () => {
  try {
    console.log("Testing Supabase connection...");

    // Test basic table access
    const { data: submissionData, error: submissionError } = await supabase
      .from("submissions")
      .select("count");

    if (submissionError) {
      console.error("Submission test failed:", submissionError);
      throw submissionError;
    }

    console.log("Submission test passed");

    // Test comments table
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .select("count");

    if (commentError) {
      console.error("Comment test failed:", commentError);
      throw commentError;
    }

    console.log("Comment test passed");

    return { success: true };
  } catch (error) {
    console.error("Connection test failed:", error);
    return { success: false, error };
  }
};
