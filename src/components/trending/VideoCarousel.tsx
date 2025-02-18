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

interface VideoItem {
  id: string;
  youtubeId: string;
}

interface VideoCarouselProps {
  videos?: VideoItem[];
}

const defaultVideos: VideoItem[] = [
  { id: "1", youtubeId: "Z1JC0YlBy-s" },
  { id: "2", youtubeId: "NlvB93cQ0bI" },
  { id: "3", youtubeId: "GnrqTFEIR3M" },
  { id: "4", youtubeId: "qXctsLUsPxc" },
];

const VideoCarousel = ({ videos = defaultVideos }: VideoCarouselProps) => {
  const [activeVideo, setActiveVideo] = React.useState<string | null>(null);
  const [videoTitles, setVideoTitles] = React.useState<Record<string, string>>({
    "Z1JC0YlBy-s": "Government Waste Investigation Report",
    NlvB93cQ0bI: "Citizen Watchdog Group Findings",
    GnrqTFEIR3M: "Analysis of Federal Spending",
    qXctsLUsPxc: "Government Efficiency News Coverage",
  });

  useEffect(() => {
    const fetchVideoTitles = async () => {
      const titles: Record<string, string> = {};
      for (const video of videos) {
        try {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${video.youtubeId}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`,
          );
          const data = await response.json();
          if (data.items?.[0]?.snippet?.title) {
            titles[video.youtubeId] = data.items[0].snippet.title;
          }
        } catch (error) {
          console.error(
            `Error fetching title for video ${video.youtubeId}:`,
            error,
          );
          // Keep the default title if API call fails
          titles[video.youtubeId] =
            videoTitles[video.youtubeId] ||
            `Government Update Video ${video.id}`;
        }
      }
      setVideoTitles((prev) => ({ ...prev, ...titles }));
    };

    if (import.meta.env.VITE_YOUTUBE_API_KEY) {
      fetchVideoTitles();
    }
  }, [videos]);

  const getThumbnailUrl = (youtubeId: string) => {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  };

  return (
    <div className="w-full bg-background p-6">
      {activeVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-4 rounded-lg w-full max-w-4xl mx-4">
            <div className="relative pt-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
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
                    onClick={() => setActiveVideo(video.youtubeId)}
                  >
                    <img
                      src={getThumbnailUrl(video.youtubeId)}
                      alt={videoTitles[video.youtubeId] || "Video thumbnail"}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </CardContent>
                </Card>
                <h3 className="mt-2 text-sm font-medium text-foreground">
                  {videoTitles[video.youtubeId]}
                </h3>
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
