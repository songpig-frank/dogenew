import React, { useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";
import { getFeaturedVideos } from "@/lib/youtube-api-direct";

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

interface VideoCarouselProps {
  videos?: VideoItem[];
}

const VideoCarousel = ({ videos: propVideos }: VideoCarouselProps) => {
  const [activeVideo, setActiveVideo] = React.useState<string | null>(null);
  const [videos, setVideos] = React.useState<VideoItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        // If videos were passed as props, use those
        if (propVideos && propVideos.length > 0) {
          setVideos(propVideos);
        } else {
          // Otherwise fetch from the database
          const featuredVideos = await getFeaturedVideos();
          console.log("Fetched featured videos for carousel:", featuredVideos);
          if (featuredVideos && featuredVideos.length > 0) {
            setVideos(featuredVideos);
          } else {
            // If no videos returned, use mock data
            console.log("No videos found in database, using mock data");
            setVideos([
              {
                id: "Z1JC0YlBy-s",
                title: "Government Waste Investigation Report",
                channelTitle: "News Channel",
                publishedAt: "2023-05-15T14:30:00Z",
                thumbnailUrl:
                  "https://i.ytimg.com/vi/Z1JC0YlBy-s/mqdefault.jpg",
                viewCount: "15,432",
                platform: "youtube",
                keywords: ["government", "waste"],
              },
              {
                id: "NlvB93cQ0bI",
                title: "Taxpayer Money Misuse Report",
                channelTitle: "Watchdog Group",
                publishedAt: "2023-05-10T09:15:00Z",
                thumbnailUrl:
                  "https://i.ytimg.com/vi/NlvB93cQ0bI/mqdefault.jpg",
                viewCount: "8,921",
                platform: "youtube",
                keywords: ["taxpayer", "government"],
              },
              {
                id: "GnrqTFEIR3M",
                title: "Government Efficiency Analysis",
                channelTitle: "Policy Center",
                publishedAt: "2023-05-05T16:45:00Z",
                thumbnailUrl:
                  "https://i.ytimg.com/vi/GnrqTFEIR3M/mqdefault.jpg",
                viewCount: "12,345",
                platform: "youtube",
                keywords: ["government", "efficiency"],
              },
            ]);
          }
        }
      } catch (error) {
        console.error("Error fetching videos for carousel:", error);
        // If we can't fetch videos, use mock data
        console.log("Error fetching videos, using mock data");
        setVideos([
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
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();

    // Set up an interval to refresh videos every 5 minutes
    const refreshInterval = setInterval(fetchVideos, 5 * 60 * 1000);

    // Clean up the interval when component unmounts
    return () => clearInterval(refreshInterval);
  }, [propVideos]);

  if (loading) {
    return (
      <div className="w-full bg-background p-6 text-center">
        Loading videos...
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="w-full bg-background p-6 text-center">
        <p className="text-muted-foreground">
          No videos available. Add videos from the Admin Dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-background p-6">
      {activeVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-4 rounded-lg w-full max-w-4xl mx-4">
            <div className="relative pt-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <button
              onClick={() => setActiveVideo(null)}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Carousel className="w-full max-w-5xl mx-auto">
        <CarouselContent>
          {videos.map((video) => (
            <CarouselItem key={video.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card>
                  <CardContent
                    className="flex aspect-video items-center justify-center p-0 relative group cursor-pointer"
                    onClick={() => setActiveVideo(video.id)}
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title || "Video thumbnail"}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/640x360/gray/white?text=No+Preview";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </CardContent>
                </Card>
                <h3 className="mt-2 text-sm font-medium text-foreground">
                  {video.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {video.channelTitle} • {video.viewCount || "0"} views
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default VideoCarousel;
