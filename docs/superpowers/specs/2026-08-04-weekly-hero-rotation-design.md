# Weekly hero rotation + screenshot archive

**Date:** 2026-08-04
**Status:** Approved

## Goal

Every Monday, each of the 14 Billik domains gets the next hero image from its own curated
playlist, and every domain is screenshotted (desktop + mobile) afterwards so the owner has a
visual record of what the sites looked like that week.

Once a month a new folder of photos arrives. Re-cataloguing and re-curating that folder is a
deliberate manual session with Claude; everything else runs unattended.

## How the sites work today (constraints this design has to respect)

- One Next.js app (`apps/sites`) serves all 14 domains, resolved by host in `middleware.ts`.
- `packages/site-config` **imports `content/sites/*.json` at build time**. Content is not read at
  runtime, so any change requires a new deploy.
- Hero images are static files: `apps/sites/public/heroes/<siteId>/hero.webp`, referenced from
  each site's `heroImage` field.
- The admin panel (`apps/admin`) already writes through GitHub: `lib/github.ts` commits via the
  Octokit API and lets Vercel redeploy. The rotation follows the same path — commit, then deploy.

Consequence: **rotating an image means committing a file and waiting for Vercel**, not writing to
a database. Screenshots must wait for that deploy to be live, or they capture the old image.

## Decisions

| Decision | Choice |
| --- | --- |
| Where the job runs | GitHub Actions cron |
| How the image is picked | Curated ordered playlist per domain, advance one step per week |
| Screenshots | Desktop 1440x900 + mobile 390x844, full page, all 14 domains |
| Retention | Keep every week forever (no pruning) |
| Manual admin uploads | Rotation always wins — no pin flag |
| `heroAlt` | Left alone (see below) |
| `accentColor` | Derived from the image, precomputed per image in the catalog |
| Screenshot stamp | Date + time in Europe/Bratislava burned into each capture |

### Accent colour

`accentColor` drives the CTA button, headings, benefit badges, the divider gradient, the
background wash and the favicon. It follows the hero image, so the palette matches what is on
screen.

Extraction (`scripts/lib/accent.mjs`) is **saturation-weighted**, not a plain dominant-colour
grab: these are dark workshop photos, so the literal dominant colour is a muddy grey almost every
time. Near-black and near-white pixels are discarded, remaining pixels are binned by hue and
weighted by saturation, and the winning bin's median hue drives the result.

Output is clamped to S 50–85%, L 52–68%. Both bounds are required:
`packages/ui/src/landing-page.tsx` puts hardcoded black text *on* the accent (CTA button, numbered
badges) and also uses the accent as text *on* a near-black background. Measured across all 91
images the worst case is 4.1:1 — better than three of the previously hand-picked colours, the
worst of which (`#1d4ed8` on billikwelding.eu) was 2.9:1.

Colours are computed once at library-build time and stored in `catalog.json`, so the weekly run
needs no image processing and every colour is reviewable and hand-editable in one file. An image
that yields no usable hue keeps the site's existing colour rather than going grey.

`node scripts/rotate-heroes.mjs --accents-only` re-applies accents for the images already showing,
without advancing any playlist — used when accents change but the week has not.

`heroAlt` was originally going to track the image. It doesn't: catalog labels are cataloguing
descriptions ("Banner na samostmievacie kukly iWeld Gorilla Packet LCD so zváračom v akcii.") and
make worse alt text than the hand-written per-domain text already in the content files. Because
each playlist is curated for its domain's subject, the existing alt stays accurate for every image
in that playlist.

### Cache busting

`apps/sites/next.config.ts` serves `/heroes/*` with `Cache-Control: public, max-age=31536000,
immutable`. With a fixed `hero.webp` filename the URL never changes, so returning visitors would
keep the old image for up to a year — silently defeating the rotation. Hero files are therefore
written as `hero-<content-hash>.webp` and `heroImage` is updated to match. The immutable caching
stays (and stays correct), while a new image is picked up immediately. Old hero files are deleted
in the same commit, so each folder holds exactly one image.

## The weekly run

`.github/workflows/weekly-rotation.yml`, `cron: "0 4 * * 1"` (06:00 Europe/Bratislava in summer,
05:00 in winter — GitHub cron is UTC only), plus `workflow_dispatch` for manual runs.

1. **Rotate.** `scripts/rotate-heroes.mjs` reads `library/playlists.json`, advances each domain's
   `index` by one (wrapping at the end of its list), writes the chosen image to
   `apps/sites/public/heroes/<id>/hero-<hash>.webp`, points `heroImage` in
   `content/sites/<id>.json` at it, and writes the new indexes plus a `library/last-rotation.json`
   summary that the later steps read.
2. **Commit + push.** Triggers the Vercel rebuild.
3. **Wait for live.** `scripts/wait-for-deploy.mjs` polls `https://<domain>/heroes/<id>/hero.webp`
   for all 14 domains and compares the SHA-256 of the response against the file just committed.
   Done when all 14 match; fails after 15 minutes. No Vercel API token needed — it only reads
   public URLs.
