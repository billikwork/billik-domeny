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

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "localhost:3000";
  const siteFromHost = getSiteByHost(host);
  const response = NextResponse.next();

  if (siteFromHost) {
    response.headers.set("x-site-id", siteFromHost.id);
    return response;
  }

  if (isPreviewHost(host)) {
    const previewSite = request.nextUrl.searchParams.get("site");
    if (previewSite) {
      const site = getSiteById(previewSite);
      if (site) {
        response.headers.set("x-site-id", site.id);
      }
    }
    return response;
  }

  return new NextResponse("Domain not configured", { status: 404 });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|heroes).*)"],
};