/**
 * Rasterizes src/assets/mdi-appache.svg into PWA / Apple touch PNGs in public/.
 * Applies rounded-rectangle alpha so shortcuts are not harsh white squares (Windows / launchers).
 * Run: node scripts/generate-pwa-icons.mjs
 */
import sharp from "sharp";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "src", "assets", "mdi-appache.svg");
const svg = readFileSync(svgPath);

const white = { r: 255, g: 255, b: 255, alpha: 1 };

/** ~20% corner radius — readable on taskbars and home screens */
function cornerRadiusPx(size) {
  return Math.max(8, Math.round(size * 0.2));
}

/**
 * Keeps pixels inside a rounded rect; outside becomes transparent (fixes square tile look).
 */
async function applyRoundedRectMask(imageBuffer, size) {
  const rx = cornerRadiusPx(size);
  const maskSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" rx="${rx}" ry="${rx}" fill="white"/>
    </svg>`,
  );
  const maskPng = await sharp(maskSvg).resize(size, size).png().toBuffer();

  return sharp(imageBuffer)
    .resize(size, size, { fit: "fill" })
    .ensureAlpha()
    .composite([{ input: maskPng, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function writeIcon(size, outName) {
  const flat = await sharp(svg)
    .resize(size, size, { fit: "contain", background: white })
    .png()
    .toBuffer();
  const rounded = await applyRoundedRectMask(flat, size);
  await sharp(rounded).toFile(join(root, "public", outName));
}

/** Maskable: content in ~80% safe zone (Android adaptive icons) + rounded outer silhouette */
async function writeMaskable512(outName) {
  const canvas = 512;
  const inner = Math.round(canvas * 0.8);
  const buf = await sharp(svg)
    .resize(inner, inner, { fit: "contain", background: white })
    .png()
    .toBuffer();
  const meta = await sharp(buf).metadata();
  const w = meta.width ?? inner;
  const h = meta.height ?? inner;
  const flat = await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: white,
    },
  })
    .composite([
      {
        input: buf,
        left: Math.round((canvas - w) / 2),
        top: Math.round((canvas - h) / 2),
      },
    ])
    .png()
    .toBuffer();
  const rounded = await applyRoundedRectMask(flat, canvas);
  await sharp(rounded).toFile(join(root, "public", outName));
}

await writeIcon(192, "android-launchericon-192-192.png");
await writeIcon(512, "android-launchericon-512-512.png");
await writeMaskable512("pwa-maskable-512.png");
await writeIcon(180, "apple-touch-icon.png");
