import React from "react";
import Navbar from "./layout/Navbar";
import TrendingSection from "./trending/TrendingSection";
import { useTheme } from "@/lib/utils";

interface HomeProps {
  initialTheme?: "light" | "dark";
}

const Home = ({ initialTheme = "light" }: HomeProps) => {
  const [isDarkMode, setIsDarkMode] = React.useState(initialTheme === "dark");

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // In a real implementation, this would update the theme in your theme provider
  };

  const handleDonateClick = () => {
    // Implement donation logic or navigation
    console.log("Donate clicked");
  };

  return (
    <div className="bg-background">
      {/* Main content */}
      <main className="pt-16">
        {" "}
        {/* Add padding-top to account for fixed navbar */}
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <section className="py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Welcome to DOGEcuts.org
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Help improve government efficiency by sharing your feedback,
              suggestions, and experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/submit"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Submit Feedback
              </a>
              <a
                href="/about"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Learn More
              </a>
            </div>
          </section>

          {/* Trending Section */}
          <TrendingSection />
        </div>
      </main>
    </div>
  );
};

export default Home;