4. **Screenshot.** `scripts/screenshot-sites.mjs` drives Playwright Chromium over the 14 domains,
   writing `screenshots/<YYYY-MM-DD>/<domain>-desktop.jpg` and `-mobile.jpg` (JPEG quality 72,
   full page), plus `index.md` recording which library image each domain received.
5. **Commit screenshots** with `[skip ci]` so Vercel does not rebuild for files the sites never
   serve.

Authentication is the workflow's built-in `GITHUB_TOKEN` with `contents: write`. **No secret or
third-party API key is required anywhere in this design.** Failures surface through GitHub's
default failed-workflow email.

## Files

```
library/
  images/          92 web-ready .webp (1400px wide, quality 82) — committed, ~15 MB
  catalog.json     one entry per image: file, label, category, notes, source hash
  playlists.json   per-domain ordered image list + current index
scripts/
  build-library.mjs      source folder -> library/images + catalog skeleton (monthly refill)
  rotate-heroes.mjs      advance playlists, write heroes + heroAlt
  wait-for-deploy.mjs    poll live domains until the new hero is served
  screenshot-sites.mjs   Playwright desktop + mobile capture
.github/workflows/weekly-rotation.yml
screenshots/<YYYY-MM-DD>/...
```

`playlists.json` is meant to be hand-editable. `index` points at the image showing right now, so
the next run advances to `index + 1`:

```json
{
  "lastRotated": "2026-08-04",
  "sites": {
    "zvaracky-eu": { "index": 2, "images": ["40.webp", "20.webp", "19.webp"] }
  }
}
```

Every domain's playlist starts on the image it was already showing, so the first run is a single
step forward rather than a jump. Sister domains are deliberately offset — the two metalwork sites,
the two coating sites, and the two helmet-heavy sites never land on the same photo in the same
week.

### Domains that are not live

`"live": false` on a playlist entry marks a domain whose DNS does not point at Vercel. It still
rotates — the image is committed and waiting — but `wait-for-deploy` and `screenshot-sites` skip
it, so one unconnected domain cannot fail the weekly run and turn the failure email into noise.

As of 2026-08-04 exactly one domain is flagged: **ochrannepracovneprostriedky.sk** resolves to
`212.57.34.249` (the registrar, serving a self-signed certificate) rather than Vercel's
`216.198.79.1` like the other 13. Its site exists in the repo but has never been publicly served.
Once its DNS is pointed at Vercel, delete the flag and it rejoins the rotation.

The 255 MB of originals in `OBRAZKY/` are **gitignored** — they never enter git history. Only the
optimized copies the sites actually serve are committed.

## Playlist curation

Built from `library/catalog.json`, matching each domain's subject to image categories:

- Welding equipment sites (`zvaracky.eu`, `zvaraciatechnika.eu`, `invertory.eu`,
  `billikwelding.sk/.eu`) draw on `produkt-zvaracka`, `zvaracia-technika`, `zvarenie`.
- Metalwork sites (`zamocnickvyroba.sk/.eu`) draw on `kovovyroba`.
- Coating sites (`lakovanie.eu`, `praskovanie.eu`) draw on `praskove-lakovanie` and
  `kompozit-sluzby`.
- Service/rental sites (`servore.eu`, `servoglas.sk`) draw on `servis-oprava`,
  `prenajom-pozicovna`.
- General trade sites (`billik.cz`, `billiktrade.eu`) draw on `letak-banner`.

Thin categories (`praskove-lakovanie` has 1 image, `kovovyroba` 4) mean some general Billik
banners appear on more than one domain. Domains whose playlist is shorter than 6 images are
flagged in the curation output so the owner can be asked for more photos.

## Monthly refill

1. Drop the new folder (e.g. `OBRAZKY-2026-09/`) in the repo root.
2. Run `node scripts/build-library.mjs <folder>` — resizes to webp, skips duplicates by content
   hash, appends unlabelled entries to `catalog.json`.
3. Claude reviews each new image and fills in label / category / notes.
4. Claude re-curates `playlists.json` — appends new images, retires stale ones, resets indexes.
5. Commit. The Monday job is autonomous again.

## Out of scope

- Notifications beyond GitHub's failure email.
- A rollback command — reverting is `git revert` on the rotation commit.
- Pinning a domain to a fixed image (explicitly rejected: rotation always wins).
- Screenshot pruning (explicitly rejected: keep everything).

## Risks

- **Repo growth.** ~28 JPEGs per week at quality 72, roughly 250 MB per year, never pruned. This
  was chosen deliberately; git history makes it effectively permanent.
- **Deploy timing.** If Vercel takes longer than 15 minutes, the run fails after rotating. The
  images are still correct and live; only the screenshots are missing, and the workflow can be
  re-run manually.
- **Both apps rebuild** on the rotation commit, since `apps/admin` shares the monorepo.
