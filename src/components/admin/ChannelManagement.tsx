import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Trash2, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Channel {
  id: string;
  name: string;
  status: "approved" | "blocked";
}

const ChannelManagement = () => {
  const [approvedChannels, setApprovedChannels] = React.useState<Channel[]>([]);
  const [blockedChannels, setBlockedChannels] = React.useState<Channel[]>([]);
  const [newApprovedChannel, setNewApprovedChannel] = React.useState("");
  const [newBlockedChannel, setNewBlockedChannel] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Fetch channels from database
  const fetchChannels = async () => {
    try {
      setLoading(true);
      // Use direct API to fetch channels
      const { getChannels } = await import("@/lib/youtube-api-direct");
      const channels = await getChannels();

      setApprovedChannels(channels.filter((c) => c.status === "approved"));
      setBlockedChannels(channels.filter((c) => c.status === "blocked"));
    } catch (error) {
      console.error("Error fetching channels:", error);
    } finally {
      setLoading(false);
    }
  };

  // Extract channel ID or name from URL or text input
  const extractChannelInfo = (input: string): string => {
    try {
      // Check if it's a URL
      if (input.includes("youtube.com") || input.includes("youtu.be")) {
        // Handle youtube.com/channel/CHANNEL_ID format
        if (input.includes("/channel/")) {
          const channelId = input
            .split("/channel/")[1]
            ?.split("/")[0]
            ?.split("?")[0];
          if (channelId) return channelId;
        }

        // Handle youtube.com/c/CHANNEL_NAME format
        if (input.includes("/c/")) {
          const channelName = input
            .split("/c/")[1]
            ?.split("/")[0]
            ?.split("?")[0];
          if (channelName) return channelName;
        }

        // Handle youtube.com/@USERNAME format
        if (input.includes("/@")) {
          const username = input.split("/@")[1]?.split("/")[0]?.split("?")[0];
          if (username) return username;
        }

        // Handle youtube.com/user/USERNAME format
        if (input.includes("/user/")) {
          const username = input
            .split("/user/")[1]
            ?.split("/")[0]
            ?.split("?")[0];
          if (username) return username;
        }

        // Try to extract channel name from URL path segments
        try {
          const url = new URL(input);
          const pathSegments = url.pathname.split("/").filter(Boolean);

          // If we have path segments and couldn't extract by other means, use the last segment
          if (pathSegments.length > 0) {
            return pathSegments[pathSegments.length - 1];
          }
        } catch (urlError) {
          console.error("Error parsing URL:", urlError);
        }
      }

      // If not a URL or couldn't extract, return the input as is
      return input.trim();
    } catch (error) {
      console.error("Error extracting channel info:", error);
      return input.trim(); // Return original input as fallback
    }
  };

  // Add new channel
  const addApprovedChannel = async () => {
    if (!newApprovedChannel.trim()) {
      alert("Please enter a channel name, ID, or URL");
      return;
    }

    try {
      // Extract channel ID or name from URL or text input
      const channelInfo = extractChannelInfo(newApprovedChannel);

      if (!channelInfo || channelInfo.trim() === "") {
        alert("Could not extract a valid channel name from the input");
        return;
      }

      // Use direct API to add channel
      const { addChannel } = await import("@/lib/youtube-api-direct");
      await addChannel(channelInfo, "approved");

      setNewApprovedChannel("");
      fetchChannels();
    } catch (error) {
      console.error(`Error adding approved channel:`, error);
      alert(`Error adding channel: ${error.message || String(error)}`);
    }
  };

  // Add new blocked channel
  const addBlockedChannel = async () => {
    if (!newBlockedChannel.trim()) {
      alert("Please enter a channel name, ID, or URL");
      return;
    }

    try {
      // Extract channel ID or name from URL or text input
      const channelInfo = extractChannelInfo(newBlockedChannel);

      if (!channelInfo || channelInfo.trim() === "") {
        alert("Could not extract a valid channel name from the input");
        return;
      }

      // Use direct API to add channel
      const { addChannel } = await import("@/lib/youtube-api-direct");
      await addChannel(channelInfo, "blocked");

      setNewBlockedChannel("");
      fetchChannels();
    } catch (error) {
      console.error(`Error adding blocked channel:`, error);
      alert(`Error adding channel: ${error.message || String(error)}`);
    }
  };

  // Remove channel
  const removeChannel = async (channelId: string) => {
    try {
      // Use direct API to remove channel
      const { removeChannel } = await import("@/lib/youtube-api-direct");
      await removeChannel(channelId);

      fetchChannels();
    } catch (error) {
      console.error("Error removing channel:", error);
      alert(`Error removing channel: ${error.message || String(error)}`);
    }
  };

  // Toggle channel status
  const toggleChannelStatus = async (
    channelId: string,
    currentStatus: "approved" | "blocked",
  ) => {
    try {
      // Use direct API to update channel status
      const { updateChannelStatus } = await import("@/lib/youtube-api-direct");
      const newStatus = currentStatus === "approved" ? "blocked" : "approved";
      await updateChannelStatus(channelId, newStatus);

      fetchChannels();
    } catch (error) {
      console.error("Error updating channel status:", error);
      alert(`Error updating channel status: ${error.message || String(error)}`);
    }
  };

  // Filter channels by search query
  const filteredApprovedChannels = approvedChannels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredBlockedChannels = blockedChannels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  React.useEffect(() => {
    fetchChannels();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Channel Management</h1>
      <p className="text-muted-foreground mb-6">
        Manage which YouTube channels are approved or blocked for featuring
        videos.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Approved Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Channel name, ID, or URL"
                value={newApprovedChannel}
                onChange={(e) => setNewApprovedChannel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addApprovedChannel()}
              />
              <div className="text-xs text-muted-foreground">
                Enter a channel name, ID, or paste a YouTube URL (e.g.,
                https://youtube.com/c/channelname or
                https://youtube.com/@username)
              </div>
              <Button onClick={addApprovedChannel}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Blocked Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Channel name, ID, or URL"
                value={newBlockedChannel}
                onChange={(e) => setNewBlockedChannel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addBlockedChannel()}
              />
              <div className="text-xs text-muted-foreground">
                Enter a channel name, ID, or paste a YouTube URL (e.g.,
                https://youtube.com/c/channelname or
                https://youtube.com/@username)
              </div>
              <Button onClick={addBlockedChannel} variant="destructive">
                <Plus className="h-4 w-4 mr-2" />
                Block
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="approved">
        <TabsList className="mb-4">
          <TabsTrigger value="approved">Approved Channels</TabsTrigger>
          <TabsTrigger value="blocked">Blocked Channels</TabsTrigger>
        </TabsList>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Approved Channels</CardTitle>
                <Button
                  variant="outline"
                  onClick={fetchChannels}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredApprovedChannels.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  No approved channels found.
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Channel Name</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApprovedChannels.map((channel) => (
                        <TableRow key={channel.id}>
                          <TableCell>{channel.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  toggleChannelStatus(channel.id, "approved")
                                }
                              >
                                Block
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => removeChannel(channel.id)}
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
        </TabsContent>

        <TabsContent value="blocked">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Blocked Channels</CardTitle>
                <Button
                  variant="outline"
                  onClick={fetchChannels}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredBlockedChannels.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  No blocked channels found.
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Channel Name</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBlockedChannels.map((channel) => (
                        <TableRow key={channel.id}>
                          <TableCell>{channel.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  toggleChannelStatus(channel.id, "blocked")
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => removeChannel(channel.id)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChannelManagement;
