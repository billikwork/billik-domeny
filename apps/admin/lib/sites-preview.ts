/** Single base URL for the sites Next.js app (all domains live on one deployment). */
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

/**
 * Fast hero preview — pre-compressed WebP from the sites CDN in production,
 * local resize API in development (no cross-origin round trip).
 */
export function getOptimizedHeroUrl(heroPath: string, siteId?: string) {
  if (process.env.NODE_ENV === "development" && siteId) {
    return `/api/hero?site=${siteId}&w=640`;
  }

  return `${getSitesPreviewBase()}${heroPath}`;
}