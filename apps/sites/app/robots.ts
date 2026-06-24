import type { MetadataRoute } from "next";
import { getCurrentSite, isPreviewDeployment } from "@/lib/get-site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (await isPreviewDeployment()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  const site = await getCurrentSite();
  if (!site) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `https://www.${site.domain}/sitemap.xml`,
  };
}