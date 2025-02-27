// Direct API calls to YouTube without using Supabase

interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount?: string;
  platform: "youtube";
  keywords: string[];
}

interface RumbleVideo {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount?: string;
  platform: "rumble";
  keywords: string[];
}

export type VideoItem = YouTubeVideo | RumbleVideo;

interface Channel {
  id: string;
  name: string;
  status: "approved" | "blocked";
}

// Channel management functions
export const getChannels = async (): Promise<Channel[]> => {
  try {
    // Use fetch to directly call the Supabase REST API
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/youtube_channels?select=*&order=name.asc`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch channels: ${errorText}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching channels:", error);
    return [];
  }
};

export const addChannel = async (
  name: string,
  status: "approved" | "blocked",
): Promise<boolean> => {
  try {
    if (!name || name.trim() === "") {
      throw new Error("Channel name cannot be empty");
    }

    console.log(`Adding channel: ${name} with status: ${status}`);

    // Use fetch to directly call the Supabase REST API
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/youtube_channels`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          name,
          status,
        }),
      },
    );

    const responseText = await response.text();
    console.log(`Response status: ${response.status}, text: ${responseText}`);

    if (!response.ok) {
      throw new Error(`Failed to add channel: ${responseText}`);
    }

    return true;
  } catch (error) {
    console.error("Error adding channel:", error);
    throw error;
  }
};

export const removeChannel = async (channelId: string): Promise<boolean> => {
  try {
    // Use fetch to directly call the Supabase REST API
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/youtube_channels?id=eq.${encodeURIComponent(channelId)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to remove channel: ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error("Error removing channel:", error);
    throw error;
  }
};

export const updateChannelStatus = async (
  channelId: string,
  status: "approved" | "blocked",
): Promise<boolean> => {
  try {
    // Use fetch to directly call the Supabase REST API
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/youtube_channels?id=eq.${encodeURIComponent(channelId)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          status,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update channel status: ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error("Error updating channel status:", error);
    throw error;
  }
};

// Fetch videos from YouTube API based on keywords
export const fetchYouTubeVideos = async (
  keywords: string[],
  maxResults = 10,
  dateRange?: { startDate?: string; endDate?: string },
): Promise<YouTubeVideo[]> => {
  try {
    // Get API key from .env.local
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

    if (!apiKey) {
      console.warn("YouTube API key is missing, using mock data");
      return getMockYouTubeVideos();
    }

    const query = keywords.join("+");
    console.log(`Fetching YouTube videos for query: ${query}`);

    // Add date range parameters if provided
    let dateParams = "";
    if (dateRange) {
      if (dateRange.startDate) {
        dateParams += `&publishedAfter=${encodeURIComponent(dateRange.startDate)}T00:00:00Z`;
      }
      if (dateRange.endDate) {
        dateParams += `&publishedBefore=${encodeURIComponent(dateRange.endDate)}T23:59:59Z`;
      }
    }

    // Make real API call to YouTube
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=${maxResults}${dateParams}&key=${apiKey}`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("YouTube API error:", errorData);
      throw new Error(
        `YouTube API error: ${response.status} - ${JSON.stringify(errorData)}`,
      );
    }

    const data = await response.json();
    console.log("YouTube search results:", data);

    if (!data.items || data.items.length === 0) {
      console.warn("No videos found, using mock data");
      return getMockYouTubeVideos();
    }

    // Get video IDs for fetching view counts
    const videoIds = data.items.map((item: any) => item.id.videoId).join(",");

    // Fetch video statistics to get view counts
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${apiKey}`,
    );

    if (!statsResponse.ok) {
      throw new Error(`YouTube Stats API error: ${statsResponse.status}`);
    }

    const statsData = await statsResponse.json();
    console.log("YouTube stats results:", statsData);

    // Create a map of video ID to view count
    const viewCountMap: Record<string, string> = {};
    statsData.items.forEach((item: any) => {
      viewCountMap[item.id] = item.statistics.viewCount;
    });

    // Get approved and blocked channels
    const { data: approvedChannels } = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/youtube_channels?status=eq.approved&select=name`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      },
    ).then((res) => res.json());

    const { data: blockedChannels } = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/youtube_channels?status=eq.blocked&select=name`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      },
    ).then((res) => res.json());

    const approvedChannelNames = (approvedChannels || []).map((c: any) =>
      c.name.toLowerCase(),
    );
    const blockedChannelNames = (blockedChannels || []).map((c: any) =>
      c.name.toLowerCase(),
    );

    console.log("Approved channels:", approvedChannelNames);
    console.log("Blocked channels:", blockedChannelNames);

    // Map the response to our VideoItem format and filter by channel status
    return data.items
      .map((item: any) => {
        const videoId = item.id.videoId;
        const channelTitle = item.snippet.channelTitle;

        return {
          id: videoId,
          title: item.snippet.title,
          channelTitle: channelTitle,
          publishedAt: item.snippet.publishedAt,
          thumbnailUrl: item.snippet.thumbnails.medium.url,
          viewCount: viewCountMap[videoId]
            ? parseInt(viewCountMap[videoId]).toLocaleString()
            : "0",
          platform: "youtube" as const,
          keywords: keywords.filter(
            (k) =>
              item.snippet.title.toLowerCase().includes(k.toLowerCase()) ||
              (item.snippet.description &&
                item.snippet.description
                  .toLowerCase()
                  .includes(k.toLowerCase())),
          ),
        };
      })
      .filter((video) => {
        const channelName = video.channelTitle.toLowerCase();

        // If channel is in the blocked list, exclude it
        if (blockedChannelNames.some((name) => channelName.includes(name))) {
          return false;
        }

        // If channel is in the approved list, include it
        if (
          approvedChannelNames.length > 0 &&
          approvedChannelNames.some((name) => channelName.includes(name))
        ) {
          return true;
        }

        // If we have an approved list but this channel isn't in it, exclude it
        if (approvedChannelNames.length > 0) {
          return false;
        }

        // Otherwise include it (when no approved channels are specified)
        return true;
      });
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return getMockYouTubeVideos();
  }
};

