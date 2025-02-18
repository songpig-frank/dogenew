import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TestDataButton from "./TestDataButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  submission_id: string;
  status: "pending" | "approved" | "rejected";
  moderated_content?: string;
  submissions?: {
    title: string;
  };
}

const CommentModeration = () => {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchComments = async () => {
    try {
      console.log("Fetching pending comments...");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Current session:", session);

      if (!session) {
        console.error("No session found");
        return;
      }

      // First check if user has admin/moderator role
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (rolesError) {
        console.error("Error checking roles:", rolesError);
        throw rolesError;
      }

      const isAdminOrMod = roles?.some((r) =>
        ["admin", "moderator"].includes(r.role),
      );
      console.log("User roles:", roles, "Is admin/mod:", isAdminOrMod);

      if (!isAdminOrMod) {
        console.error("User is not admin/moderator");
        return;
      }

      // Fetch pending comments
      console.log("Fetching pending comments...");
      const { data, error } = await supabase
        .from("comments")
        .select("*, submissions(title)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      console.log("Fetched comments:", { data, error });

      console.log("Comments fetch result:", { data, error });

      if (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }

      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchComments();
  }, []);

  const handleModeration = async (
    commentId: string,
    status: "approved" | "rejected",
  ) => {
    try {
      console.log(`Moderating comment ${commentId} to ${status}`);
      const { error } = await supabase
        .from("comments")
        .update({
          status,
        })
        .eq("id", commentId);

      if (error) {
        console.error("Error updating comment:", error);
        throw error;
      }

      // Remove the moderated comment from the local state
      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error("Error moderating comment:", error);
      alert("Error updating comment status");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading comments...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Comment Moderation</h1>
        <TestDataButton />
      </div>

      {comments.length === 0 ? (
        <p className="text-muted-foreground">No comments pending moderation</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Comment on "
                    {comment.submissions?.title || "Unknown Submission"}"
                  </CardTitle>
                  <Badge variant="secondary">{comment.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    From: {comment.user_id ? "Registered User" : "Anonymous"}
                  </p>
                  <p className="mb-4">{comment.content}</p>
                  <p className="text-sm text-muted-foreground">
                    Posted: {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="default"
                    onClick={() => handleModeration(comment.id, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleModeration(comment.id, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentModeration;
