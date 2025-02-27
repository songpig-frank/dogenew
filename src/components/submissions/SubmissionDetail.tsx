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

export interface Submission {
  id: string;
  title: string;
  description: string;
  category: "Praise" | "Complaint" | "Recommendation";
  likes: number;
  comments: number;
  created_at: string;
  username?: string;
  is_anonymous?: boolean;
  email?: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id?: string;
  submission_id: string;
  upvotes: number;
  downvotes: number;
  username?: string;
  is_anonymous?: boolean;
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
      // Fetch comments for this submission

      const { data, error } = await supabase
        .from("comments")
        .select(
          "id, content, created_at, user_id, submission_id, upvotes, downvotes, username, is_anonymous",
        )
        .eq("submission_id", id)
        .eq("status", "approved")
        .order("created_at", { ascending: commentSort === "oldest" });

      if (error) {
        throw error;
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

      // First update user profile with display name if needed
      if (username) {
        // Get existing profile first
        const { data: existingProfile } = await supabase
          .from("user_profiles")
          .select("username, display_name, email")
          .eq("id", user.id)
          .single();

        await supabase.from("user_profiles").upsert({
          id: user.id,
          username: username,
          // Only update display_name if it doesn't exist or is the same as the old username
          display_name: existingProfile?.display_name || username,
          email: user.email,
        });
      }

      // Insert the comment - it will be auto-moderated by the database trigger
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            content: trimmedComment,
            submission_id: id,
            user_id: user.id,
            username,
            is_anonymous: false, // Default to not anonymous, could add a toggle for this
            upvotes: 0,
            downvotes: 0,
            // status will be set by the auto_moderate_comment trigger
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
        // Fetch comments - this will include the newly added comment if it was auto-approved
        await fetchComments();

        // Show a message if the comment needs moderation
        if (data && data[0] && data[0].status === "pending") {
          setCommentError(
            "Your comment contains links or potentially inappropriate content and will be reviewed by a moderator before appearing.",
          );
        }
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
                      {comment.is_anonymous
                        ? "Anonymous"
                        : comment.username || "Anonymous"}{" "}
                      • {new Date(comment.created_at).toLocaleString()}
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
