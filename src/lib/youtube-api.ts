import { supabase } from "./supabase";

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

type VideoItem = YouTubeVideo | RumbleVideo;

// Fetch videos from YouTube API based on keywords
export const fetchYouTubeVideos = async (
  keywords: string[],
  maxResults = 10,
): Promise<YouTubeVideo[]> => {
  try {
    if (!import.meta.env.VITE_YOUTUBE_API_KEY) {
      console.error("YouTube API key is missing");
      return [];
    }

    const query = keywords.join("+");
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=${maxResults}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`,
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    // Get video IDs for fetching view counts
    const videoIds = data.items.map((item: any) => item.id.videoId).join(",");

    // Fetch video statistics to get view counts
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`,
    );

    if (!statsResponse.ok) {
      throw new Error(`YouTube Stats API error: ${statsResponse.status}`);
    }

    const statsData = await statsResponse.json();

    // Create a map of video ID to view count
    const viewCountMap: Record<string, string> = {};
    statsData.items.forEach((item: any) => {
      viewCountMap[item.id] = item.statistics.viewCount;
    });

    // Map the response to our VideoItem format
    return data.items.map((item: any) => {
      const videoId = item.id.videoId;
      return {
        id: videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        viewCount: viewCountMap[videoId]
          ? parseInt(viewCountMap[videoId]).toLocaleString()
          : "0",
        platform: "youtube" as const,
        keywords: keywords.filter(
          (k) =>
            item.snippet.title.toLowerCase().includes(k.toLowerCase()) ||
            item.snippet.description.toLowerCase().includes(k.toLowerCase()),
        ),
      };
    });
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return [];
  }
};

// Save videos to database
export const saveVideosToDatabase = async (
  videos: VideoItem[],
): Promise<boolean> => {
  try {
    const { error } = await supabase.from("featured_videos").insert(
      videos.map((video) => ({
        video_id: video.id,
        title: video.title,
        channel_title: video.channelTitle,
        published_at: video.publishedAt,
        thumbnail_url: video.thumbnailUrl,
        view_count: video.viewCount,
        platform: video.platform,
        keywords: video.keywords,
      })),
    );

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error saving videos to database:", error);
    return false;
  }
};

// Get featured videos from database
export const getFeaturedVideos = async (): Promise<VideoItem[]> => {
  try {
    const { data, error } = await supabase
      .from("featured_videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((item) => ({
      id: item.video_id,
      title: item.title,
      channelTitle: item.channel_title,
      publishedAt: item.published_at,
      thumbnailUrl: item.thumbnail_url,
      viewCount: item.view_count,
      platform: item.platform,
      keywords: item.keywords || [],
    }));
  } catch (error) {
    console.error("Error fetching featured videos:", error);
    return [];
  }
};

// Delete a featured video
export const deleteFeaturedVideo = async (
  videoId: string,
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("featured_videos")
      .delete()
      .eq("video_id", videoId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting featured video:", error);
    return false;
  }
};
