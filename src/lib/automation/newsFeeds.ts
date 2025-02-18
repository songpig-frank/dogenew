import { supabase } from "../supabase";

interface NewsItem {
  title: string;
  description: string;
  youtubeId?: string;
  url: string;
  source: string;
}

const NEWS_KEYWORDS = [
  "government waste",
  "government spending",
  "government efficiency",
  "federal budget",
  "taxpayer money",
  "government accountability",
];

// Fetch from multiple news sources using RSS feeds
export const fetchNewsFeeds = async (): Promise<NewsItem[]> => {
  try {
    // Example RSS feeds - you'll need to add your preferred sources
    const feeds = [
      "https://www.youtube.com/feeds/videos.xml?channel_id=YOUR_CHANNEL_ID", // Government accountability channels
      "https://www.taxpayer.net/feed/", // Taxpayers for Common Sense
      "https://www.gao.gov/rss/reports-testimonies",
    ];

    // Fetch and parse RSS feeds
    const newsItems: NewsItem[] = [];

    // Store in Supabase for caching
    await supabase.from("news_items").insert(
      newsItems.map((item) => ({
        title: item.title,
        description: item.description,
        youtube_id: item.youtubeId,
        url: item.url,
        source: item.source,
      })),
    );

    return newsItems;
  } catch (error) {
    console.error("Error fetching news feeds:", error);
    return [];
  }
};

// Auto-moderate content using basic rules
export const autoModerateContent = async (
  content: string,
): Promise<boolean> => {
  // Basic moderation rules
  const profanityList = ["badword1", "badword2"]; // Add your list
  const hasProfanity = profanityList.some((word) =>
    content.toLowerCase().includes(word),
  );

  const isSpam =
    content.includes("http") && (content.match(/http/g) || []).length > 2;

  return !hasProfanity && !isSpam;
};

// Schedule news updates
export const scheduleNewsUpdates = () => {
  // Run every 6 hours
  setInterval(
    async () => {
      await fetchNewsFeeds();
    },
    6 * 60 * 60 * 1000,
  );
};
