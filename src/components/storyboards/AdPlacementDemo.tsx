import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdBanner from "../ads/AdBanner";
import SidebarAd from "../ads/SidebarAd";

const AdPlacementDemo = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Ad Placement Demonstration</h1>

      {/* Top Banner Ad */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Top Banner Ad</h2>
        <AdBanner
          position="top"
          fallbackImage="https://via.placeholder.com/728x90?text=Top+Banner+Ad"
          fallbackUrl="#"
          width="100%"
          height="90px"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Main Content */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Main Content Area</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This is where your main content would appear.
              </p>
              <p className="mb-4">
                The sidebar ad appears to the right on desktop and below on
                mobile.
              </p>

              {/* In-Content Ad */}
              <div className="my-6">
                <h3 className="text-lg font-medium mb-2">In-Content Ad</h3>
                <AdBanner
                  position="inline"
                  fallbackImage="https://via.placeholder.com/728x90?text=In-Content+Ad"
                  fallbackUrl="#"
                  width="100%"
                  height="90px"
                />
              </div>

              <p className="mb-4">Content continues below the in-content ad.</p>
              <p>
                This layout is fully responsive and will adjust based on screen
                size.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Ad */}
        <div className="w-full lg:w-[300px]">
          <h3 className="text-lg font-medium mb-2">Sidebar Ad</h3>
          <SidebarAd
            fallbackImage="https://via.placeholder.com/300x600?text=Sidebar+Ad"
            fallbackUrl="#"
            width="100%"
            height="600px"
          />
        </div>
      </div>

      {/* Bottom Banner Ad */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Bottom Banner Ad</h2>
        <AdBanner
          position="bottom"
          fallbackImage="https://via.placeholder.com/728x90?text=Bottom+Banner+Ad"
          fallbackUrl="#"
          width="100%"
          height="90px"
        />
      </div>
    </div>
  );
};

export default AdPlacementDemo;
