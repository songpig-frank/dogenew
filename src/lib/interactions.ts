import { supabase } from "./supabase";

export interface UserInteraction {
  user_id: string;
  submission_id: string;
  type: "like" | "comment";
}

export const checkUserLike = async (submissionId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_interactions")
      .select("*")
      .eq("submission_id", submissionId)
      .eq("user_id", userId)
      .eq("type", "like")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking like:", error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error("Error in checkUserLike:", err);
    return false;
  }
};

export const toggleLike = async (submissionId: string, userId: string) => {
  try {
    const hasLiked = await checkUserLike(submissionId, userId);
    console.log("Current like status:", hasLiked);

    // Start a transaction
    const { error: transactionError } = await supabase.rpc("toggle_like", {
      p_submission_id: submissionId,
      p_user_id: userId,
      p_is_liked: !hasLiked,
    });

    if (transactionError) {
      console.error("Transaction error:", transactionError);
      throw transactionError;
    }

    // Fetch the updated submission to get the new likes count
    const { data: updatedSubmission, error: fetchError } = await supabase
      .from("submissions")
      .select("likes")
      .eq("id", submissionId)
      .single();

    if (fetchError) {
      console.error("Error fetching updated submission:", fetchError);
      throw fetchError;
    }

    console.log("Updated submission:", updatedSubmission);
    return !hasLiked;
  } catch (err) {
    console.error("Error in toggleLike:", err);
    throw err;
  }
};
