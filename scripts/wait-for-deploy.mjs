#!/usr/bin/env node
// Block until every rotated hero is actually being served by the live domains.
//
//   node scripts/wait-for-deploy.mjs [--timeout 900]
//
// Reads library/last-rotation.json, then polls https://<domain><heroImage> for each site and
// compares the SHA-256 of the response against the committed file. Only reads public URLs —
// no Vercel token required.

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
const SUMMARY_PATH = path.join(ROOT, "library/last-rotation.json");
const HEROES_DIR = path.join(ROOT, "apps/sites/public/heroes");

const POLL_INTERVAL_MS = 15_000;

function parseTimeout(argv) {
  const i = argv.indexOf("--timeout");
  return i === -1 ? 900 : Number(argv[i + 1]);
}

const sha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function isLive(site, expectedHash) {
  const url = `https://${site.domain}${site.heroImage}`;
  try {
    const response = await fetch(url, { cache: "no-store", redirect: "follow" });
    if (!response.ok) return false;
    return sha256(Buffer.from(await response.arrayBuffer())) === expectedHash;
  } catch {
    return false;
  }
}

async function main() {
  const timeoutSeconds = parseTimeout(process.argv.slice(2));
  const summary = JSON.parse(await fs.readFile(SUMMARY_PATH, "utf8"));

  const expected = new Map();
  for (const site of summary.sites) {
    const filename = path.basename(site.heroImage);
    const bytes = await fs.readFile(path.join(HEROES_DIR, site.id, filename));
    expected.set(site.id, sha256(bytes));
  }

  const pending = new Map(summary.sites.map((site) => [site.id, site]));
  const deadline = Date.now() + timeoutSeconds * 1000;

  console.log(`waiting for ${pending.size} domains to serve the new hero (timeout ${timeoutSeconds}s)`);

  while (pending.size > 0 && Date.now() < deadline) {
    const checks = [...pending.values()].map(async (site) => {
      if (await isLive(site, expected.get(site.id))) {
        pending.delete(site.id);
        console.log(`  live: ${site.domain}`);
      }
    });
    await Promise.all(checks);

    if (pending.size === 0) break;
    await sleep(POLL_INTERVAL_MS);
  }

  if (pending.size > 0) {
    console.error(`timed out; still stale: ${[...pending.values()].map((s) => s.domain).join(", ")}`);
    process.exit(1);
  }

  console.log("all domains are serving the new hero");
}

await main();
