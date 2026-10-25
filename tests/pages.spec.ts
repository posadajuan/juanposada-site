import { test, expect } from '@playwright/test';

test('every main page loads with a single h1 and the right nav item active', async ({ page, isMobile }) => {
  const routes: [string, string | null][] = [
    ['/', null],
    ['/work', 'Work'],
    ['/work/cyber-explorers', 'Work'],
    ['/photography', 'Photography'],
    ['/about', 'About'],
    ['/contact', 'Contact'],
  ];
  for (const [path, active] of routes) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator('h1'), path).toHaveCount(1);
    if (active && !isMobile) {
      await expect(page.locator('[data-menu] a[aria-current="page"]'), path).toHaveText(active);
    }
  }
});

test('home features projects and links through to the case study', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('a.card[href="/work/cyber-explorers"]');
  await expect(card).toBeVisible();
  await card.click();
  await expect(page).toHaveURL(/\/work\/cyber-explorers\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cyber Explorers');
});

test('work lists case studies and collections', async ({ page }) => {
  await page.goto('/work');
  await expect(page.getByRole('heading', { name: 'Case studies' })).toBeVisible();
  await expect(page.locator('a.card[href="/work/cyber-explorers"]')).toBeVisible();
  await expect(page.locator('a.gcard[href="/work/logos"]')).toBeVisible();
  await expect(page.locator('a.gcard[href="/work/graphic-pieces"]')).toBeVisible();
});

test('case study shows snapshot, all five sections and a way onwards', async ({ page }) => {
  await page.goto('/work/cyber-explorers');
  await expect(page.getByLabel('Project snapshot')).toContainText('Role');
  for (const id of ['problem', 'research', 'solution', 'impact', 'reflection']) {
    await expect(page.locator(`section#${id}`)).toHaveCount(1);
  }
  await expect(page.getByText(/\d+ min read/)).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Next project' }).getByRole('link')).toBeVisible();
});

test('gallery pages show their items and open the viewer', async ({ page }) => {
  await page.goto('/work/logos');
  const tiles = page.locator('a[data-lightbox]');
  expect(await tiles.count()).toBeGreaterThan(0);
  await tiles.first().click();
  await expect(page.locator('dialog[open]')).toBeVisible();
  await page.keyboard.press('Escape');

  await page.goto('/work/graphic-pieces');
  expect(await page.locator('a[data-lightbox]').count()).toBeGreaterThan(0);
});

test('photography shows each series with its photos', async ({ page }) => {
  await page.goto('/photography');
  const series = page.locator('section.series');
  expect(await series.count()).toBeGreaterThan(0);
  expect(await series.first().locator('a[data-lightbox]').count()).toBeGreaterThan(0);
});

test('contact form explains missing fields', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByLabel('Name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Please add your name.')).toBeVisible();
  await expect(page.getByLabel('Name')).toBeFocused();
});

test('contact topics can be picked', async ({ page }) => {
  await page.goto('/contact');
  const product = page.getByRole('checkbox', { name: 'Product' });
  await product.check({ force: true });
  await expect(product).toBeChecked();
});

test('contact form fails gracefully when the message cannot be sent', async ({ page }) => {
  await page.route('**/api/contact', (route) => route.fulfill({ status: 500, body: 'error' }));
  await page.goto('/contact');
  await page.getByLabel('Name').fill('Test Person');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Message').fill('Hello there');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'couldn’t be sent' })).toBeVisible();
});

test('contact form shows the thank-you state on success', async ({ page }) => {
  await page.route('**/api/contact', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  await page.goto('/contact');
  await page.getByLabel('Name').fill('Test Person');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Message').fill('Hello there');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('heading', { name: /message sent/ })).toBeVisible();
});

test('unknown addresses show the friendly 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('detour');
});
