import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface ModQueueItem {
  id: string;
  title?: string;
  content?: string;
  category?: string;
  created_at: string;
  type: "submission" | "comment";
  user_id?: string;
  status: "pending" | "approved" | "rejected";
}

const ModeratorDashboard = () => {
  const [queue, setQueue] = React.useState<ModQueueItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<
    "pending" | "approved" | "rejected"
  >("pending");

  const fetchQueue = async () => {
    try {
      // Fetch submissions
      const { data: submissions, error: subError } = await supabase
        .from("submissions")
        .select("*")
        .eq("status", activeTab)
        .order("created_at", { ascending: false });

      if (subError) throw subError;

      // Fetch comments
      const { data: comments, error: commError } = await supabase
        .from("comments")
        .select("*")
        .eq("status", activeTab)
        .order("created_at", { ascending: false });

      if (commError) throw commError;

      // Combine and format data
      const formattedQueue = [
        ...(submissions?.map((s) => ({
          ...s,
          type: "submission" as const,
          content: s.description,
        })) || []),
        ...(comments?.map((c) => ({
          ...c,
          type: "comment" as const,
        })) || []),
      ].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setQueue(formattedQueue);
    } catch (error) {
      console.error("Error fetching moderation queue:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchQueue();
  }, [activeTab]);

  const handleModeration = async (
    item: ModQueueItem,
    newStatus: "approved" | "rejected",
  ) => {
    try {
      const table = item.type === "submission" ? "submissions" : "comments";
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq("id", item.id);

      if (error) throw error;
      fetchQueue();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Content Moderation</h1>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        {["pending", "approved", "rejected"].map((status) => (
          <TabsContent key={status} value={status}>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : queue.length === 0 ? (
              <div className="text-center py-8">No {status} items</div>
            ) : (
              <div className="space-y-4">
                {queue.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <CardTitle className="text-lg">
                            {item.title || "Comment"}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge>{item.type}</Badge>
                          {item.category && <Badge>{item.category}</Badge>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          From: {item.username || "Anonymous"}
                        </p>
                        <p className="mb-4">{item.content}</p>
                      </div>
                      {status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => {
                              supabase
                                .rpc("archive_submission", {
                                  submission_id: item.id,
                                })
                                .then(() => fetchQueue())
                                .catch((err) =>
                                  console.error("Error archiving:", err),
                                );
                            }}
                          >
                            Archive
                          </Button>
                          <Button
                            variant="default"
                            onClick={() => handleModeration(item, "approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleModeration(item, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {(status === "approved" || status === "rejected") && (
                        <Button
                          variant="outline"
                          onClick={() => handleModeration(item, "pending")}
                        >
                          Move to Pending
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ModeratorDashboard;
