import { headers } from "next/headers";
import { getSiteByHost, getSiteById, type SiteConfig } from "@billik/site-config";

function isLocalhost(host: string) {
  const hostname = host.toLowerCase().split(":")[0];
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export async function getCurrentSite(): Promise<SiteConfig | null> {
  const headerStore = await headers();
  const siteId = headerStore.get("x-site-id");

  if (siteId) {
    return getSiteById(siteId);
  }

  const host = headerStore.get("host") ?? "localhost:3000";
  return getSiteByHost(host);
}

export async function isLocalPreview(): Promise<boolean> {
  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  return isLocalhost(host) && !headerStore.get("x-site-id");
}