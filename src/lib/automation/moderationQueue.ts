import { supabase } from "../supabase";
import { autoModerateContent } from "./newsFeeds";

// Process moderation queue automatically
export const processModerationQueue = async () => {
  try {
    // Get pending submissions
    const { data: submissions } = await supabase
      .from("submissions")
      .select("*")
      .eq("status", "pending");

    if (!submissions) return;

    // Auto-moderate each submission
    for (const submission of submissions) {
      const isAcceptable = await autoModerateContent(
        `${submission.title} ${submission.description}`,
      );

      await supabase
        .from("submissions")
        .update({
          status: isAcceptable ? "approved" : "rejected",
          moderated_at: new Date().toISOString(),
        })
        .eq("id", submission.id);
    }

    // Same for comments
    const { data: comments } = await supabase
      .from("comments")
      .select("*")
      .eq("status", "pending");

    if (!comments) return;

    for (const comment of comments) {
      const isAcceptable = await autoModerateContent(comment.content);

      await supabase
        .from("comments")
        .update({
          status: isAcceptable ? "approved" : "rejected",
          moderated_at: new Date().toISOString(),
        })
        .eq("id", comment.id);
    }
  } catch (error) {
    console.error("Error processing moderation queue:", error);
  }
};

// Schedule moderation queue processing
export const scheduleModerationQueue = () => {
  // Run every hour
  setInterval(
    async () => {
      await processModerationQueue();
    },
    60 * 60 * 1000,
  );
};