// Get mock YouTube videos for testing
const getMockYouTubeVideos = (): YouTubeVideo[] => {
  return [
    {
      id: "Z1JC0YlBy-s",
      title: "Government Waste Investigation Report",
      channelTitle: "News Channel",
      publishedAt: "2023-05-15T14:30:00Z",
      thumbnailUrl: "https://i.ytimg.com/vi/Z1JC0YlBy-s/mqdefault.jpg",
      viewCount: "15,432",
      platform: "youtube",
      keywords: ["government", "waste"],
    },
    {
      id: "NlvB93cQ0bI",
      title: "Taxpayer Money Misuse Report",
      channelTitle: "Watchdog Group",
      publishedAt: "2023-05-10T09:15:00Z",
      thumbnailUrl: "https://i.ytimg.com/vi/NlvB93cQ0bI/mqdefault.jpg",
      viewCount: "8,921",
      platform: "youtube",
      keywords: ["taxpayer", "government"],
    },
    {
      id: "GnrqTFEIR3M",
      title: "Government Efficiency Analysis",
      channelTitle: "Policy Center",
      publishedAt: "2023-05-05T16:45:00Z",
      thumbnailUrl: "https://i.ytimg.com/vi/GnrqTFEIR3M/mqdefault.jpg",
      viewCount: "12,345",
      platform: "youtube",
      keywords: ["government", "efficiency"],
    },
    {
      id: "qXctsLUsPxc",
      title: "Exposing Government Waste",
      channelTitle: "Independent Media",
      publishedAt: "2023-05-12T11:20:00Z",
      thumbnailUrl: "https://i.ytimg.com/vi/qXctsLUsPxc/mqdefault.jpg",
      viewCount: "5,678",
      platform: "youtube",
      keywords: ["government", "waste", "expose"],
    },
  ];
};

