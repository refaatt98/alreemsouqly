import { useEffect } from "react";

type SeoProps = {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  twitterCard?: string;
  robots?: string;
};

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Lightweight, reusable SEO helper. Replaces the per-route `head()` metadata
 * that TanStack Router used to manage. Sets document.title and a handful of
 * meta tags on mount / whenever the props change.
 */
export function Seo({
  title,
  description,
  ogTitle,
  ogDescription,
  ogType = "website",
  twitterCard = "summary_large_image",
  robots,
}: SeoProps) {
  useEffect(() => {
    document.title = title;
    if (description) setMeta("name", "description", description);
    setMeta("property", "og:title", ogTitle ?? title);
    if (ogDescription ?? description) {
      setMeta("property", "og:description", ogDescription ?? description ?? "");
    }
    setMeta("property", "og:type", ogType);
    setMeta("name", "twitter:card", twitterCard);
    if (robots) setMeta("name", "robots", robots);
  }, [title, description, ogTitle, ogDescription, ogType, twitterCard, robots]);

  return null;
}
