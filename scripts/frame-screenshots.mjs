// Turns raw phone screenshots into store screenshots with a caption on top.
//
//   store/screenshots/raw/<locale>/01.png … 06.png   (your phone screenshots, .png or .jpg)
//   → store/screenshots/<locale>/app-store/01.png     1290×2796 (iPhone 6.7"/6.9")
//   → store/screenshots/<locale>/play/01.png          1080×1920 (Play phone)
//
// Captions come from store/listings.json (screenshotCaptions, same order).
// Locales: en-US, tr. Missing raw files are skipped.
// Run: NODE_PATH=$(npm root -g) node scripts/frame-screenshots.mjs
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

// require() (unlike import) also finds a globally installed Playwright via NODE_PATH.
const { chromium } = createRequire(import.meta.url)('playwright');

const root = resolve(import.meta.dirname, '..');
const listings = JSON.parse(readFileSync(resolve(root, 'store/listings.json'), 'utf8'));

const TARGETS = [
  { name: 'app-store', width: 1290, height: 2796 },
  { name: 'play', width: 1080, height: 1920 },
];

// Mirrors darkPalette (src/theme/palettes.ts).
const BACKGROUND = 'radial-gradient(circle at 50% 0%, #2A2116, #0B0B0F 65%)';
const TEXT = '#F5F5F7';
const ACCENT = '#F5A524';

const escapeHtml = (text) =>
  text.replace(
    /[&<>"]/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char],
  );

const browser = await chromium.launch();
const page = await browser.newPage();
let written = 0;

for (const [locale, listing] of Object.entries(listings)) {
  for (const [index, caption] of listing.screenshotCaptions.entries()) {
    const number = String(index + 1).padStart(2, '0');
    const file = `${number}.png`;
    const raw = ['png', 'jpg', 'jpeg']
      .map((extension) => resolve(root, 'store/screenshots/raw', locale, `${number}.${extension}`))
      .find((path) => existsSync(path));
    if (!raw) continue;
    const mime = raw.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const image = `data:${mime};base64,${readFileSync(raw).toString('base64')}`;

    for (const { name, width, height } of TARGETS) {
      const unit = width / 100;
      await page.setViewportSize({ width, height });
      await page.setContent(`
        <body style="margin:0;width:${width}px;height:${height}px;background:${BACKGROUND};
          display:flex;flex-direction:column;align-items:center;box-sizing:border-box;
          padding:${unit * 9}px ${unit * 7}px 0;gap:${unit * 6}px;overflow:hidden;
          font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif">
          <div style="color:${TEXT};font-size:${unit * 7.4}px;font-weight:800;line-height:1.15;
            text-align:center;letter-spacing:-0.5px;max-width:92%">${escapeHtml(caption)}</div>
          <div style="width:${unit * 14}px;height:${unit * 1}px;border-radius:99px;
            background:${ACCENT}"></div>
          <img src="${image}" style="flex:1;min-height:0;max-width:100%;object-fit:contain;
            object-position:top;border-radius:${unit * 5}px ${unit * 5}px 0 0;
            box-shadow:0 0 0 ${unit * 0.6}px #26262E, 0 ${unit * 2}px ${unit * 8}px #000">
        </body>`);
      const out = resolve(root, 'store/screenshots', locale, name);
      mkdirSync(out, { recursive: true });
      await page.screenshot({ path: resolve(out, file) });
      written += 1;
    }
  }
}

await browser.close();
console.log(`wrote ${written} screenshots`);
