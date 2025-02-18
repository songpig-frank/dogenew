import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserStats } from "@/lib/types/user";

interface UserStatsCardProps {
  stats: UserStats;
  isLoading?: boolean;
}

const UserStatsCard = ({ stats, isLoading }: UserStatsCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Total Submissions
            </dt>
            <dd className="text-2xl font-bold">{stats.total_submissions}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Total Comments
            </dt>
            <dd className="text-2xl font-bold">{stats.total_comments}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Total Likes Given
            </dt>
            <dd className="text-2xl font-bold">{stats.total_likes}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;
