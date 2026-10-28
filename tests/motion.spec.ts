import { test, expect } from '@playwright/test';

test.describe('with motion', () => {
  test('hero words rise in and read as one sentence', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', '');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveText(
      'I design brands, products and experiences that people understand, use and remember.',
    );
    expect(await h1.locator('.rise-word').count()).toBeGreaterThan(5);
  });

  test('sections wait until they are properly in view, then reveal and stay', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('.cta');
    await expect(cta).toHaveAttribute('data-reveal', 'stagger');

    // Top of the block just inside the bottom edge: still waiting.
    await page.evaluate(() => {
      const el = document.querySelector('.cta')!;
      window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - window.innerHeight * 0.9);
    });
    await page.waitForTimeout(300);
    await expect(cta).not.toHaveClass(/is-in/);

    // Top of the block half way up the screen: it arrives.
    await page.evaluate(() => {
      const el = document.querySelector('.cta')!;
      window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - window.innerHeight * 0.5);
    });
    await expect
      .poll(async () => cta.evaluate((el) => el.classList.contains('is-in') || !el.hasAttribute('data-reveal')))
      .toBe(true);
  });

  test('scrolling through the whole page reveals everything', async ({ page }) => {
    await page.goto('/work/cyber-explorers');
    for (let i = 0; i < 40; i++) {
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(40);
    }
    await expect(page.locator('[data-reveal]:not(.is-in)')).toHaveCount(0);
  });

  test('numbers count up to their exact value', async ({ page }) => {
    await page.goto('/');
    const firstStat = page.locator('.highlights [data-count]').first();
    const finalValue = (await firstStat.getAttribute('data-count')) ?? '';
    await firstStat.scrollIntoViewIfNeeded();
    await expect(firstStat).toHaveText(finalValue, { timeout: 6000 });
  });

  test('navigation stays visible while scrolling', async ({ page }) => {
    await page.goto('/');
    await page.mouse.wheel(0, 1500);
    await page.waitForTimeout(600);
    const top = await page.locator('.site-header').evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBe(0);
    await expect(page.locator('.site-header')).toBeInViewport();
  });

  test('big images get a parallax offset while scrolling', async ({ page }) => {
    await page.goto('/about');
    const cover = page.locator('[data-parallax]').first();
    await cover.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 200);
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

test.describe('ambient background', () => {
  test('the hero dot field is decorative and never blocks clicks', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-field]')).toHaveAttribute('aria-hidden', 'true');
    // The grain sits over everything but lets clicks through
    await page.getByRole('link', { name: /See my work/ }).click();
    await expect(page).toHaveURL(/\/work\/?$/);
  });

  test('with reduced motion the field is drawn once and stays still', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/');
    const redraws = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          const ctx = document.querySelector<HTMLCanvasElement>('[data-field] canvas')!.getContext('2d')!;
          let n = 0;
          const clear = ctx.clearRect.bind(ctx);
          ctx.clearRect = (...args) => {
            n++;
            return clear(...args);
          };
          setTimeout(() => resolve(n), 800);
        }),
    );
    expect(redraws).toBe(0);
    await context.close();
  });
});
