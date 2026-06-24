import { headers } from "next/headers";
import { getSiteByHost, getSiteById, type SiteConfig } from "@billik/site-config";

function contrastColor(hex: string) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return "#ffffff";
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#0a0a0b" : "#ffffff";
}

function faviconLetter(site: SiteConfig | null) {
  if (!site) return "B";
  return site.domain.charAt(0).toUpperCase();
}

export async function resolveSiteForFavicon(request?: Request): Promise<SiteConfig | null> {
  const headerStore = await headers();
  const siteId = headerStore.get("x-site-id");
  if (siteId) return getSiteById(siteId);

  const host = headerStore.get("host") ?? "";
  const fromHost = getSiteByHost(host);
  if (fromHost) return fromHost;

  if (request) {
    const previewSite = new URL(request.url).searchParams.get("site");
    if (previewSite) return getSiteById(previewSite);
  }

  return null;
}

export function buildFaviconSvg(site: SiteConfig | null, size = 32) {
  const bg = site?.accentColor ?? "#ffd700";
  const fg = contrastColor(bg);
  const letter = faviconLetter(site);
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.56);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" fill="none">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>
  <text x="${size / 2}" y="${size * 0.72}" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="${fontSize}" font-weight="700" fill="${fg}">${letter}</text>
</svg>`;
}

export function faviconCacheHeaders() {
  return {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
  };
}