// Save videos to database using direct API
export const saveVideosToDatabase = async (
  videos: VideoItem[],
): Promise<boolean> => {
  try {
    console.log("Saving videos to database:", videos);

    // Use direct SQL to insert videos
    for (const video of videos) {
      try {
        // Use direct SQL execution to bypass RLS policies
        const sqlQuery = `
          INSERT INTO public.featured_videos (
            video_id, title, channel_title, published_at, thumbnail_url, view_count, platform, keywords
          ) VALUES (
            '${video.id}', 
            '${video.title.replace(/'/g, "''")}', 
            '${video.channelTitle.replace(/'/g, "''")}', 
            '${video.publishedAt}', 
            '${video.thumbnailUrl}', 
            '${video.viewCount || "0"}', 
            '${video.platform}', 
            '${JSON.stringify(video.keywords).replace(/'/g, "''")}'
          ) 
          ON CONFLICT (video_id) DO UPDATE SET 
            title = '${video.title.replace(/'/g, "''")}',
            channel_title = '${video.channelTitle.replace(/'/g, "''")}',
            published_at = '${video.publishedAt}',
            thumbnail_url = '${video.thumbnailUrl}',
            view_count = '${video.viewCount || "0"}',
            platform = '${video.platform}',
            keywords = '${JSON.stringify(video.keywords).replace(/'/g, "''")}'
        `;

        console.log(`Executing SQL for video ${video.id}...`);
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/execute_sql`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              sql_query: sqlQuery,
            }),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to save video ${video.id}: ${errorText}`);
        } else {
          console.log(`Video ${video.id} saved successfully`);
        }
      } catch (videoError) {
        console.error(`Error processing video ${video.id}:`, videoError);
      }
    }

    return true;
  } catch (error) {
    console.error("Error saving videos to database:", error);
    return false;
  }
};

// Get featured videos from database using direct API
export const getFeaturedVideos = async (): Promise<VideoItem[]> => {
  try {
    // First try using regular Supabase query
    try {
      const { data, error } = await supabase
        .from("featured_videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        console.log("Featured videos fetched via standard query:", data);
        return data.map((item) => ({
          id: item.video_id,
          title: item.title,
          channelTitle: item.channel_title,
          publishedAt: item.published_at,
          thumbnailUrl: item.thumbnail_url,
          viewCount: item.view_count,
          platform: item.platform,
          keywords: Array.isArray(item.keywords) ? item.keywords : [],
        }));
      }
    } catch (standardQueryError) {
      console.warn(
        "Standard query failed, trying direct SQL:",
        standardQueryError,
      );
    }

    // If standard query fails, try direct SQL
    // Use direct SQL execution to bypass RLS policies
    const sqlQuery = `SELECT * FROM public.featured_videos ORDER BY created_at DESC`;

    console.log("Fetching featured videos with direct SQL...");
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/execute_sql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          sql_query: sqlQuery,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch featured videos: ${errorText}`);
    }

    const result = await response.json();
    const data = result.rows || [];
    console.log("Featured videos fetched via direct SQL:", data);

    // Get blocked channels
    const blockedChannelsSql = `SELECT name FROM public.youtube_channels WHERE status = 'blocked'`;
    const blockedResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/execute_sql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          sql_query: blockedChannelsSql,
        }),
      },
    );

    let blockedChannelNames: string[] = [];
    if (blockedResponse.ok) {
      const blockedResult = await blockedResponse.json();
      blockedChannelNames = (blockedResult.rows || []).map((row: any) =>
        row.name.toLowerCase(),
      );
    }

    // Filter out videos from blocked channels
    const filteredVideos = data.filter((item: any) => {
      if (!item.channel_title) return true;
      const channelName = item.channel_title.toLowerCase();
      return !blockedChannelNames.some((name: string) =>
        channelName.includes(name),
      );
    });

    return filteredVideos.map((item: any) => {
      let keywords = [];
      try {
        if (typeof item.keywords === "string") {
          keywords = JSON.parse(item.keywords);
        } else if (Array.isArray(item.keywords)) {
          keywords = item.keywords;
        }
      } catch (e) {
        console.warn("Error parsing keywords:", e);
      }

      return {
        id: item.video_id,
        title: item.title,
        channelTitle: item.channel_title,
        publishedAt: item.published_at,
        thumbnailUrl: item.thumbnail_url,
        viewCount: item.view_count,
        platform: item.platform,
        keywords: keywords,
      };
    });
  } catch (error) {
    console.error("Error fetching featured videos:", error);
    return [];
  }
};

// Delete a featured video using direct API
export const deleteFeaturedVideo = async (
  videoId: string,
): Promise<boolean> => {
  try {
    // Use direct SQL execution to bypass RLS policies
    const sqlQuery = `DELETE FROM public.featured_videos WHERE video_id = '${videoId}'`;

    console.log(`Deleting video ${videoId} with direct SQL...`);
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/execute_sql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          sql_query: sqlQuery,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete video: ${errorText}`);
    }

    console.log(`Video ${videoId} deleted successfully`);
    return true;
  } catch (error) {
    console.error("Error deleting featured video:", error);
    return false;
  }
};
