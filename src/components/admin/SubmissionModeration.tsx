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
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

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
                    From: {submission.user_id ? "Registered User" : "Anonymous"}
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
