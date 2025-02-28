import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import AdBanner from "../ads/AdBanner";
import SidebarAd from "../ads/SidebarAd";
import { supabase } from "@/lib/supabase";

const MainLayout = () => {
  const [topAd, setTopAd] = React.useState({
    active: true,
    imageUrl: "https://via.placeholder.com/728x90?text=Top+Banner+Ad",
    linkUrl: "https://example.com/affiliate",
    adCode: "",
    id: "",
  });

  const [sidebarAd, setSidebarAd] = React.useState({
    active: true,
    imageUrl: "https://via.placeholder.com/300x600?text=Sidebar+Ad",
    linkUrl: "https://example.com/affiliate",
    adCode: "",
    id: "",
  });

  const [bottomAd, setBottomAd] = React.useState({
    active: true,
    imageUrl: "https://via.placeholder.com/728x90?text=Bottom+Banner+Ad",
    linkUrl: "https://example.com/affiliate",
    adCode: "",
    id: "",
  });

  // Fetch ads from Supabase
  React.useEffect(() => {
    const fetchAds = async () => {
      try {
        // Fetch top banner ad
        const { data: topBannerData, error: topBannerError } = await supabase
          .from("ads")
          .select("*")
          .eq("type", "banner")
          .eq("position", "top")
          .eq("active", true)
          .limit(1)
          .single();

        if (!topBannerError && topBannerData) {
          setTopAd({
            active: true,
            imageUrl: topBannerData.image_url || "",
            linkUrl: topBannerData.link_url || "",
            adCode: topBannerData.ad_code || "",
            id: topBannerData.id,
          });

          // Record impression
          await supabase.rpc("record_ad_impression", {
            ad_id: topBannerData.id,
          });
        }

        // Fetch sidebar ad
        const { data: sidebarData, error: sidebarError } = await supabase
          .from("ads")
          .select("*")
          .eq("type", "sidebar")
          .eq("active", true)
          .limit(1)
          .single();

        if (!sidebarError && sidebarData) {
          setSidebarAd({
            active: true,
            imageUrl: sidebarData.image_url || "",
            linkUrl: sidebarData.link_url || "",
            adCode: sidebarData.ad_code || "",
            id: sidebarData.id,
          });

          // Record impression
          await supabase.rpc("record_ad_impression", { ad_id: sidebarData.id });
        }

        // Fetch bottom banner ad
        const { data: bottomBannerData, error: bottomBannerError } =
          await supabase
            .from("ads")
            .select("*")
            .eq("type", "banner")
            .eq("position", "bottom")
            .eq("active", true)
            .limit(1)
            .single();

        if (!bottomBannerError && bottomBannerData) {
          setBottomAd({
            active: true,
            imageUrl: bottomBannerData.image_url || "",
            linkUrl: bottomBannerData.link_url || "",
            adCode: bottomBannerData.ad_code || "",
            id: bottomBannerData.id,
          });

          // Record impression
          await supabase.rpc("record_ad_impression", {
            ad_id: bottomBannerData.id,
          });
        }
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };

    fetchAds();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Top ad banner */}
      {topAd.active && (
        <div className="container mx-auto px-4 mt-4">
          <AdBanner
            position="top"
            adCode={topAd.adCode}
            fallbackImage={topAd.imageUrl}
            fallbackUrl={topAd.linkUrl}
            width="100%"
            height="90px"
            onClick={() => {
              if (topAd.id) {
                supabase.rpc("record_ad_click", { ad_id: topAd.id });
              }
            }}
          />
        </div>
      )}

      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1">
            <Outlet />
          </div>

          {/* Sidebar ad */}
          {sidebarAd.active && (
            <div className="w-full lg:w-[300px] mt-6 lg:mt-0">
              <SidebarAd
                adCode={sidebarAd.adCode}
                fallbackImage={sidebarAd.imageUrl}
                fallbackUrl={sidebarAd.linkUrl}
                width="100%"
                height="600px"
                onClick={() => {
                  if (sidebarAd.id) {
                    supabase.rpc("record_ad_click", { ad_id: sidebarAd.id });
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom ad banner */}
      {bottomAd.active && (
        <div className="container mx-auto px-4 mb-4">
          <AdBanner
            position="bottom"
            adCode={bottomAd.adCode}
            fallbackImage={bottomAd.imageUrl}
            fallbackUrl={bottomAd.linkUrl}
            width="100%"
            height="90px"
            onClick={() => {
              if (bottomAd.id) {
                supabase.rpc("record_ad_click", { ad_id: bottomAd.id });
              }
            }}
          />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MainLayout;
