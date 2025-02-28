import React from "react";
import { cn } from "@/lib/utils";

export interface SidebarAdProps {
  className?: string;
  adCode?: string;
  fallbackImage?: string;
  fallbackUrl?: string;
  width?: string;
  height?: string;
  onClick?: () => void;
}

const SidebarAd = ({
  className,
  adCode,
  fallbackImage = "https://via.placeholder.com/300x600?text=Advertisement",
  fallbackUrl = "#",
  width = "300px",
  height = "600px",
}: SidebarAdProps) => {
  // If we have ad code (like from Google AdSense), render it
  if (adCode) {
    return (
      <div
        className={cn(
          "ad-container overflow-hidden text-center bg-muted/30 rounded-md sticky top-20",
          className,
        )}
        style={{ width, height }}
      >
        <div dangerouslySetInnerHTML={{ __html: adCode }} />
      </div>
    );
  }

  // Otherwise, render a fallback ad (could be an affiliate link)
  return (
    <div
      className={cn(
        "ad-container overflow-hidden text-center bg-muted/30 rounded-md sticky top-20",
        className,
      )}
    >
      <a
        href={fallbackUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        onClick={(e) => {
          if (onClick) {
            onClick();
          }
        }}
      >
        <img
          src={fallbackImage}
          alt="Advertisement"
          className="max-w-full h-auto"
          style={{ width, height }}
        />
      </a>
      <div className="text-xs text-muted-foreground py-1">Advertisement</div>
    </div>
  );
};

export default SidebarAd;
