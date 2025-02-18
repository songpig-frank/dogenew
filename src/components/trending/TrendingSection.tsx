import React from "react";
import VideoCarousel from "./VideoCarousel";
import TrendingGrid from "./TrendingGrid";

interface TrendingSectionProps {
  title?: string;
  description?: string;
}

const TrendingSection = ({
  title = "Trending Updates",
  description = "Stay informed with the latest citizen feedback and media coverage about government efficiency",
}: TrendingSectionProps) => {
  return (
    <section className="w-full bg-gray-50 dark:bg-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 px-4">
            News & Media Coverage
          </h3>
          <VideoCarousel />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 px-4">
            Top Community Feedback
          </h3>
          <TrendingGrid />
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
