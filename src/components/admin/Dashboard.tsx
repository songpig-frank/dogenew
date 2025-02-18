import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, ThumbsUp, AlertTriangle } from "lucide-react";

import SocialAnalytics from "./SocialAnalytics";
import ModeratorStats from "./ModeratorStats";
import ModeratorDashboard from "./ModeratorDashboard";

const statsCards = [
  {
    title: "Total Submissions",
    value: "1,234",
    icon: FileText,
    change: "+12%",
  },
  {
    title: "Active Users",
    value: "456",
    icon: Users,
    change: "+5%",
  },
  {
    title: "Positive Feedback",
    value: "89%",
    icon: ThumbsUp,
    change: "+2%",
  },
  {
    title: "Issues Resolved",
    value: "345",
    icon: AlertTriangle,
    change: "+8%",
  },
];

import { setupTestData } from "@/lib/setupTestData";

const Dashboard = () => {
  return (
    <div>
      <div className="flex gap-4 mb-6">
        <Button
          onClick={async () => {
            try {
              const result = await setupTestData();
              if (result.success) {
                alert("Test data created successfully!");
              } else {
                alert(
                  "Error creating test data: " + JSON.stringify(result.error),
                );
              }
            } catch (err) {
              console.error("Error:", err);
              alert("Error creating test data");
            }
          }}
        >
          Create Test Data
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 space-y-8">
        <ModeratorStats />
        <ModeratorDashboard />
        <SocialAnalytics />
      </div>
    </div>
  );
};

export default Dashboard;
