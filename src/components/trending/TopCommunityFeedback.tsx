import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";
import { checkUserLike, toggleLike } from "@/lib/interactions";
import { supabase } from "@/lib/supabase";
import { getCategoryColor } from "@/lib/utils";
import ShareDialog from "../shared/ShareDialog";

interface TopSubmission {
  id: string;
  title: string;
  description: string;
  category: "Praise" | "Complaint" | "Recommendation";
  likes: number;
  comments: number;
  created_at: string;
  username?: string;
  is_anonymous?: boolean;
}

const TopCommunityFeedback = () => {
  const { user } = useAuth();
  const [likedItems, setLikedItems] = React.useState<Record<string, boolean>>(
    {},
  );
  const navigate = useNavigate();
  const [items, setItems] = React.useState<TopSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showShareDialog, setShowShareDialog] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<TopSubmission | null>(
    null,
  );

  React.useEffect(() => {
    if (user && items.length > 0) {
      items.forEach(async (item) => {
        const hasLiked = await checkUserLike(item.id, user.id);
        setLikedItems((prev) => ({ ...prev, [item.id]: hasLiked }));
      });
    }
  }, [user, items]);

  React.useEffect(() => {
    const fetchTopItems = async () => {
      try {
        // Fetch top submissions based on engagement (likes + comments)
        const { data, error } = await supabase
          .from("submissions")
          .select("*")
          .eq("status", "approved")
          .eq("archived", false)
          .order("likes", { ascending: false })
          .limit(6);

        if (error) throw error;

        // Sort by engagement score (likes + comments)
        const sortedData = [...(data || [])].sort((a, b) => {
          const scoreA = (a.likes || 0) + (a.comments || 0);
          const scoreB = (b.likes || 0) + (b.comments || 0);
          return scoreB - scoreA;
        });

        console.log(
          "Top community feedback items:",
          sortedData.map((item) => ({
            id: item.id,
            title: item.title,
            likes: item.likes,
            comments: item.comments,
            score: (item.likes || 0) + (item.comments || 0),
          })),
        );

        setItems(sortedData);
      } catch (error) {
        console.error("Error fetching top items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopItems();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading top feedback...</div>;
  }

  return (
    <div className="bg-background p-6">
      <h2 className="text-2xl font-bold mb-6">Top Community Feedback</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card
            key={item.id}
            className="w-full hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/submissions/${item.id}`)}
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
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {item.description}
              </p>
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!user) {
                        navigate("/login");
                        return;
                      }
                      try {
                        const newLikeState = await toggleLike(item.id, user.id);
                        setLikedItems((prev) => ({
                          ...prev,
                          [item.id]: newLikeState,
                        }));
                        const { data } = await supabase
                          .from("submissions")
                          .select("likes")
                          .eq("id", item.id)
                          .single();
                        setItems((prev) =>
                          prev.map((i) =>
                            i.id === item.id
                              ? { ...i, likes: data?.likes || i.likes }
                              : i,
                          ),
                        );
                      } catch (error) {
                        console.error("Error updating like:", error);
                      }
                    }}
                  >
                    <ThumbsUp
                      className={`h-4 w-4 ${likedItems[item.id] ? "fill-current" : ""}`}
                    />
                    <span>{item.likes}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/submissions/${item.id}?showComments=true`);
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{item.comments}</span>
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem(item);
                    setShowShareDialog(true);
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedItem && (
        <ShareDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          title={selectedItem.title}
          description={selectedItem.description}
          url={`${window.location.origin}/submissions/${selectedItem.id}`}
        />
      )}
    </div>
  );
};

export default TopCommunityFeedback;
