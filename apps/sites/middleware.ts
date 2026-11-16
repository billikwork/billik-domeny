import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSiteByHost, getSiteById, type SiteConfig } from "@billik/site-config";

function isPreviewHost(host: string) {
  const hostname = host.toLowerCase().split(":")[0];
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".vercel.app")
  );
}

// Paths a closed site still serves itself; everything else redirects to the notice on "/".
const CLOSED_SITE_PASSTHROUGH = new Set([
  "/",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/icon",
  "/apple-icon",
]);

function closedSiteResponse(request: NextRequest, site: SiteConfig, response: NextResponse) {
  if (site.closed && !CLOSED_SITE_PASSTHROUGH.has(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return attachSiteId(NextResponse.redirect(url, 308), site.id);
  }
  return attachSiteId(response, site.id);
}

function attachSiteId(response: NextResponse, siteId: string) {
  response.headers.set("x-site-id", siteId);
  return response;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "localhost:3000";
  const siteFromHost = getSiteByHost(host);
  const response = NextResponse.next();

  if (siteFromHost) {
    return closedSiteResponse(request, siteFromHost, response);
  }

  if (isPreviewHost(host)) {
    const previewSite = request.nextUrl.searchParams.get("site");
    if (previewSite) {
      const site = getSiteById(previewSite);
      if (site) {
        return closedSiteResponse(request, site, response);
      }
    }
    return response;
  }

  return new NextResponse("Domain not configured", { status: 404 });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|heroes/).*)"],
};