import type { MetadataRoute } from "next";
import { getCurrentSite, isPreviewDeployment } from "@/lib/get-site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (await isPreviewDeployment()) {
    return [];
  }

  const site = await getCurrentSite();
  if (!site) {
    return [];
  }

  return [
    {
      url: `https://www.${site.domain}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}