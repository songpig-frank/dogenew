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

const MockFeaturedVideos = () => {
  const [videos, setVideos] = React.useState<VideoItem[]>([
    {
      id: "video1",
      title: "Government Waste Investigation",
      channelTitle: "News Channel",
      publishedAt: "2023-05-15T14:30:00Z",
      thumbnailUrl: "https://i.ytimg.com/vi/abc123/mqdefault.jpg",
      viewCount: "15,432",
      platform: "youtube",
      keywords: ["government", "waste"],
    },
    {
      id: "video2",
      title: "Taxpayer Money Misuse Report",
      channelTitle: "Watchdog Group",
      publishedAt: "2023-05-10T09:15:00Z",
      thumbnailUrl: "https://i.ytimg.com/vi/def456/mqdefault.jpg",
      viewCount: "8,921",
      platform: "youtube",
      keywords: ["taxpayer", "government"],
    },
  ]);
  const [loading, setLoading] = React.useState(false);

  const handleDelete = (videoId: string) => {
    setVideos(videos.filter((v) => v.id !== videoId));
  };

  const getVideoUrl = (video: VideoItem) => {
    if (video.platform === "youtube") {
      return `https://www.youtube.com/watch?v=${video.id}`;
    } else if (video.platform === "rumble") {
      return `https://rumble.com/embed/${video.id}`;
    }
    return "#";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Featured Videos (Mock)</CardTitle>
          <Button variant="outline" disabled={loading}>
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

export default MockFeaturedVideos;
