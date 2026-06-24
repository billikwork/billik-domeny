import path from "path";
import type { SiteConfig } from "@billik/site-config";

export function getRepoRoot() {
  return path.join(process.cwd(), "../..");
}

export function contentFilePath(siteId: string) {
  return path.join(getRepoRoot(), "content", "sites", `${siteId}.json`);
}

export function heroDirPath(siteId: string) {
  return path.join(getRepoRoot(), "apps", "sites", "public", "heroes", siteId);
}

export function heroRepoPath(siteId: string, filename = "hero.png") {
  return `apps/sites/public/heroes/${siteId}/${filename}`;
}

export function contentRepoPath(siteId: string) {
  return `content/sites/${siteId}.json`;
}

export function heroPublicPath(site: SiteConfig) {
  return site.heroImage;
}