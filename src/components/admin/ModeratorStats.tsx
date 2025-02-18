import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

interface ModStats {
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  avg_response_time: number;
  response_times: {
    last_24h: number;
    last_week: number;
  };
  daily_stats: {
    submissions: number;
    comments: number;
  };
  category_stats: {
    praise: number;
    complaint: number;
    recommendation: number;
  };
}

const ModeratorStats = () => {
  const [stats, setStats] = React.useState<ModStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchStats = async () => {
    try {
      // Get submission stats
      const { data: submissions, error: subError } = await supabase
        .from("submissions")
        .select("status, category, created_at, moderated_at");

      if (subError) throw subError;

      // Get comment stats
      const { data: comments, error: commError } = await supabase
        .from("comments")
        .select("status, created_at, moderated_at");

      if (commError) throw commError;

      // Calculate time ranges
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Combine all items for status counts
      const allItems = [...(submissions || []), ...(comments || [])];

      // Calculate response times for moderated items
      const moderatedItems = allItems.filter((item) => item.moderated_at);
      const responseTimes = moderatedItems.map((item) => {
        const created = new Date(item.created_at);
        const moderated = new Date(item.moderated_at);
        return (moderated.getTime() - created.getTime()) / (1000 * 60); // minutes
      });

      const avgResponseTime =
        responseTimes.length > 0
          ? Math.round(
              responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
            )
          : 0;

      // Calculate category stats
      const categoryStats = {
        praise: submissions?.filter((s) => s.category === "Praise").length || 0,
        complaint:
          submissions?.filter((s) => s.category === "Complaint").length || 0,
        recommendation:
          submissions?.filter((s) => s.category === "Recommendation").length ||
          0,
      };

      // Calculate daily stats
      const dailyStats = {
        submissions:
          submissions?.filter((s) => new Date(s.created_at) > last24h).length ||
          0,
        comments:
          comments?.filter((c) => new Date(c.created_at) > last24h).length || 0,
      };

      const stats = {
        total_pending: allItems.filter((i) => i.status === "pending").length,
        total_approved: allItems.filter((i) => i.status === "approved").length,
        total_rejected: allItems.filter((i) => i.status === "rejected").length,
        avg_response_time: avgResponseTime,
        response_times: {
          last_24h: allItems.filter((i) => new Date(i.created_at) > last24h)
            .length,
          last_week: allItems.filter((i) => new Date(i.created_at) > lastWeek)
            .length,
        },
        daily_stats: dailyStats,
        category_stats: categoryStats,
      };

      setStats(stats);
    } catch (error) {
      console.error("Error fetching moderation stats:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
    // Refresh stats every minute
    const interval = setInterval(fetchStats, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading stats...</div>;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Avg. Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avg_response_time ? `${stats.avg_response_time}m` : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">New Submissions (24h)</p>
                <p className="text-2xl font-bold">
                  {stats.daily_stats.submissions}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">New Comments (24h)</p>
                <p className="text-2xl font-bold">
                  {stats.daily_stats.comments}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">Praise</p>
                <p className="text-2xl font-bold">
                  {stats.category_stats.praise}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Complaints</p>
                <p className="text-2xl font-bold">
                  {stats.category_stats.complaint}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Recommendations</p>
                <p className="text-2xl font-bold">
                  {stats.category_stats.recommendation}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModeratorStats;
