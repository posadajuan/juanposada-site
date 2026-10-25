import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Pages to check. Add each new page here as it's built.
const pages = ['/', '/styleguide'];

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
  await expect(page.getByRole('heading', { level: 1 })).toContainText('clear, playful');
  await expect(page.getByRole('link', { name: /See my work/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get in touch' })).toBeVisible();
});

test('availability line shows a Monday date', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-availability]').first()).toContainText(/Monday \d{1,2} \w+/);
});

test('theme toggle switches mode and remembers it', async ({ page, isMobile }) => {
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');

  const toggle = page.getByRole('button', { name: /Switch to light mode/ });
  await toggle.click();
  await expect(html).toHaveAttribute('data-theme', 'light');

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'light');
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
