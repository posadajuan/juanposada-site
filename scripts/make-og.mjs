// Renders scripts/og-default.html to public/og-default.png (1200×630).
// Run after changing the headline: node scripts/make-og.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const html = new URL('./og-default.html', import.meta.url);
const out = fileURLToPath(new URL('../public/og-default.png', import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(html.href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out });
await browser.close();
console.log('Saved', out);
