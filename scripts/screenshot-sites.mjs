#!/usr/bin/env node
// Capture every domain, desktop and mobile, into screenshots/<date>/.
//
//   node scripts/screenshot-sites.mjs
//   node scripts/screenshot-sites.mjs --date 2026-08-10 --only zvaracky-eu
//
// Requires Playwright's chromium. In CI:  npm install --no-save playwright && npx playwright install --with-deps chromium

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const ROOT = path.resolve(import.meta.dirname, "..");
const SUMMARY_PATH = path.join(ROOT, "library/last-rotation.json");
const CONTENT_DIR = path.join(ROOT, "content/sites");
const SHOTS_DIR = path.join(ROOT, "screenshots");

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];
const QUALITY = 72;
const NAV_TIMEOUT_MS = 45_000;

function parseArgs(argv) {
  const get = (flag) => {
    const i = argv.indexOf(flag);
    return i === -1 ? null : argv[i + 1];
  };
  return { date: get("--date"), only: get("--only") };
}

const readJson = async (p) => JSON.parse(await fs.readFile(p, "utf8"));

// Prefer the rotation summary (it knows which image each site just got); fall back to the
// content files so screenshots can be taken any time, rotation or not.
async function loadSites() {
  try {
    const summary = await readJson(SUMMARY_PATH);
    return { date: summary.date, sites: summary.sites };
  } catch {
    const files = (await fs.readdir(CONTENT_DIR)).filter((f) => f.endsWith(".json")).sort();
    const sites = [];
    for (const file of files) {
      const site = await readJson(path.join(CONTENT_DIR, file));
      sites.push({ id: site.id, domain: site.domain, image: null, heroAlt: site.heroAlt });
    }
    return { date: new Date().toISOString().slice(0, 10), sites };
  }
}

// Full-page shots miss lazy-loaded images unless the page has been scrolled through once.
async function scrollThrough(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = () => {
        window.scrollBy(0, window.innerHeight);
        y += window.innerHeight;
        if (y >= document.body.scrollHeight) {
          window.scrollTo(0, 0);
          resolve();
        } else {
          setTimeout(step, 120);
        }
      };
      step();
    });
  });
  await page.waitForTimeout(400);
}

async function capture(browser, site, viewport, outPath) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  try {
    await page.goto(`https://${site.domain}`, { waitUntil: "load", timeout: NAV_TIMEOUT_MS });
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
    await scrollThrough(page);
    await page.screenshot({ path: outPath, fullPage: true, type: "jpeg", quality: QUALITY });
  } finally {
    await context.close();
  }
}

async function main() {
  const { date: dateOverride, only } = parseArgs(process.argv.slice(2));
  const loaded = await loadSites();
  const date = dateOverride ?? loaded.date;
  const sites = only ? loaded.sites.filter((s) => s.id === only) : loaded.sites;

  if (sites.length === 0) {
    console.error(only ? `no site matched --only ${only}` : "no sites to capture");
    process.exit(1);
  }

  const outDir = path.join(SHOTS_DIR, date);
  await fs.mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  const failures = [];
  const rows = [];

  try {
    for (const site of sites) {
      const row = { site, files: {} };
      for (const viewport of VIEWPORTS) {
        const filename = `${site.domain}-${viewport.name}.jpg`;
        const outPath = path.join(outDir, filename);
        try {
          await capture(browser, site, viewport, outPath);
        } catch (error) {
          // One retry — most failures here are a slow cold start on the first hit.
          try {
            await capture(browser, site, viewport, outPath);
          } catch (retryError) {
            failures.push(`${site.domain} ${viewport.name}: ${retryError.message.split("\n")[0]}`);
            continue;
          }
        }
        const { size } = await fs.stat(outPath);
        row.files[viewport.name] = { filename, size };
        console.log(`  ${filename} (${(size / 1024).toFixed(0)} KB)`);
      }
      rows.push(row);
    }
  } finally {
    await browser.close();
  }

  const lines = [
    `# Screenshots ${date}`,
    "",
    "| Domain | Image | Desktop | Mobile |",
    "| --- | --- | --- | --- |",
  ];
  for (const { site, files } of rows) {
    const cell = (name) => (files[name] ? `[${name}](${files[name].filename})` : "—");
    lines.push(`| ${site.domain} | ${site.image ?? "—"} | ${cell("desktop")} | ${cell("mobile")} |`);
  }
  if (failures.length) {
    lines.push("", "## Failed", "");
    for (const failure of failures) lines.push(`- ${failure}`);
  }
  await fs.writeFile(path.join(outDir, "index.md"), `${lines.join("\n")}\n`, "utf8");

  const total = rows.reduce(
    (sum, row) => sum + Object.values(row.files).reduce((s, f) => s + f.size, 0),
    0,
  );
  console.log(`\n${rows.length} sites, ${(total / 1024 / 1024).toFixed(1)} MB -> screenshots/${date}/`);

  if (failures.length) {
    console.error(`\n${failures.length} capture(s) failed:`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
}

await main();
