import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Keep tests independent of Cloudflare's live spam-check service.
test.beforeEach(async ({ page }) => {
  await page.route('https://challenges.cloudflare.com/**', (route) => route.abort());
});

// Pages to check. Add each new page here as it's built.
const pages = [
  '/',
  '/work',
  '/work/cyber-explorers',
  '/work/logos',
  '/work/graphic-design',
  '/photography',
  '/about',
  '/contact',
  '/styleguide',
];

async function setTheme(page: Page, theme: 'dark' | 'light') {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem('theme', t);
    } catch {}
  }, theme);
}

for (const path of pages) {
  for (const theme of ['dark', 'light'] as const) {
    test(`${path} has no accessibility problems (${theme} mode)`, async ({ page }) => {
      // Check the settled page, not elements caught mid-fade.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await setTheme(page, theme);
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        // Gradient text is decorative over a solid colour fallback; axe
        // can't measure background-clip text, so colour contrast on it is
        // checked by hand against the palette board instead.
        .exclude('.gradient-text')
        .analyze();

      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  }
}

test('home shows the hero line and main actions', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('brands, products and experiences');
  await expect(page.getByRole('link', { name: /See my work/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get in touch' })).toBeVisible();
});

test('availability line shows a Monday date', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-availability]').first()).toContainText(/Monday \d{1,2} \w+/);
});

test('theme follows the device: light by default, dark when the device is dark', async ({ browser }) => {
  for (const scheme of ['light', 'dark'] as const) {
    const ctx = await browser.newContext({ colorScheme: scheme });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
    await ctx.close();
  }
  const ctx = await browser.newContext({ colorScheme: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await ctx.close();
});

test('theme follows device changes live until the visitor picks a mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(html).toHaveAttribute('data-theme', 'dark');
});

test('theme toggle switches mode and remembers it', async ({ page, isMobile }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');

  const toggle = page.getByRole('switch', { name: /Dark/ });
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
  await toggle.click();
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect(toggle).toHaveAttribute('aria-checked', 'false');

  // The choice sticks, even though the device is still dark.
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'light');

  // Picking the device's own mode goes back to following the device.
  await page.getByRole('switch', { name: /Dark/ }).click();
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBeNull();
  test.info().annotations.push({ type: 'viewport', description: isMobile ? 'mobile' : 'desktop' });
});

test('mobile menu opens and closes', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile only');
  await page.goto('/');
  const button = page.locator('[data-menu-toggle]');
  const menuLink = page.locator('[data-menu]').getByRole('link', { name: 'Work', exact: true });

  await expect(menuLink).toBeHidden();
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(menuLink).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(menuLink).toBeHidden();
});

test('email address is not in the page source', async ({ page }) => {
  await page.goto('/');
  const html = await page.content();
  expect(html).not.toContain('@juanposada.co.uk');
});

test('lightbox opens, moves with arrow keys and closes with Esc', async ({ page }) => {
  await page.goto('/styleguide');
  const tiles = page.locator('a[data-lightbox^="gallery-"]');
  const total = await tiles.count();
  expect(total).toBeGreaterThan(1);

  await tiles.first().click();
  const dialog = page.locator('dialog[open]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-lb-counter]')).toHaveText(`1 / ${total}`);
  await expect(dialog.locator('[data-lb-img]')).toHaveAttribute('src', /.+/);

  await page.keyboard.press('ArrowRight');
  await expect(dialog.locator('[data-lb-counter]')).toHaveText(`2 / ${total}`);

  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(dialog.locator('[data-lb-counter]')).toHaveText(`${total} / ${total}`);

  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
});

