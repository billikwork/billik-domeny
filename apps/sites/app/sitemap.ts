import type { MetadataRoute } from "next";
import { getAllSites } from "@billik/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return getAllSites().map((site) => ({
    url: `https://www.${site.domain}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 1,
  }));
}