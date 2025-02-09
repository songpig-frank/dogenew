import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import { Button } from "../ui/button";

interface TrendingItem {
  id: string;
  title: string;
  description: string;
  category: "Praise" | "Complaint" | "Recommendation";
  likes: number;
  comments: number;
}

interface TrendingGridProps {
  items?: TrendingItem[];
}

const defaultItems: TrendingItem[] = [
  {
    id: "1",
    title: "Park Maintenance Improvement",
    description:
      "The recent renovation of Central Park has significantly improved community access and safety.",
    category: "Praise",
    likes: 245,
    comments: 18,
  },
  {
    id: "2",
    title: "Traffic Light Timing Issue",
    description:
      "The intersection at Main and 5th needs better signal timing during rush hour.",
    category: "Complaint",
    likes: 189,
    comments: 32,
  },
  {
    id: "3",
    title: "Digital Permit System",
    description:
      "Implementing an online permit application system would save time and resources.",
    category: "Recommendation",
    likes: 156,
    comments: 24,
  },
];

const getCategoryColor = (category: TrendingItem["category"]) => {
  switch (category) {
    case "Praise":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    case "Complaint":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
    case "Recommendation":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
  }
};

const TrendingGrid = ({ items = defaultItems }: TrendingGridProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card
            key={item.id}
            className="w-full hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <Badge className={getCategoryColor(item.category)}>
                  {item.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                {item.description}
              </CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="flex space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{item.likes}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{item.comments}</span>
                </Button>
              </div>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TrendingGrid;
