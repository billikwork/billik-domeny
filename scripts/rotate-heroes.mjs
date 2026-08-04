#!/usr/bin/env node
// Advance every domain to the next image in its playlist.
//
//   node scripts/rotate-heroes.mjs            # rotate and write
//   node scripts/rotate-heroes.mjs --dry-run  # show what would change, touch nothing
//
// Hero files are written with a content-hashed name (hero-<hash>.webp) because
// apps/sites/next.config.ts serves /heroes/* as `immutable` for a year. A stable filename
// would leave returning visitors on a stale image; a new filename invalidates instantly.

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
const LIBRARY_DIR = path.join(ROOT, "library");
const IMAGES_DIR = path.join(LIBRARY_DIR, "images");
const PLAYLISTS_PATH = path.join(LIBRARY_DIR, "playlists.json");
const CATALOG_PATH = path.join(LIBRARY_DIR, "catalog.json");
const SUMMARY_PATH = path.join(LIBRARY_DIR, "last-rotation.json");
const HEROES_DIR = path.join(ROOT, "apps/sites/public/heroes");
const CONTENT_DIR = path.join(ROOT, "content/sites");

const dryRun = process.argv.includes("--dry-run");

const readJson = async (p) => JSON.parse(await fs.readFile(p, "utf8"));
const writeJson = async (p, value) => fs.writeFile(p, `${JSON.stringify(value, null, 2)}\n`, "utf8");

function today() {
  // GitHub Actions runs in UTC; the date only labels the screenshot folder.
  return new Date().toISOString().slice(0, 10);
}

async function main() {
  const playlists = await readJson(PLAYLISTS_PATH);
  const catalog = await readJson(CATALOG_PATH);
  const byFile = new Map(catalog.map((entry) => [entry.file, entry]));

  const siteIds = Object.keys(playlists.sites).sort();
  const summary = { date: today(), sites: [] };
  const problems = [];

  for (const siteId of siteIds) {
    const entry = playlists.sites[siteId];

    if (!Array.isArray(entry.images) || entry.images.length === 0) {
      problems.push(`${siteId}: playlist is empty`);
      continue;
    }

    const contentPath = path.join(CONTENT_DIR, `${siteId}.json`);
    let site;
    try {
      site = await readJson(contentPath);
    } catch {
      problems.push(`${siteId}: no content/sites/${siteId}.json`);
      continue;
    }

    const nextIndex = (entry.index + 1) % entry.images.length;
    const imageName = entry.images[nextIndex];
    const imagePath = path.join(IMAGES_DIR, imageName);

    let bytes;
    try {
      bytes = await fs.readFile(imagePath);
    } catch {
      problems.push(`${siteId}: missing library/images/${imageName}`);
      continue;
    }

    const hash = crypto.createHash("sha256").update(bytes).digest("hex").slice(0, 8);
    const filename = `hero-${hash}.webp`;
    const heroImage = `/heroes/${siteId}/${filename}`;

    // heroAlt is deliberately left alone. Catalog labels are cataloguing descriptions
    // ("Banner na samostmievacie kukly...") and make poor alt text, and because each playlist is
    // curated for its domain the hand-written alt stays accurate for every image in it.
    summary.sites.push({
      id: siteId,
      domain: site.domain,
      image: imageName,
      label: byFile.get(imageName)?.label ?? "",
      heroImage,
      from: entry.index,
      to: nextIndex,
    });

    if (dryRun) continue;

    const siteHeroDir = path.join(HEROES_DIR, siteId);
    await fs.mkdir(siteHeroDir, { recursive: true });

    // Drop previous hero files so the folder holds exactly one image per site.
    const existing = await fs.readdir(siteHeroDir).catch(() => []);
    await Promise.all(
      existing
        .filter((file) => file.startsWith("hero") && file !== filename)
        .map((file) => fs.unlink(path.join(siteHeroDir, file))),
    );

    await fs.writeFile(path.join(siteHeroDir, filename), bytes);

    site.heroImage = heroImage;
    await writeJson(contentPath, site);

    entry.index = nextIndex;
  }

  if (problems.length) {
    console.error("rotation failed:");
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }

  if (!dryRun) {
    playlists.lastRotated = summary.date;
    await writeJson(PLAYLISTS_PATH, playlists);
    await writeJson(SUMMARY_PATH, summary);
  }

  console.log(dryRun ? `dry run — ${summary.sites.length} sites would rotate:` : `rotated ${summary.sites.length} sites:`);
  for (const site of summary.sites) {
    console.log(`  ${site.domain.padEnd(34)} ${site.image.padEnd(9)} (${site.from} -> ${site.to})`);
  }
}

await main();
