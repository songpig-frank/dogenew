import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

interface ShareStats {
  id: string;
  title: string;
  share_count: number;
  created_at: string;
}

const SocialAnalytics = () => {
  const [topShared, setTopShared] = React.useState<ShareStats[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchShareStats = async () => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("id, title, share_count, created_at")
        .order("share_count", { ascending: false })
        .limit(10);

      if (error) throw error;
      setTopShared(data || []);
    } catch (error) {
      console.error("Error fetching share stats:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchShareStats();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Social Sharing Analytics</h2>

      <Card>
        <CardHeader>
          <CardTitle>Most Shared Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading share statistics...</p>
          ) : topShared.length === 0 ? (
            <p className="text-muted-foreground">No shares recorded yet</p>
          ) : (
            <div className="space-y-4">
              {topShared.map((submission) => (
                <div
                  key={submission.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{submission.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Created:{" "}
                      {new Date(submission.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {submission.share_count}
                    </p>
                    <p className="text-sm text-muted-foreground">shares</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialAnalytics;
