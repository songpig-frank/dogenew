import React from "react";
import TrendingSection from "./trending/TrendingSection";
import TopCommunityFeedback from "./trending/TopCommunityFeedback";
import AdBanner from "./ads/AdBanner";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface HomeProps {
  initialTheme?: "light" | "dark";
}

// Component to fetch and display in-content ads
const InContentAd = () => {
  const [ad, setAd] = React.useState<{
    id: string;
    adCode: string;
    imageUrl: string;
    linkUrl: string;
  } | null>(null);

  React.useEffect(() => {
    const fetchInContentAd = async () => {
      try {
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
        console.error("Error fetching in-content ad:", error);
      }
    };

    fetchInContentAd();
  }, []);

  if (!ad) return null;

  return (
    <AdBanner
      position="inline"
      adCode={ad.adCode}
      fallbackImage={
        ad.imageUrl ||
        "https://via.placeholder.com/728x90?text=Support+Our+Mission"
      }
      fallbackUrl={ad.linkUrl || "/donations"}
      className="my-8"
      onClick={() => {
        if (ad.id) {
          supabase.rpc("record_ad_click", { ad_id: ad.id });
        }
      }}
    />
  );
};

const Home = ({ initialTheme = "light" }: HomeProps) => {
  return (
    <div className="bg-background">
      {/* Main content */}
      <main>
        {/* Hero Section */}
        <section className="py-8 md:py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Welcome to DOGEcuts.org
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Help improve government efficiency by sharing your feedback,
            suggestions, and experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/submit">Submit Feedback</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </section>

        {/* In-content ad banner */}
        <InContentAd />

        {/* Top Community Feedback Section - consolidated in one place */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Top Community Feedback
          </h2>
          <TopCommunityFeedback />
        </section>

        {/* Trending Section with videos */}
        <TrendingSection />
      </main>
    </div>
  );
};

export default Home;
