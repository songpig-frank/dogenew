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
  username?: string;
  email?: string;
  user_role?: "admin" | "moderator" | "user";
  is_anonymous?: boolean;
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

      // Try the new security definer function first
      const { data: secureData, error: secureError } = await supabase.rpc(
        "get_pending_comments_with_user_info",
      );

      if (!secureError && secureData) {
        console.log("Successfully fetched comments with secure function");

        // Get submission titles for comments
        for (const comment of secureData) {
          const { data: submission } = await supabase
            .from("submissions")
            .select("title")
            .eq("id", comment.submission_id)
            .single();

          if (submission) {
            comment.submissions = { title: submission.title };
          } else {
            comment.submissions = { title: "Unknown Submission" };
          }

          // If no username, use user_id substring
          if (!comment.username) {
            comment.username = comment.user_id
              ? comment.user_id.substring(0, 8)
              : "Anonymous";
          }
        }

        setComments(secureData);
        setLoading(false);
        return;
      }

      console.log("Secure function failed, trying alternatives:", secureError);

      // Try to use the RPC function
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "get_pending_comments_with_emails",
      );

      console.log("RPC data for comments:", rpcData);

      if (rpcError) {
        console.error(
          "RPC function failed, falling back to regular query:",
          rpcError,
        );
        // Fall back to regular query
        const { data, error } = await supabase
          .from("comments")
          .select(
            "*, submissions(title), user_profiles!comments_user_id_fkey(username, display_name, email), user_roles!user_roles_user_id_fkey(role), auth.users!comments_user_id_fkey(email)",
          )
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Get submission titles for comments
        for (const comment of data || []) {
          if (!comment.submissions?.title) {
            const { data: submission } = await supabase
              .from("submissions")
              .select("title")
              .eq("id", comment.submission_id)
              .single();

            if (submission) {
              comment.submissions = { title: submission.title };
            }
          }
        }

        // Process the data to flatten the structure
        if (data) {
          data.forEach((comment) => {
            if (comment.user_profiles) {
              comment.username =
                comment.user_profiles.display_name ||
                comment.user_profiles.username;
              comment.email = comment.user_profiles.email;
            } else {
              // If no user profile, try to get username from user_id
              comment.username = comment.user_id
                ? comment.user_id.substring(0, 8)
                : "Anonymous";
            }
            // Get email from auth.users if not in user_profiles
            if (!comment.email && comment.users) {
              comment.email = comment.users.email;
            }
            if (comment.user_roles) {
              comment.user_role = comment.user_roles.role;
            }
            // Clean up the nested objects
            delete comment.user_profiles;
            delete comment.user_roles;
            delete comment.users;
          });
        }

        setComments(data || []);
        return;
      }

      // Use the RPC data but we need to get submission titles
      const data = [...rpcData];

      // Get submission titles for comments from RPC
      for (const comment of data) {
        const { data: submission } = await supabase
          .from("submissions")
          .select("title")
          .eq("id", comment.submission_id)
          .single();

        if (submission) {
          comment.submissions = { title: submission.title };
        } else {
          comment.submissions = { title: "Unknown Submission" };
        }
      }

      // Process the data to flatten the structure
      if (data) {
        data.forEach((comment) => {
          if (comment.user_profiles) {
            comment.username =
              comment.user_profiles.display_name ||
              comment.user_profiles.username;
            comment.email = comment.user_profiles.email;
          } else {
            // If no user profile, try to get username from user_id
            comment.username = comment.user_id
              ? comment.user_id.substring(0, 8)
              : "Anonymous";
          }
          // Get email from auth.users if not in user_profiles
          if (!comment.email && comment.users) {
            comment.email = comment.users.email;
          }
          if (comment.user_roles) {
            comment.user_role = comment.user_roles.role;
          }
          // Clean up the nested objects
          delete comment.user_profiles;
          delete comment.user_roles;
          delete comment.users;
        });
      }

      console.log("Fetched comments:", { data });
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

      if (status === "rejected") {
        // Try the simple_reject_comment function first (doesn't use moderated_at)
        console.log("Using simple_reject_comment RPC function");
        const { data: simpleRejectResult, error: simpleRejectError } =
          await supabase.rpc("simple_reject_comment", {
            comment_id: commentId,
          });

        if (simpleRejectError) {
          console.error("simple_reject_comment failed:", simpleRejectError);

          // Try direct SQL execution with just status
          console.log("Trying direct SQL execution without moderated_at");
          const { error: sqlError } = await supabase.rpc("execute_sql", {
            sql_query: `UPDATE public.comments SET status = 'rejected' WHERE id = '${commentId}'`,
          });

          if (sqlError) {
            console.error("Direct SQL execution failed:", sqlError);

            // Last resort: regular update without moderated_at
            console.log("Trying regular update without moderated_at");
            const { error: updateError } = await supabase
              .from("comments")
              .update({
                status: "rejected",
              })
              .eq("id", commentId);

            if (updateError) {
              console.error("Regular update failed:", updateError);
              throw updateError;
            }
          }
        } else {
          console.log("simple_reject_comment succeeded:", simpleRejectResult);
        }
      } else {
        // For approvals, try direct SQL without moderated_at
        try {
          const { error: directError } = await supabase.rpc("execute_sql", {
            sql_query: `UPDATE public.comments SET status = '${status}' WHERE id = '${commentId}'`,
          });

          if (directError) {
            console.warn(
              "Direct SQL update failed, trying regular update:",
              directError,
            );
            // Fall back to regular update without moderated_at
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
          } else {
            console.log("Direct SQL update succeeded");
          }
        } catch (directErr) {
          console.warn(
            "Error with direct SQL update, trying regular update:",
            directErr,
          );
          // Fall back to regular update without moderated_at
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
        }
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
                    From:{" "}
                    {comment.is_anonymous
                      ? "Anonymous"
                      : comment.username || "Anonymous"}{" "}
                    <span className="text-blue-500">
                      (Admin only: {comment.email || "No email available"})
                    </span>
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
