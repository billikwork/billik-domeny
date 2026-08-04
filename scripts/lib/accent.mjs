// Derive a UI accent colour from an image.
//
// A plain "dominant colour" grab is wrong here: these are workshop photos, mostly dark steel and
// black backgrounds, so the dominant colour is nearly always a muddy grey. Instead this weights
// pixels by saturation, ignores near-black and near-white, and picks the strongest hue — the
// orange sparks, the blue arc, the brand yellow.
//
// The result is clamped into a band that stays legible both ways round, because
// packages/ui/src/landing-page.tsx puts black text on the accent AND uses the accent as text on a
// near-black background.

import sharp from "sharp";

const SAMPLE_SIZE = 96;
const HUE_BINS = 36;

// Pixels outside these bounds carry no usable hue information.
const MIN_LIGHTNESS = 0.12;
const MAX_LIGHTNESS = 0.92;
const MIN_SATURATION = 0.2;

// Output bounds. Below ~0.5 saturation the accent reads as grey; outside the lightness band
// either black-on-accent or accent-on-black loses contrast.
const OUT_SATURATION = [0.5, 0.85];
const OUT_LIGHTNESS = [0.52, 0.68];

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [channel(h + 1 / 3), channel(h), channel(h - 1 / 3)].map((v) => Math.round(v * 255));
}

const toHex = ([r, g, b]) =>
  `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

const clamp = (value, [min, max]) => Math.min(max, Math.max(min, value));

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

/**
 * @returns {Promise<string|null>} hex colour, or null when the image has no usable hue
 */
export async function deriveAccent(input) {
  const { data, info } = await sharp(input)
    .resize(SAMPLE_SIZE, SAMPLE_SIZE, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const weights = new Array(HUE_BINS).fill(0);
  const members = Array.from({ length: HUE_BINS }, () => []);

  for (let i = 0; i < data.length; i += info.channels) {
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    if (l < MIN_LIGHTNESS || l > MAX_LIGHTNESS || s < MIN_SATURATION) continue;

    const bin = Math.min(HUE_BINS - 1, Math.floor(h * HUE_BINS));
    weights[bin] += s;
    members[bin].push([h, s, l]);
  }

  const best = weights.reduce((bestIndex, weight, index) => (weight > weights[bestIndex] ? index : bestIndex), 0);
  if (weights[best] === 0) return null;

  const picked = members[best];
  const hue = median(picked.map((p) => p[0]));
  const saturation = clamp(median(picked.map((p) => p[1])), OUT_SATURATION);
  const lightness = clamp(median(picked.map((p) => p[2])), OUT_LIGHTNESS);

  return toHex(hslToRgb(hue, saturation, lightness));
}
