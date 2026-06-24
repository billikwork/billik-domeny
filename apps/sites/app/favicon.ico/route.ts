import { buildFaviconSvg, faviconCacheHeaders, resolveSiteForFavicon } from "@/lib/favicon";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const site = await resolveSiteForFavicon(request);
  const svg = buildFaviconSvg(site, 32);

  return new Response(svg, { headers: faviconCacheHeaders() });
}