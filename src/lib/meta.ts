export const updateMetaTags = ({
  title,
  description,
  image,
  url,
}: {
  title: string;
  description: string;
  image?: string;
  url: string;
}) => {
  // Update standard meta tags
  document.title = title;
  const descriptionTag = document.querySelector('meta[name="description"]');
  if (descriptionTag) {
    descriptionTag.setAttribute("content", description);
  }

  // Update Open Graph meta tags
  const metaTags = {
    "og:title": title,
    "og:description": description,
    "og:url": url,
    "og:image": image || "https://dogecuts.org/dogecuts-logo.webp",
    "og:type": "article",
    "twitter:card": "summary_large_image",
    "twitter:title": title,
    "twitter:description": description,
    "twitter:image": image || "https://dogecuts.org/dogecuts-logo.webp",
  };

  Object.entries(metaTags).forEach(([property, content]) => {
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("property", property);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  });
};
