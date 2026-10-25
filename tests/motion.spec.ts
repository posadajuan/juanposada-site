import { test, expect } from '@playwright/test';

test.describe('with motion', () => {
  test('hero words rise in and read as one sentence', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', '');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveText(
      'Juan Posada — I turn complex ideas into clear, playful digital experiences, from first sketch to launch.',
    );
    expect(await h1.locator('.rise-word').count()).toBeGreaterThan(5);
  });

  test('sections reveal as you scroll and numbers count up to their value', async ({ page }) => {
    await page.goto('/');
    const firstStat = page.locator('.highlights [data-count]').first();
    const finalValue = await firstStat.getAttribute('data-count');

    const lastReveal = page.locator('[data-reveal]').last();
    await expect(lastReveal).not.toHaveClass(/is-in/);

    await firstStat.scrollIntoViewIfNeeded();
    await expect(firstStat).toHaveText(finalValue ?? '', { timeout: 4000 });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(lastReveal).toHaveClass(/is-in/);
  });

  test('navigation hides when scrolling down and returns when scrolling up', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop scroll behaviour');
    await page.goto('/');
    const html = page.locator('html');
    await page.mouse.wheel(0, 1200);
    await expect(html).toHaveAttribute('data-nav-hidden', '');
    await page.mouse.wheel(0, -300);
    await expect(html).not.toHaveAttribute('data-nav-hidden', '');
  });

  test('big images get a parallax offset while scrolling', async ({ page }) => {
    await page.goto('/work/cyber-explorers');
    const cover = page.locator('[data-parallax]').first();
    await page.mouse.wheel(0, 400);
    await expect
      .poll(async () => cover.evaluate((el) => (el as HTMLElement).style.getPropertyValue('--py')))
      .not.toBe('');
  });
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('everything is visible straight away and nothing moves', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveAttribute('data-motion', '');

    const hidden = await page.locator('[data-reveal]').evaluateAll((els) =>
      els.filter((el) => getComputedStyle(el).opacity !== '1').length,
    );
    expect(hidden).toBe(0);

    const stat = page.locator('.highlights [data-count]').first();
    await expect(stat).toHaveText((await stat.getAttribute('data-count')) ?? '');

    await page.mouse.wheel(0, 1200);
    await expect(page.locator('html')).not.toHaveAttribute('data-nav-hidden', '');
  });
});
