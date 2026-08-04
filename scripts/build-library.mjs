#!/usr/bin/env node
// Convert a folder of source photos into the web-ready rotation library.
//
//   node scripts/build-library.mjs OBRAZKY
//   node scripts/build-library.mjs OBRAZKY-2026-09 --labels OBRAZKY-2026-09/_catalog.json
//
// Resizes every image to 1400px wide WebP, skips ones already in the library (matched by the
// SHA-256 of the source bytes), and appends an entry to library/catalog.json for each new file.
// New entries arrive with an empty label so it is obvious which ones still need describing.

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import { deriveAccent } from "./lib/accent.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const LIBRARY_DIR = path.join(ROOT, "library");
const IMAGES_DIR = path.join(LIBRARY_DIR, "images");
const CATALOG_PATH = path.join(LIBRARY_DIR, "catalog.json");

const SOURCE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const TARGET_WIDTH = 1400;
const TARGET_QUALITY = 82;

function parseArgs(argv) {
  const positional = [];
  let labels = null;

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--labels") {
      labels = argv[i + 1];
      i += 1;
    } else {
      positional.push(argv[i]);
    }
  }

  if (positional.length !== 1) {
    console.error("usage: node scripts/build-library.mjs <source-dir> [--labels <catalog.json>]");
    process.exit(1);
  }

  return { sourceDir: path.resolve(ROOT, positional[0]), labelsPath: labels };
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

// Labels can come from a sidecar catalog keyed by the original filename ("1.png").
async function loadLabels(labelsPath) {
  if (!labelsPath) return new Map();
  const raw = await readJson(path.resolve(ROOT, labelsPath), []);
  return new Map(raw.map((entry) => [entry.file, entry]));
}

async function main() {
  const { sourceDir, labelsPath } = parseArgs(process.argv.slice(2));

  const labels = await loadLabels(labelsPath);
  const catalog = await readJson(CATALOG_PATH, []);
  const knownHashes = new Set(catalog.map((entry) => entry.sourceHash));
  const usedNames = new Set(catalog.map((entry) => entry.file));

  await fs.mkdir(IMAGES_DIR, { recursive: true });

  const entries = (await fs.readdir(sourceDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && !entry.name.startsWith("_") && !entry.name.startsWith("."))
    .filter((entry) => SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  let added = 0;
  let skipped = 0;

  for (const name of entries) {
    const sourcePath = path.join(sourceDir, name);
    const bytes = await fs.readFile(sourcePath);
    const sourceHash = crypto.createHash("sha256").update(bytes).digest("hex");

    if (knownHashes.has(sourceHash)) {
      skipped += 1;
      continue;
    }

    // Keep the original numbering ("1.png" -> "1.webp") so the catalog stays easy to eyeball,
    // and only disambiguate when a later folder reuses a name.
    const base = path.basename(name, path.extname(name));
    let outputName = `${base}.webp`;
    let suffix = 2;
    while (usedNames.has(outputName)) {
      outputName = `${base}-${suffix}.webp`;
      suffix += 1;
    }

    const optimized = await sharp(bytes)
      .rotate()
      .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
      .webp({ quality: TARGET_QUALITY })
      .toBuffer();

    await fs.writeFile(path.join(IMAGES_DIR, outputName), optimized);
    const meta = await sharp(optimized).metadata();
    const label = labels.get(name);

    catalog.push({
      file: outputName,
      source: `${path.basename(sourceDir)}/${name}`,
      sourceHash,
      width: meta.width,
      height: meta.height,
      bytes: optimized.length,
      accent: await deriveAccent(optimized),
      label: label?.label ?? "",
      category: label?.category ?? "",
      notes: label?.notes ?? "",
    });

    knownHashes.add(sourceHash);
    usedNames.add(outputName);
    added += 1;
  }

  // Backfill accents for entries catalogued before accent extraction existed.
  let backfilled = 0;
  for (const entry of catalog) {
    if (entry.accent !== undefined) continue;
    entry.accent = await deriveAccent(path.join(IMAGES_DIR, entry.file));
    backfilled += 1;
  }
  if (backfilled) console.log(`derived ${backfilled} accent colour(s)`);

  catalog.sort((a, b) => a.file.localeCompare(b.file, undefined, { numeric: true }));
  await fs.writeFile(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  const unlabelled = catalog.filter((entry) => !entry.label).map((entry) => entry.file);
  const totalBytes = catalog.reduce((sum, entry) => sum + (entry.bytes ?? 0), 0);

  console.log(`added ${added}, skipped ${skipped} (already in library)`);
  console.log(`library: ${catalog.length} images, ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
  if (unlabelled.length) {
    console.log(`needs labels (${unlabelled.length}): ${unlabelled.join(" ")}`);
  }
}

await main();
