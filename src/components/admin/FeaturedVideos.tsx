import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink, Youtube, RefreshCw } from "lucide-react";
import {
  getFeaturedVideos,
  deleteFeaturedVideo,
} from "@/lib/youtube-api-direct";

interface VideoItem {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount?: string;
  platform: "youtube" | "rumble";
  keywords: string[];
}

const FeaturedVideos = () => {
  const [videos, setVideos] = React.useState<VideoItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const featuredVideos = await getFeaturedVideos();
      setVideos(featuredVideos);
    } catch (error) {
      console.error("Error fetching featured videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    try {
      const success = await deleteFeaturedVideo(videoId);
      if (success) {
        setVideos(videos.filter((v) => v.id !== videoId));
      }
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  const getVideoUrl = (video: VideoItem) => {
    if (video.platform === "youtube") {
      return `https://www.youtube.com/watch?v=${video.id}`;
    } else if (video.platform === "rumble") {
      return `https://rumble.com/embed/${video.id}`;
    }
    return "#";
  };

  React.useEffect(() => {
    fetchVideos();
    // Refresh videos every 30 seconds
    const interval = setInterval(fetchVideos, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Featured Videos</CardTitle>
          <Button variant="outline" onClick={fetchVideos} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No featured videos found. Add videos from the YouTube Manager.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-16 h-9 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://placehold.co/160x90/gray/white?text=No+Preview";
                          }}
                        />
                        <span className="font-medium">{video.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{video.channelTitle}</TableCell>
                    <TableCell>
                      {new Date(video.publishedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{video.viewCount || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          video.platform === "youtube" ? "default" : "secondary"
                        }
                      >
                        {video.platform === "youtube" ? (
                          <Youtube className="h-3 w-3 mr-1" />
                        ) : null}
                        {video.platform.charAt(0).toUpperCase() +
                          video.platform.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            window.open(getVideoUrl(video), "_blank")
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => handleDelete(video.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeaturedVideos;
