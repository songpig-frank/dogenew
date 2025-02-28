import React from "react";
import { cn } from "@/lib/utils";

export interface AdBannerProps {
  className?: string;
  position: "top" | "bottom" | "inline";
  adCode?: string;
  fallbackImage?: string;
  fallbackUrl?: string;
  width?: string;
  height?: string;
  onClick?: () => void;
}

const AdBanner = ({
  className,
  position,
  adCode,
  fallbackImage = "https://via.placeholder.com/728x90?text=Advertisement",
  fallbackUrl = "#",
  width = "100%",
  height = "auto",
}: AdBannerProps) => {
  // If we have ad code (like from Google AdSense), render it
  if (adCode) {
    return (
      <div
        className={cn(
          "ad-container overflow-hidden text-center bg-muted/30",
          position === "top" && "mb-6",
          position === "bottom" && "mt-6",
          position === "inline" && "my-6",
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
        "ad-container overflow-hidden text-center bg-muted/30 rounded-md",
        position === "top" && "mb-6",
        position === "bottom" && "mt-6",
        position === "inline" && "my-6",
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

export default AdBanner;
