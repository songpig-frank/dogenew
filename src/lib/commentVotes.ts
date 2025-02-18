import { supabase } from "./supabase";

export const checkCommentVote = async (commentId: string, userId: string) => {
  const { data, error } = await supabase
    .from("comment_votes")
    .select("vote_type")
    .eq("comment_id", commentId)
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking vote:", error);
    return null;
  }

  return data?.vote_type || null;
};

export const toggleCommentVote = async (
  commentId: string,
  userId: string,
  voteType: "up" | "down",
) => {
  try {
    const { data, error } = await supabase.rpc("handle_comment_vote", {
      p_comment_id: commentId,
      p_user_id: userId,
      p_vote_type: voteType,
    });

    if (error) throw error;
    return data as "up" | "down" | null;
  } catch (err) {
    console.error("Error in toggleCommentVote:", err);
    throw err;
  }
};
