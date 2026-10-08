import { test, expect } from '@playwright/test';
import { renderPage } from '../src/site/layout.js';

test('global components and page metadata are present in the initial homepage HTML', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  try {
    const response = await page.goto('http://127.0.0.1:5173/');
    const html = await response.text();
    expect(html).toContain('<header class="site-header container">');
    expect(html).toContain('<footer>');
    expect(html).not.toContain('<!-- page');
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Get a quote', exact: true }).first()).toBeVisible();
    await expect(page).toHaveTitle('DroneReach — Specialist exterior cleaning');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'DroneReach specialist exterior cleaning for commercial, industrial and heritage buildings in the North East.');
    await expect(page.locator('.header-shell--hero')).toHaveCount(1);
  } finally {
    await context.close();
  }
});

for (const width of [390, 1440]) {
  test(`shared layout supports an inner page with a solid header at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const title = 'Inner page & "metadata" <check>';
    const description = 'Approved description with "quotes", <text> & ampersands.';
    // This route is only a test response; no public placeholder page is created.
    await page.route('**/__test__/inner/nested/', route => route.fulfill({
      contentType: 'text/html',
      body: renderPage({ title, description, headerVariant: 'solid' }, '<section class="container section"><h1>Inner page layout</h1><p>Page-specific content.</p></section>'),
    }));
    const errors = [], videoRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (request.url().includes('hero-config.json')) videoRequests.push(request.url()); });
    await page.goto('/__test__/inner/nested/');
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description);
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Inner page layout');
    await expect(page.locator('main .hero-band')).toHaveCount(0);
    const layout = await page.evaluate(() => ({
      background: getComputedStyle(document.querySelector('.header-shell')).backgroundColor,
      headerBottom: document.querySelector('.header-shell').getBoundingClientRect().bottom,
      contentTop: document.querySelector('main').getBoundingClientRect().top,
      overflow: document.documentElement.scrollWidth > innerWidth,
    }));
    expect(layout.background).toBe('rgb(0, 0, 0)');
    expect(layout.contentTop).toBeGreaterThanOrEqual(layout.headerBottom);
    expect(layout.overflow).toBe(false);
    for (const link of await page.locator('header a,footer a').all()) expect(await link.getAttribute('href')).toMatch(/^(\/|mailto:)/);
    await expect(page.locator('header nav a').first()).toHaveAttribute('href', '/services');
    await expect(page.locator('footer')).toContainText('contact@dronereach.co.uk');
    if (width < 900) {
      const toggle = page.getByRole('button', { name: 'Menu' });
      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByRole('navigation')).toBeVisible();
      await page.keyboard.press('Tab');
      await expect(page.locator('.services-toggle')).toBeFocused();
      expect(await page.locator('.services-toggle').evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
      await page.keyboard.press('Escape');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(toggle).toBeFocused();
      await toggle.click();
      await page.setViewportSize({ width: 1024, height: 1000 });
      await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
    }
    await page.locator('.services-toggle').click();
    const [request] = await Promise.all([
      page.waitForRequest(request => request.isNavigationRequest() && new URL(request.url()).pathname === '/services'),
      page.locator('header nav a').first().click(),
    ]);
    expect(new URL(request.url()).pathname).toBe('/services');
    expect(videoRequests).toEqual([]);
    expect(errors).toEqual([]);
  });
}
