// Render the share card (Open Graph image) to public/og-card.png.
// Run locally and commit the PNG: text rendering depends on installed fonts,
// so the card is a committed asset, not a build product.
// Usage: node scripts/render-og.mjs
import sharp from 'sharp';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const W = 1200;
const H = 630;

// Brand tokens from src/styles/custom.css.
const NAVY = '#0f2560'; // blueprint deep, the header navy
const PAPER = '#fdfdfc';
const ICE = '#cadcfc';

// Faint blueprint grid over the navy, then the words. Everything is centered
// and kept inside the middle ~760px: chat apps (WhatsApp among them) crop wide
// preview images towards the centre, and a centred composition survives any
// symmetric crop. The mark is composited on top afterwards.
const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${ICE}" stroke-opacity="0.07" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <text x="600" y="272" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="38" font-weight="600" fill="${ICE}">Product Definition as Code</text>
  <text x="600" y="352" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="46" font-weight="700" fill="${PAPER}">Define once.</text>
  <text x="600" y="410" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="46" font-weight="700" fill="${PAPER}">Build from it.</text>
  <text x="600" y="468" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="46" font-weight="700" fill="${PAPER}">Change without losing track.</text>
  <text x="600" y="564" text-anchor="middle" font-family="Consolas, monospace" font-size="26" fill="${ICE}" fill-opacity="0.85">pdac.dev</text>
</svg>`;

const mark = await sharp(join(root, 'src', 'assets', 'pdac.png'))
  .resize(140, 140)
  .toBuffer();

await sharp(Buffer.from(svg))
  .composite([{ input: mark, top: 64, left: (W - 140) / 2 }])
  .png()
  .toFile(join(root, 'public', 'og-card.png'));

console.log('public/og-card.png written');
