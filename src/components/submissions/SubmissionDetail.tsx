import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Submission } from "./SubmissionsList";
import { getCategoryColor } from "@/lib/utils";
import { useAuth } from "@/lib/AuthProvider";
import { checkUserLike, toggleLike } from "@/lib/interactions";
import { checkCommentVote, toggleCommentVote } from "@/lib/commentVotes";
import { updateMetaTags } from "@/lib/meta";
import { getSubmissionMeta } from "@/lib/social";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import ShareDialog from "@/components/shared/ShareDialog";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id?: string;
  submission_id: string;
  upvotes: number;
  downvotes: number;
  username?: string;
}

const SubmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [submission, setSubmission] = React.useState<Submission | null>(null);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [newComment, setNewComment] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [showCommentsDialog, setShowCommentsDialog] = React.useState(false);
  const [showShareDialog, setShowShareDialog] = React.useState(false);
  const [commentSort, setCommentSort] = React.useState<"newest" | "oldest">(
    "newest",
  );
  const { user } = useAuth();

  const [hasLiked, setHasLiked] = React.useState(false);
  const [commentVotes, setCommentVotes] = React.useState<
    Record<string, "up" | "down" | null>
  >({});

  const fetchSubmission = async () => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setSubmission(data);
    } catch (error) {
      console.error("Error fetching submission:", error);
    }
  };

  const fetchComments = async () => {
    if (!id) return;
    try {
      // Step 1: Test basic connection
      const { data: testData, error: testError } = await supabase
        .from("comments")
        .select("count");

      let debugInfo = "Step 1 - Basic Connection Test:\n";
      if (testError) {
        debugInfo += `❌ Error: ${testError.message}\n`;
      } else {
        debugInfo += `✅ Success! Found ${testData[0]?.count || 0} total comments\n`;
      }

      // Step 2: Try to fetch comments for this submission
      debugInfo += "\nStep 2 - Fetching Comments for Submission:\n";
      debugInfo += `Submission ID: ${id}\n`;

      const { data, error } = await supabase
        .from("comments")
        .select(
          "id, content, created_at, user_id, submission_id, upvotes, downvotes, username",
        )
        .eq("submission_id", id)
        .order("created_at", { ascending: commentSort === "oldest" });

      // Show debug dialog
      const debugDialog = document.createElement("div");
      debugDialog.style.cssText =
        "position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); display: flex; align-items: center; justify-content: center; z-index: 99999; pointer-events: auto;";

      const dialogContent = document.createElement("div");
      dialogContent.style.cssText =
        "background: white; padding: 24px; border-radius: 8px; width: 100%; max-width: 42rem; margin: 16px; position: relative; color: black; pointer-events: auto;";

      dialogContent.innerHTML = `
        <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 16px;">Debug Information</h2>
        <pre style="background: #f3f4f6; padding: 16px; border-radius: 4px; font-size: 0.875rem; overflow: auto; max-height: 400px; margin-bottom: 16px; white-space: pre-wrap; user-select: text;">${debugInfo}</pre>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button id="copyBtn" style="padding: 8px 16px; background: #3b82f6; color: white; border-radius: 4px; cursor: pointer;">Copy</button>
          <button id="closeBtn" style="padding: 8px 16px; background: #6b7280; color: white; border-radius: 4px; cursor: pointer;">Close</button>
        </div>
      `;

      debugDialog.appendChild(dialogContent);
      document.body.appendChild(debugDialog);

      // Stop event propagation
      dialogContent.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      // Add event listeners
      const copyBtn = dialogContent.querySelector("#copyBtn");
      const closeBtn = dialogContent.querySelector("#closeBtn");

      copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const preElement = dialogContent.querySelector("pre");
        navigator.clipboard.writeText(preElement.textContent);
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
      });

      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        debugDialog.remove();
      });

      // Close on backdrop click
      debugDialog.addEventListener("click", () => {
        debugDialog.remove();
      });

      if (error) {
        debugInfo += `❌ Error: ${error.message}\n`;
      } else {
        debugInfo += `✅ Success! Found ${data?.length || 0} comments for this submission\n`;
        debugInfo += "\nComments:\n";
        data?.forEach((comment, i) => {
          debugInfo += `${i + 1}. ${comment.content} (by ${comment.username || "Anonymous"})\n`;
        });
      }

      if (error) {
        debugInfo += `❌ Error: ${error.message}\n`;
      } else {
        debugInfo += `✅ Success! Found ${data?.length || 0} comments for this submission\n`;
        debugInfo += "\nComments:\n";
        data?.forEach((comment, i) => {
          debugInfo += `${i + 1}. ${comment.content} (by ${comment.username || "Anonymous"})\n`;
        });
      }

      console.log("Comments query result:", { data, error });

      if (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }

      console.log("Fetched comments:", data);
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (id) {
      fetchSubmission();
      fetchComments();
    }

    const params = new URLSearchParams(location.search);
    if (params.get("showComments") === "true") {
      setShowCommentsDialog(true);
    }
  }, [id, commentSort]);

  React.useEffect(() => {
    if (user && submission) {
      checkUserLike(submission.id, user.id).then(setHasLiked);
    }
  }, [user, submission]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!submission) return;
    try {
      const newLikeState = await toggleLike(submission.id, user.id);
      setHasLiked(newLikeState);
      fetchSubmission();
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const handleVote = async (commentId: string, voteType: "up" | "down") => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const currentVote = commentVotes[commentId];
      const newVote = currentVote === voteType ? null : voteType;
      setCommentVotes((prev) => ({ ...prev, [commentId]: newVote }));

      await toggleCommentVote(commentId, user.id, voteType);
      await fetchComments();
    } catch (error) {
      console.error("Error voting on comment:", error);
      fetchComments();
    }
  };

  const [commentError, setCommentError] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleComment = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!id) return;

    const trimmedComment = newComment.trim();
    if (!trimmedComment) {
      setCommentError("Please enter a comment");
      return;
    }

    setIsSubmitting(true);
    setCommentError("");

    try {
      // First get the user's profile
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      const username =
        profile?.username || user.email?.split("@")[0] || "Anonymous";

      // Insert the comment
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            content: trimmedComment,
            submission_id: id,
            user_id: user.id,
            username,
            upvotes: 0,
            downvotes: 0,
          },
        ])
        .select();

      if (error) {
        console.error("Comment insert error:", error);
        throw error;
      }

      console.log("Comment inserted:", data);

      setNewComment("");
      setCommentError("");

      if (submission) {
        const { error: updateError } = await supabase
          .from("submissions")
          .update({ comments: (submission.comments || 0) + 1 })
          .eq("id", id);

        if (updateError) {
          console.error(
            "Error updating submission comment count:",
            updateError,
          );
        }

        await fetchSubmission();
        await fetchComments();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setCommentError(
        error instanceof Error
          ? error.message
          : "Failed to submit comment. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!submission) {
    return <div className="text-center py-8">Submission not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate("/submissions")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Submissions
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-2xl">{submission.title}</CardTitle>
            <Badge className={getCategoryColor(submission.category)}>
              {submission.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">{submission.description}</p>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={handleLike}
            >
              <ThumbsUp
                className={`h-4 w-4 ${hasLiked ? "fill-current" : ""}`}
              />
              <span>{submission.likes}</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => setShowCommentsDialog(true)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{submission.comments}</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => setShowShareDialog(true)}
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCommentsDialog} onOpenChange={setShowCommentsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
            <div className="text-sm text-muted-foreground">
              Join the discussion
            </div>
          </DialogHeader>

          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              {comments.length} comments
            </p>
            <Select
              value={commentSort}
              onValueChange={(value: "newest" | "oldest") =>
                setCommentSort(value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-muted-foreground">
                      {comment.username || "Anonymous"} •{" "}
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-foreground">{comment.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(comment.id, "up")}
                      className={
                        commentVotes[comment.id] === "up" ? "bg-accent" : ""
                      }
                    >
                      <ThumbsUp
                        className={`h-4 w-4 mr-1 ${commentVotes[comment.id] === "up" ? "fill-current" : ""}`}
                      />
                      {comment.upvotes || 0}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(comment.id, "down")}
                      className={
                        commentVotes[comment.id] === "down" ? "bg-accent" : ""
                      }
                    >
                      <ThumbsDown
                        className={`h-4 w-4 mr-1 ${commentVotes[comment.id] === "down" ? "fill-current" : ""}`}
                      />
                      {comment.downvotes || 0}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                setCommentError("");
              }}
              className="mb-2"
            />
            {commentError && (
              <p className="text-sm text-destructive mb-2">{commentError}</p>
            )}
            <Button
              onClick={handleComment}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        title={submission.title}
        description={submission.description}
        url={`${window.location.origin}${location.pathname}`}
      />
    </div>
  );
};

export default SubmissionDetail;