test('lightbox buttons work and the close button returns focus', async ({ page }) => {
  await page.goto('/styleguide');
  const first = page.locator('a[data-lightbox^="photos-"]').first();
  await first.click();
  const dialog = page.locator('dialog[open]');
  await dialog.getByRole('button', { name: 'Next image' }).click();
  await expect(dialog.locator('[data-lb-counter]')).toHaveText(/^2 \//);
  await dialog.getByRole('button', { name: 'Close viewer' }).click();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(first).toBeFocused();
});

test('images are served in modern formats and lazy-loaded below the fold', async ({ page }) => {
  await page.goto('/styleguide');
  const sources = page.locator('picture source[type="image/avif"]');
  expect(await sources.count()).toBeGreaterThan(0);
  const lazy = page.locator('img[loading="lazy"]');
  expect(await lazy.count()).toBeGreaterThan(0);
});

test('mobile menu is a solid full-screen panel that hides the page behind it', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile only');
  for (const theme of ['dark', 'light'] as const) {
    await page.addInitScript((t) => {
      try {
        localStorage.setItem('theme', t);
      } catch {}
    }, theme);
    await page.goto('/about');
    await page.mouse.wheel(0, 600); // open it over busy content, not the top of the page
    await page.locator('[data-menu-toggle]').click();
    const panel = page.locator('[data-menu]');
    await expect(panel).toBeVisible();

    // Let the slide-in finish before measuring.
    await expect.poll(() => panel.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    await page.waitForTimeout(400);

    const { bg, top, bottom, viewport } = await panel.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { bg: getComputedStyle(el).backgroundColor, top: r.top, bottom: r.bottom, viewport: window.innerHeight };
    });
    expect(bg, `${theme}: panel background must be solid`).toMatch(/^rgb\(/);
    expect(top).toBeLessThanOrEqual(90);
    expect(bottom).toBeGreaterThanOrEqual(viewport - 1);

    // Page underneath doesn't scroll while the menu is open
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
  }
});

test('search engines and AI assistants can find everything', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Allow: /');
  expect(robots).toContain('Sitemap: https://juanposada.co.uk/sitemap.xml');

  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const path of ['/', '/work/', '/work/cyber-explorers/', '/work/graphic-design/', '/about/', '/contact/']) {
    expect(sitemap).toContain(`<loc>https://juanposada.co.uk${path}</loc>`);
  }
  expect(sitemap).not.toContain('styleguide');

  const llms = await (await request.get('/llms.txt')).text();
  expect(llms).toMatch(/^# Juan Posada/);
  expect(llms).toContain('/work/cyber-explorers/');
});

test('pages share well and describe themselves to search engines', async ({ page }) => {
  await page.goto('/work/cyber-explorers');
  const og = (p: string) => page.locator(`meta[property="${p}"]`).getAttribute('content');
  expect(await og('og:image')).toMatch(/^https:\/\/juanposada\.co\.uk\/.+\.jpg$/);
  expect(await og('og:type')).toBe('article');
  expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe('https://juanposada.co.uk/work/cyber-explorers/');

  const data = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
  const types = data['@graph'].map((node: { '@type': string }) => node['@type']);
  expect(types).toEqual(expect.arrayContaining(['WebSite', 'Person', 'CreativeWork', 'BreadcrumbList']));

  await page.goto('/');
  expect(await og('og:image')).toBe('https://juanposada.co.uk/og-default.png');
});

test('home shows the brands Juan has worked with, readable by screen readers', async ({ page }) => {
  await page.goto('/');
  const marquee = page.getByRole('region', { name: "Brands I've worked with" });
  await expect(marquee.getByRole('img', { name: 'HSBC' })).toBeVisible();
  await expect(marquee.getByRole('img', { name: 'British Council' })).toHaveCount(1);
});

test('mobile menu works with a keyboard: focus moves in, stays in, and returns on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/');
  const toggle = page.locator('[data-menu-toggle]');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-menu] a').first()).toBeFocused();
  // The page behind the menu can't be reached
  expect(await page.evaluate(() => (document.querySelector('main') as HTMLElement).inert)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  expect(await page.evaluate(() => (document.querySelector('main') as HTMLElement).inert)).toBe(false);
});

test('project cards are announced by their title', async ({ page }) => {
  await page.goto('/work');
  await expect(page.getByRole('link', { name: /^Cyber Explorers/ })).toHaveCount(1);
});
