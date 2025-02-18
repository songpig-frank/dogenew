import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";
import { checkUserLike, toggleLike } from "@/lib/interactions";
import { supabase } from "@/lib/supabase";
import { getCategoryColor } from "@/lib/utils";
import ShareDialog from "../shared/ShareDialog";

interface TrendingItem {
  id: string;
  title: string;
  description: string;
  category: "Praise" | "Complaint" | "Recommendation";
  likes: number;
  comments: number;
}

const TrendingGrid = () => {
  const { user } = useAuth();
  const [likedItems, setLikedItems] = React.useState<Record<string, boolean>>(
    {},
  );
  const navigate = useNavigate();
  const [items, setItems] = React.useState<TrendingItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showShareDialog, setShowShareDialog] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<TrendingItem | null>(
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
    const fetchTrendingItems = async () => {
      try {
        const { data, error } = await supabase
          .from("submissions")
          .select("*")
          .eq("status", "approved")
          .order("likes", { ascending: false })
          .limit(6);

        if (error) throw error;
        setItems(data || []);
      } catch (error) {
        console.error("Error fetching trending items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingItems();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading trending items...</div>;
  }

  return (
    <div className="bg-background p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card
            key={item.id}
            className="w-full hover:shadow-lg transition-shadow"
          >
            <CardHeader
              className="cursor-pointer"
              onClick={() => navigate(`/submissions/${item.id}`)}
            >
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <Badge className={getCategoryColor(item.category)}>
                  {item.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
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
                          const newLikeState = await toggleLike(
                            item.id,
                            user.id,
                          );
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

export default TrendingGrid;
