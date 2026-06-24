import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSiteByHost, getSiteById } from "@billik/site-config";

function isPreviewHost(host: string) {
  const hostname = host.toLowerCase().split(":")[0];
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".vercel.app")
  );
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
    return attachSiteId(response, siteFromHost.id);
  }

  if (isPreviewHost(host)) {
    const previewSite = request.nextUrl.searchParams.get("site");
    if (previewSite) {
      const site = getSiteById(previewSite);
      if (site) {
        return attachSiteId(response, site.id);
      }
    }
    return response;
  }

  return new NextResponse("Domain not configured", { status: 404 });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|heroes/).*)"],
};