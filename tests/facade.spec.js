import { test, expect } from '@playwright/test';

const url = '/services/facade-cleaning';
const questions = [
  'Is my building suitable for drone cleaning?',
  'Could cleaning damage the façade?',
  'Will the building need to close during cleaning?',
  'Do you need access to water on site?',
  'How is the price calculated?',
];

for (const width of [390, 768, 1440]) {
  test(`façade page is readable and responsive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [], videoRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (request.url().includes('hero-config.json')) videoRequests.push(request.url()); });
    const response = await page.goto(url);
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle('Façade Cleaning | DroneReach');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /façade cleaning.*heritage/);
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
    await expect(page.locator('.header-shell--solid')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Façade cleaning');
    await expect(page.locator('.service-description')).toHaveText('Drone-powered cleaning for commercial, industrial and heritage buildings.');
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('HomeServicesFaçade cleaning');
    await expect(page.locator('.service-benefits li')).toHaveText(['Less work at height', 'Less disruption', 'A tailored clean']);
    await expect(page.locator('.service-materials li')).toContainText(['Metal cladding', 'Glass & glazing', 'Masonry & stone', 'Hard-to-reach elevations']);
    await expect(page.locator('.service-page .steps h3')).toHaveText(['Tell us about your building', 'We assess and plan', 'We clean and review']);
    await expect(page.locator('.service-page .service-tile h3')).toHaveText(['Commercial', 'Industrial', 'Heritage']);
    await expect(page.locator('form,.contour-art')).toHaveCount(0);
    await expect(page.locator('.service-image-note')).toContainText('Illustrative concept imagery');
    await expect(page.locator('.service-page details')).toHaveCount(5);
    const geometry = await page.evaluate(() => {
      const hero = document.querySelector('.service-hero').getBoundingClientRect();
      const header = document.querySelector('.header-shell').getBoundingClientRect();
      return {
        top:hero.top, headerBottom:header.bottom, height:hero.height,
        introColumns:getComputedStyle(document.querySelector('.service-intro')).gridTemplateColumns.split(' ').length,
        cardColumns:getComputedStyle(document.querySelector('.service-page .service-grid')).gridTemplateColumns.split(' ').length,
        introImage:document.querySelector('.service-intro img').getBoundingClientRect().height,
        introWidth:document.querySelector('.service-intro img').getBoundingClientRect().width,
      };
    });
    expect(geometry.top).toBeCloseTo(geometry.headerBottom, 0);
    expect(geometry.height).toBeLessThan(900);
    expect(geometry.height).toBeGreaterThanOrEqual(440);
    expect(geometry.introColumns).toBe(width < 900 ? 1 : 2);
    expect(geometry.cardColumns).toBe(width < 600 ? 1 : 3);
    expect(geometry.introWidth / geometry.introImage).toBeCloseTo(width < 600 ? 1.2 : width < 900 ? 1.6 : 1.25, 1);
    for (const image of await page.locator('.service-page img').all()) {
      expect(Number(await image.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(await image.getAttribute('height'))).toBeGreaterThan(0);
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(element => element.decode());
      expect(await image.evaluate(element => element.naturalWidth > 0)).toBe(true);
      await expect(image).toHaveAttribute('alt', /Illustrative/);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    expect(videoRequests).toEqual([]);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path:`test-results/facade-${width}.png`, fullPage:true });
  });
}

test('homepage façade card opens the service; quotes, sectors and breadcrumbs use intended routes', async ({ page }) => {
  await page.goto('/');
  await page.locator('a[href="/services/facade-cleaning"]').click();
  await expect(page.locator('h1')).toHaveText('Façade cleaning');
  for (const quote of await page.getByRole('link', {name:'Get a quote',exact:true}).all()) await expect(quote).toHaveAttribute('href','/contact');
  await expect(page.getByRole('link', {name:'Get a quote',exact:true})).toHaveCount(3);
  const expected = ['/sectors/commercial-buildings','/sectors/warehouses-industrial','/sectors/heritage-buildings'];
  for(let i=0;i<3;i++) await expect(page.locator('.service-page .service-tile').nth(i)).toHaveAttribute('href',expected[i]);
  await expect(page.getByRole('navigation', {name:'Breadcrumb'}).getByRole('link',{name:'Home'})).toHaveAttribute('href','/');
  await expect(page.getByRole('navigation', {name:'Breadcrumb'}).getByRole('link',{name:'Services'})).toHaveAttribute('href','/services');
  await expect(page.getByRole('link',{name:'View all services'})).toHaveAttribute('href','/services');
});

test('FAQs start collapsed and support keyboard expansion, collapse and visible focus', async ({ page }) => {
  await page.goto(url);
  for (const detail of await page.locator('.service-faq details').all()) expect(await detail.evaluate(el => el.open)).toBe(false);
  for (let index=0;index<questions.length;index++) {
    const detail=page.locator('.service-faq details').nth(index);
    const summary=detail.locator('summary');
    await expect(summary).toHaveText(questions[index]);
    await expect(summary).toBeVisible();
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(summary).toBeFocused();
    await expect(detail).toHaveJSProperty('open',true);
    await expect(detail.locator('p')).toBeVisible();
    expect(await summary.evaluate(el=>getComputedStyle(el).outlineStyle)).toBe('solid');
    expect(await detail.locator('.faq-icon').evaluate(el=>getComputedStyle(el,'::before').content)).toBe('"−"');
    await page.keyboard.press('Space');
    await expect(detail.locator('p')).toBeHidden();
    expect(await detail.evaluate(el=>el.open)).toBe(false);
  }
});

test('service mobile menu retains shared keyboard behaviour', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto(url);
  const toggle=page.getByRole('button',{name:'Menu'});
  await toggle.focus();await page.keyboard.press('Enter');
  await expect(page.getByRole('navigation',{name:'Main navigation'})).toBeVisible();
  await page.keyboard.press('Tab');await expect(page.locator('header nav a').first()).toBeFocused();
  await page.keyboard.press('Escape');await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded','false');
});
