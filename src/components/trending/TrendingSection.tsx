import React from "react";
import VideoCarousel from "./VideoCarousel";
import AdBanner from "../ads/AdBanner";
import { supabase } from "@/lib/supabase";

interface TrendingSectionProps {
  title?: string;
  description?: string;
}

// Component to fetch and display trending section ads
const TrendingSectionAd = () => {
  const [ad, setAd] = React.useState<{
    id: string;
    adCode: string;
    imageUrl: string;
    linkUrl: string;
  } | null>(null);

  React.useEffect(() => {
    const fetchTrendingSectionAd = async () => {
      try {
        // Try to get a specific ad for trending section
        const { data, error } = await supabase
          .from("ads")
          .select("*")
          .eq("type", "inline")
          .eq("position", "content")
          .eq("active", true)
          .limit(1)
          .single();

        if (!error && data) {
          setAd({
            id: data.id,
            adCode: data.ad_code || "",
            imageUrl: data.image_url || "",
            linkUrl: data.link_url || "",
          });

          // Record impression
          await supabase.rpc("record_ad_impression", { ad_id: data.id });
        }
      } catch (error) {
        console.error("Error fetching trending section ad:", error);
      }
    };

    fetchTrendingSectionAd();
  }, []);

  if (!ad) return null;

  return (
    <AdBanner
      position="inline"
      adCode={ad.adCode}
      fallbackImage={
        ad.imageUrl ||
        "https://via.placeholder.com/728x90?text=Featured+Partner"
      }
      fallbackUrl={ad.linkUrl || "#"}
      className="my-8"
      onClick={() => {
        if (ad.id) {
          supabase.rpc("record_ad_click", { ad_id: ad.id });
        }
      }}
    />
  );
};

const TrendingSection = ({
  title = "Trending Updates",
  description = "Stay informed with the latest citizen feedback and media coverage about government efficiency",
}: TrendingSectionProps) => {
  return (
    <section className="w-full bg-muted/20 py-12 rounded-lg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-6 px-4">
            News & Media Coverage
          </h3>
          <VideoCarousel />
        </div>

        {/* Ad banner between content sections */}
        <TrendingSectionAd />
      </div>
    </section>
  );
};

export default TrendingSection;
