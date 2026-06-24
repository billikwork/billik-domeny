import { Octokit } from "@octokit/rest";
import fs from "fs/promises";
import path from "path";
import type { SiteConfig } from "@billik/site-config";
import { contentFilePath, contentRepoPath, heroDirPath, heroRepoPath } from "./paths";

function githubEnabled() {
  return Boolean(process.env.GITHUB_TOKEN);
}

function getOctokit() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not configured");
  return new Octokit({ auth: token });
}

function repoConfig() {
  return {
    owner: process.env.GITHUB_OWNER || "billikwork",
    repo: process.env.GITHUB_REPO || "billik-domeny",
    branch: process.env.GITHUB_BRANCH || "main",
  };
}

async function getGithubFileSha(filePath: string) {
  const octokit = getOctokit();
  const { owner, repo, branch } = repoConfig();
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path: filePath, ref: branch });
    if (Array.isArray(data) || data.type !== "file") return undefined;
    return data.sha;
  } catch {
    return undefined;
  }
}

async function upsertGithubFile(filePath: string, contentBase64: string, message: string) {
  const octokit = getOctokit();
  const { owner, repo, branch } = repoConfig();
  const sha = await getGithubFileSha(filePath);

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    branch,
    path: filePath,
    message,
    content: contentBase64,
    sha,
  });
}

export async function readSiteConfig(siteId: string): Promise<SiteConfig> {
  if (githubEnabled()) {
    const octokit = getOctokit();
    const { owner, repo, branch } = repoConfig();
    const filePath = contentRepoPath(siteId);
    const { data } = await octokit.repos.getContent({ owner, repo, path: filePath, ref: branch });
    if (Array.isArray(data) || data.type !== "file") {
      throw new Error(`Site config not found: ${siteId}`);
    }
    return JSON.parse(Buffer.from(data.content, "base64").toString("utf8")) as SiteConfig;
  }

  const raw = await fs.readFile(contentFilePath(siteId), "utf8");
  return JSON.parse(raw) as SiteConfig;
}

export async function writeSiteConfig(site: SiteConfig) {
  const pretty = `${JSON.stringify(site, null, 2)}\n`;

  if (githubEnabled()) {
    await upsertGithubFile(
      contentRepoPath(site.id),
      Buffer.from(pretty, "utf8").toString("base64"),
      `admin: update content for ${site.domain}`,
    );
    return { mode: "github" as const };
  }

  await fs.writeFile(contentFilePath(site.id), pretty, "utf8");
  return { mode: "local" as const };
}

export async function writeHeroImage(siteId: string, buffer: Buffer, extension: string) {
  const filename = extension === "jpeg" || extension === "jpg" ? "hero.jpeg" : "hero.png";
  const repoPath = heroRepoPath(siteId, filename);

  if (githubEnabled()) {
    await upsertGithubFile(
      repoPath,
      buffer.toString("base64"),
      `admin: update hero image for ${siteId}`,
    );
    return { mode: "github" as const, heroImage: `/heroes/${siteId}/${filename}` };
  }

  const dir = heroDirPath(siteId);
  await fs.mkdir(dir, { recursive: true });

  const files = await fs.readdir(dir).catch(() => [] as string[]);
  await Promise.all(
    files
      .filter((file) => file.startsWith("hero."))
      .map((file) => fs.unlink(path.join(dir, file))),
  );

  await fs.writeFile(path.join(dir, filename), buffer);
  return { mode: "local" as const, heroImage: `/heroes/${siteId}/${filename}` };
}

export function getPublishMode() {
  return githubEnabled() ? "github" : "local";
}

export function getRepoInfo() {
  const { owner, repo, branch } = repoConfig();
  return { owner, repo, branch, enabled: githubEnabled() };
}