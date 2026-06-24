import { headers } from "next/headers";
import { getSiteByHost, getSiteById, type SiteConfig } from "@billik/site-config";

function isPreviewHost(host: string) {
  const hostname = host.toLowerCase().split(":")[0];
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".vercel.app")
  );
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

export async function isPreviewDeployment(): Promise<boolean> {
  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  return isPreviewHost(host);
}

export async function isLocalPreview(): Promise<boolean> {
  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  return isPreviewHost(host) && !headerStore.get("x-site-id");
}