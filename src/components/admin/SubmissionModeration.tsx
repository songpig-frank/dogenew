import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

interface Submission {
  id: string;
  title: string;
  description: string;
  category: "Praise" | "Complaint" | "Recommendation";
  status: "pending" | "approved" | "rejected";
  created_at: string;
  username?: string;
  email?: string;
  user_role?: "admin" | "moderator" | "user";
  is_anonymous?: boolean;
}

const SubmissionModeration = () => {
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchSubmissions = async () => {
    try {
      console.log("Fetching submissions...");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Current session:", session);

      if (!session) {
        console.error("No session found");
        return;
      }

      console.log("Fetching with session:", session);
      // Try to use the RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "get_pending_submissions_with_emails",
      );

      console.log("RPC data for submissions:", rpcData);

      if (rpcError) {
        console.error(
          "RPC function failed, falling back to regular query:",
          rpcError,
        );
        // Fall back to regular query
        const { data, error } = await supabase
          .from("submissions")
          .select(
            "*, user_profiles!submissions_user_id_fkey(username, display_name, email), user_roles!user_roles_user_id_fkey(role), auth.users!submissions_user_id_fkey(email)",
          )
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      }

      // Use the RPC data
      const data = rpcData;

      // Process the data to flatten the structure
      if (data) {
        data.forEach((submission) => {
          if (submission.user_profiles) {
            submission.username =
              submission.user_profiles.display_name ||
              submission.user_profiles.username;
            submission.email = submission.user_profiles.email;
          } else {
            // If no user profile, try to get username from user_id
            submission.username = submission.user_id
              ? submission.user_id.substring(0, 8)
              : "Anonymous";
          }
          // Get email from auth.users if not in user_profiles
          if (!submission.email && submission.users) {
            submission.email = submission.users.email;
          }
          if (submission.user_roles) {
            submission.user_role = submission.user_roles.role;
          }
          // Clean up the nested objects
          delete submission.user_profiles;
          delete submission.user_roles;
          delete submission.users;
        });
      }

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Fetched submissions:", data);
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleModeration = async (
    submissionId: string,
    status: "approved" | "rejected",
  ) => {
    try {
      console.log(`Updating submission ${submissionId} to ${status}`);
      const { error } = await supabase
        .from("submissions")
        .update({
          status: status,
        })
        .eq("id", submissionId);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      await fetchSubmissions();
    } catch (error) {
      console.error("Error moderating submission:", error);
      alert("Error updating submission status");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading submissions...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Submission Moderation</h1>

      {submissions.length === 0 ? (
        <p className="text-muted-foreground">
          No submissions pending moderation
        </p>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{submission.title}</CardTitle>
                  <Badge>{submission.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    From:{" "}
                    {submission.is_anonymous
                      ? "Anonymous"
                      : submission.username || "Anonymous"}{" "}
                    <span className="text-blue-500">
                      (Admin only: {submission.email || "No email available"})
                    </span>
                  </p>
                  <p className="mb-4">{submission.description}</p>
                  <p className="text-sm text-muted-foreground">
                    Posted: {new Date(submission.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    onClick={() => handleModeration(submission.id, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleModeration(submission.id, "rejected")}
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

export default SubmissionModeration;
