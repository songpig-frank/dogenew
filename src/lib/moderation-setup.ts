import { supabase } from "./supabase";

export const flagAllForModeration = async () => {
  try {
    // Update all submissions to pending
    const { error: submissionError } = await supabase
      .from("submissions")
      .update({ status: "pending" })
      .is("status", null);

    if (submissionError) throw submissionError;

    // Update all comments to pending
    const { error: commentError } = await supabase
      .from("comments")
      .update({ status: "pending" })
      .is("status", null);

    if (commentError) throw commentError;

    return { success: true };
  } catch (error) {
    console.error("Error flagging content for moderation:", error);
    return { success: false, error };
  }
};
