import fs from "fs/promises";
import path from "path";
import { getAllSites } from "@billik/site-config";
import { contentFilePath, contentRepoPath, heroDirPath } from "./paths";
import { getRepoInfo } from "./github";

export type SiteListItem = {
  id: string;
  domain: string;
  h1: string;
  lastEdited: string | null;
};

async function getLocalLastEdited(siteId: string): Promise<Date | null> {
  const dates: Date[] = [];

  try {
    const stat = await fs.stat(contentFilePath(siteId));
    dates.push(stat.mtime);
  } catch {
    /* ignore */
  }

  try {
    const heroDir = heroDirPath(siteId);
    const files = await fs.readdir(heroDir);
    for (const file of files) {
      if (file.startsWith("hero.")) {
        const stat = await fs.stat(path.join(heroDir, file));
        dates.push(stat.mtime);
      }
    }
  } catch {
    /* ignore */
  }

  if (dates.length === 0) return null;
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

async function getGithubLastEdited(siteId: string): Promise<Date | null> {
  const { Octokit } = await import("@octokit/rest");
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const { owner, repo, branch } = getRepoInfo();
  const octokit = new Octokit({ auth: token });

  const paths = [
    contentRepoPath(siteId),
    `apps/sites/public/heroes/${siteId}`,
  ];

  const dates: Date[] = [];

  for (const filePath of paths) {
    try {
      const { data } = await octokit.repos.listCommits({
        owner,
        repo,
        sha: branch,
        path: filePath,
        per_page: 1,
      });
      const date = data[0]?.commit?.committer?.date;
      if (date) dates.push(new Date(date));
    } catch {
      /* ignore */
    }
  }

  if (dates.length === 0) return null;
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

async function getLastEdited(siteId: string): Promise<string | null> {
  const date = process.env.GITHUB_TOKEN
    ? await getGithubLastEdited(siteId)
    : await getLocalLastEdited(siteId);
  return date ? date.toISOString() : null;
}

export async function getSitesForDashboard(): Promise<SiteListItem[]> {
  const sites = getAllSites();
  const items = await Promise.all(
    sites.map(async (site) => ({
      id: site.id,
      domain: site.domain,
      h1: site.h1,
      lastEdited: await getLastEdited(site.id),
    })),
  );
  return items;
}