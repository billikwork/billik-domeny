/** Single base URL for the sites Next.js app (all 15 domains live on one deployment). */
export const DEFAULT_SITES_PREVIEW_URL = "https://billik-domeny-sites-ehy9.vercel.app";

export function getSitesPreviewBase() {
  if (process.env.NEXT_PUBLIC_SITES_PREVIEW_URL) {
    return process.env.NEXT_PUBLIC_SITES_PREVIEW_URL.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return DEFAULT_SITES_PREVIEW_URL;
}

/** Resized hero URL via the sites app's Next.js image optimizer (much faster than raw PNG). */
export function getOptimizedHeroUrl(heroPath: string, width = 720) {
  const base = getSitesPreviewBase();
  const params = new URLSearchParams({ url: heroPath, w: String(width), q: "75" });
  return `${base}/_next/image?${params.toString()}`;
}