import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Trash2, RefreshCw, ExternalLink } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount?: string;
  platform: "youtube" | "rumble";
  keywords: string[];
  selected: boolean;
}

const MockYouTubeManager = () => {
  const [keywords, setKeywords] = React.useState<string[]>([]);
  const [newKeyword, setNewKeyword] = React.useState("");
  const [videos, setVideos] = React.useState<VideoItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedVideos, setSelectedVideos] = React.useState<string[]>([]);

  // Add new keyword
  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    setKeywords([...keywords, newKeyword.trim()]);
    setNewKeyword("");
  };

  // Remove keyword
  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  // Fetch videos from YouTube API
  const fetchVideos = async () => {
    if (keywords.length === 0) return;

    setLoading(true);
    try {
      // Mock data for demonstration
      const mockVideos: VideoItem[] = [
        {
          id: "video1",
          title: "Government Waste Investigation",
          channelTitle: "News Channel",
          publishedAt: "2023-05-15T14:30:00Z",
          thumbnailUrl: "https://i.ytimg.com/vi/abc123/mqdefault.jpg",
          viewCount: "15,432",
          platform: "youtube",
          keywords: ["government", "waste"],
          selected: false,
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
          selected: false,
        },
        {
          id: "video3",
          title: "Government Efficiency Analysis",
          channelTitle: "Policy Center",
          publishedAt: "2023-05-05T16:45:00Z",
          thumbnailUrl: "https://i.ytimg.com/vi/ghi789/mqdefault.jpg",
          viewCount: "12,345",
          platform: "youtube",
          keywords: ["government", "efficiency"],
          selected: false,
        },
        {
          id: "rumble1",
          title: "Exposing Government Waste",
          channelTitle: "Independent Media",
          publishedAt: "2023-05-12T11:20:00Z",
          thumbnailUrl: "https://sp.rmbl.ws/s8/1/x/y/z/x/xyzxa.oqic.jpg",
          viewCount: "5,678",
          platform: "rumble",
          keywords: ["government", "waste", "expose"],
          selected: false,
        },
      ];

      setVideos(mockVideos);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle video selection
  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId],
    );
  };

  // Filter videos by search query
  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.channelTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">
        YouTube & Rumble Manager (Mock)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add new keyword"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              />
              <Button onClick={addKeyword}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {keyword}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => removeKeyword(keyword)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Video Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={fetchVideos} disabled={loading}>
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {keywords.length > 0 ? (
                <p>Click Refresh to fetch videos for: {keywords.join(", ")}</p>
              ) : (
                <p>Add keywords to search for videos</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="youtube">
        <TabsList className="mb-4">
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="rumble">Rumble</TabsTrigger>
          <TabsTrigger value="all">All Videos</TabsTrigger>
        </TabsList>

        {["youtube", "rumble", "all"].map((platform) => (
          <TabsContent key={platform} value={platform}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {platform === "all"
                      ? "All Videos"
                      : platform === "youtube"
                        ? "YouTube Videos"
                        : "Rumble Videos"}
                  </CardTitle>
                  {selectedVideos.length > 0 && (
                    <Button>Save {selectedVideos.length} Selected</Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Video</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Keywords</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVideos
                        .filter(
                          (video) =>
                            platform === "all" || video.platform === platform,
                        )
                        .map((video) => (
                          <TableRow key={video.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedVideos.includes(video.id)}
                                onCheckedChange={() =>
                                  toggleVideoSelection(video.id)
                                }
                              />
                            </TableCell>
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
                                <span className="font-medium">
                                  {video.title}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{video.channelTitle}</TableCell>
                            <TableCell>
                              {new Date(video.publishedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{video.viewCount || "N/A"}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {video.keywords.map((keyword) => (
                                  <Badge
                                    key={keyword}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {filteredVideos.filter(
                        (video) =>
                          platform === "all" || video.platform === platform,
                      ).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            No videos found. Try refreshing or adjusting your
                            search.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default MockYouTubeManager;
