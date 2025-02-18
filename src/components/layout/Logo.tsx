import React from "react";

const Logo = () => {
  return (
    <img
      src="/dogecuts-logo.webp"
      alt="DOGEcuts.org"
      className="h-14 w-14 object-contain rounded-full"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src =
          "https://api.dicebear.com/7.x/shapes/svg?seed=dogecuts";
      }}
    />
  );
};

export default Logo;
