import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Pages to check. Add each new page here as it's built.
const pages = ['/'];

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
