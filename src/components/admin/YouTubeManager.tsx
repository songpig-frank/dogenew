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
import { supabase } from "@/lib/supabase";

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

const YouTubeManager = () => {
  const [keywords, setKeywords] = React.useState<string[]>([]);
  const [newKeyword, setNewKeyword] = React.useState("");
  const [videos, setVideos] = React.useState<VideoItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedVideos, setSelectedVideos] = React.useState<string[]>([]);

  // Set default date range to last 7 days
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = React.useState(
    sevenDaysAgo.toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = React.useState(
    today.toISOString().split("T")[0],
  );

  // Fetch keywords from database
  const fetchKeywords = async () => {
    try {
      // Use direct DB access to bypass RLS policies
      const { directFetchKeywords } = await import("@/lib/direct-db");
      const result = await directFetchKeywords();

      if (result.success) {
        setKeywords(result.data?.map((k) => k.keyword) || []);
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error("Error fetching keywords:", error);
    }
  };

  // Add new keyword
  const addKeyword = async () => {
    if (!newKeyword.trim()) return;

    try {
      console.log("Adding keyword:", newKeyword.trim());

      // Use direct DB access to bypass RLS policies
      const { directAddKeyword } = await import("@/lib/direct-db");
      const result = await directAddKeyword(newKeyword.trim());

      if (!result.success) {
        throw result.error;
      }

      console.log("Keyword added:", result.data);
      setNewKeyword("");
      fetchKeywords();
    } catch (error) {
      console.error("Error adding keyword:", error);
      alert("Error adding keyword: " + (error.message || String(error)));
    }
  };

  // Remove keyword
  const removeKeyword = async (keyword: string) => {
    try {
      // Use direct DB access to bypass RLS policies
      const { directRemoveKeyword } = await import("@/lib/direct-db");
      const result = await directRemoveKeyword(keyword);

      if (!result.success) {
        throw result.error;
      }

      fetchKeywords();
    } catch (error) {
      console.error("Error removing keyword:", error);
      alert("Error removing keyword: " + (error.message || String(error)));
    }
  };

  // Fetch videos from YouTube API
  const fetchVideos = async () => {
    if (keywords.length === 0) return;

    setLoading(true);
    try {
      // Use the direct YouTube API function
      const { fetchYouTubeVideos } = await import("@/lib/youtube-api-direct");
      const dateRange = {};
      if (startDate) dateRange.startDate = startDate;
      if (endDate) dateRange.endDate = endDate;

      // Check for duplicate videos by ID
      const seenVideoIds = new Set<string>();
      const youtubeVideos = await fetchYouTubeVideos(keywords, 10, dateRange);

      // Filter out duplicate videos
      const uniqueVideos = youtubeVideos.filter((video) => {
        if (seenVideoIds.has(video.id)) {
          return false;
        }
        seenVideoIds.add(video.id);
        return true;
      });

      // Add selected property to each video
      const formattedVideos = uniqueVideos.map((video) => ({
        ...video,
        selected: false,
      }));

      setVideos(formattedVideos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      alert("Error fetching videos: " + (error.message || String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Save selected videos to database
  const saveSelectedVideos = async () => {
    try {
      const videosToSave = videos.filter((v) => selectedVideos.includes(v.id));

      if (videosToSave.length === 0) {
        alert("Please select at least one video to save");
        return;
      }

      // Use direct API to save videos
      const { saveVideosToDatabase } = await import("@/lib/youtube-api-direct");
      const success = await saveVideosToDatabase(videosToSave);

      if (!success) {
        throw new Error("Failed to save videos");
      }

      // Clear selection
      setSelectedVideos([]);
      alert(`${videosToSave.length} videos saved successfully!`);

      // Navigate to admin dashboard to see the videos
      window.location.href = "/admin";
    } catch (error) {
      console.error("Error saving videos:", error);
      alert("Error saving videos: " + (error.message || String(error)));
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

  React.useEffect(() => {
    fetchKeywords();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">YouTube & Rumble Manager</h1>

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
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {keywords.length > 0 ? (
                  <p>
                    Click Refresh to fetch videos for: {keywords.join(", ")}
                  </p>
                ) : (
                  <p>Add keywords to search for videos</p>
                )}
                {(startDate || endDate) && (
                  <p className="mt-1">
                    Date range: {startDate || "any"} to {endDate || "any"}
                  </p>
                )}
              </div>
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
                    <Button onClick={saveSelectedVideos}>
                      Save {selectedVideos.length} Selected
                    </Button>
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
                                onClick={() =>
                                  window.open(
                                    `https://www.youtube.com/watch?v=${video.id}`,
                                    "_blank",
                                  )
                                }
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

export default YouTubeManager;
