import { test, expect } from '@playwright/test';

const catalogue = [
  ['Façade cleaning', '/services/facade-cleaning'],
  ['Cladding cleaning', '/services/cladding-cleaning'],
  ['Roof cleaning', '/services/roof-cleaning'],
  ['Window & glass cleaning', '/services/window-glass-cleaning'],
  ['Solar panel cleaning', '/services/solar-panel-cleaning'],
  ['Render cleaning', '/services/render-cleaning'],
  ['Shopfront & signage cleaning', '/services/shopfront-signage-cleaning'],
  ['Heritage building cleaning', '/services/heritage-building-cleaning'],
];
const routes = [...catalogue, ['Specialist cleaning. From roofs to façades.', '/services'], ['Get a quote', '/contact']];
const knownPaths = new Set(['/', '/drone-cleaning-safety-compliance', ...routes.map(([, path]) => path)]);

for (const width of [390, 768, 1440]) {
  for (const [title, path] of routes) {
    test(`${path} loads directly and refreshes with complete HTML at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const response = await page.goto(path);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toContain('<footer>');
      expect(html).toContain('<h1');
      expect(html).not.toContain('<!-- page');
      await expect(page.locator('header.site-header')).toHaveCount(1);
      await expect(page.locator('footer')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(title);
      await expect(page.locator('.header-shell--solid')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://dronereach.co.uk${path}`);
      expect((await page.title()).length).toBeGreaterThan(15);
      expect((await page.locator('meta[name="description"]').getAttribute('content')).length).toBeGreaterThan(60);
      if (path !== '/contact') await expect(page.locator('form,input,textarea,select,.contour-art')).toHaveCount(0);
      await expect(page.locator('body')).not.toContainText(/form coming soon|phone and email to be added|gutter cleaning|residential cleaning/i);
      const serviceLinks = page.locator('#services-menu a').all();
      expect((await serviceLinks).length).toBe(9);
      for (const [name, href] of catalogue) {
        await expect(page.locator('footer').getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
      }
      for (const link of await page.locator('a').all()) {
        const href = await link.getAttribute('href');
        if (href === '#main' || href === 'mailto:contact@dronereach.co.uk') continue;
        expect(knownPaths.has(href), `implemented link: ${href}`).toBe(true);
        if (/get a quote/i.test(await link.textContent())) expect(href).toBe('/contact');
      }
      for (const image of await page.locator('main img').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(element => element.decode());
        expect(await image.evaluate(element => element.naturalWidth > 0)).toBe(true);
        await expect(image).toHaveAttribute('alt', /^Illustrative/);
        expect(Number(await image.getAttribute('width'))).toBeGreaterThan(0);
        expect(Number(await image.getAttribute('height'))).toBeGreaterThan(0);
        if (!await image.evaluate(el => el.classList.contains('service-hero-image'))) await expect(image).toHaveAttribute('loading', 'lazy');
      }
      if (path.startsWith('/services/')) {
        const faqs = page.locator('.service-faq details');
        expect(await faqs.count()).toBeGreaterThanOrEqual(4);
        expect(await faqs.count()).toBeLessThanOrEqual(5);
        const first = faqs.first();
        await first.locator('summary').focus();
        await page.keyboard.press('Enter');
        await expect(first).toHaveJSProperty('open', true);
        await expect(first.locator('p')).toBeVisible();
        expect(await first.locator('summary').evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
        await page.keyboard.press('Space');
        await expect(first).toHaveJSProperty('open', false);
        await expect(page.locator('.service-benefits li')).toHaveCount(3);
        await expect(page.locator('.steps h3')).toHaveText(['Tell us about your building', 'We assess and plan', 'We clean and review']);
      } else if (path === '/services') {
        await expect(page.locator('main a.service-tile')).toHaveCount(8);
        await expect(page.locator('.overview-service p')).toHaveCount(8);
      } else {
        await expect(page.locator('.page-intro-copy>p:not(.eyebrow)')).toHaveText('Tell us about your building and what needs cleaning. We’ll review the details and get back to you to discuss the next step.');
        await expect(page.locator('.quote-checklist li')).toHaveText(['Building location or postcode', 'Type of building and surfaces', 'Approximate size or height', 'Photos of the areas needing cleaning', 'Preferred timescale']);
        await expect(page.locator('main a[href="mailto:contact@dronereach.co.uk"]').first()).toBeVisible();
        await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
      }
      const clipping = await page.locator('main h1,main h2,main h3,main p,main li').evaluateAll(elements => elements.filter(el => !el.matches('.steps li') && el.scrollWidth > el.clientWidth + 1).map(el => el.textContent));
      expect(clipping).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.evaluate(() => { document.activeElement.blur(); scrollTo(0, 0); });
      await page.screenshot({ path: `test-results/${path.slice(1).replaceAll('/', '-')}-${width}.png`, fullPage: true });
      expect((await page.reload()).status()).toBe(200);
      await expect(page.locator('h1')).toHaveText(title);
      expect(errors).toEqual([]);
    });
  }
}

for (const width of [390, 768, 1440]) {
  test(`Services disclosure supports keyboard, focus and dismissal at ${width}px`, async ({ page }) => {
    await page.setViewportSize({width,height:900});
    await page.goto('/services/cladding-cleaning');
    const menu = page.locator('.menu-toggle');
    if (width < 900) { await menu.focus(); await page.keyboard.press('Enter'); }
    const toggle = page.locator('.services-toggle');
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded','true');
    await expect(page.locator('#services-menu')).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.locator('#services-menu a').first()).toBeFocused();
    expect(await page.locator('#services-menu a').first().evaluate(el=>getComputedStyle(el).outlineStyle)).toBe('solid');
    expect(await page.locator('#services-menu').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;})).toBe(true);
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    await expect(page.locator('#services-menu')).toBeHidden();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#services-menu a').first()).toBeFocused();
    await page.keyboard.press('Escape');
    if (width<900) {
      await page.keyboard.press('Escape');
      await expect(menu).toBeFocused();
      await expect(menu).toHaveAttribute('aria-expanded','false');
      await menu.click();
    }
    await toggle.click();
    await page.locator('h1').click();
    await expect(toggle).toHaveAttribute('aria-expanded','false');
  });
}

test('touch Services menu navigates in one tap and native FAQs expand without hover', async ({browser}) => {
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();
  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.locator('.menu-toggle').tap();
    await page.locator('.services-toggle').tap();
    await page.locator('#services-menu').getByRole('link',{name:'Heritage building cleaning',exact:true}).tap();
    await expect(page).toHaveURL(/\/services\/heritage-building-cleaning$/);
    const detail=page.locator('.service-faq details').first();
    await detail.locator('summary').tap();
    await expect(detail).toHaveJSProperty('open',true);
    await detail.locator('summary').tap();
    await expect(detail).toHaveJSProperty('open',false);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  } finally { await context.close(); }
});

test('all page metadata and service FAQs are distinct, including without JavaScript', async ({browser}) => {
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  const titles=[],descriptions=[],questions=[];
  try {
    for(const [,path] of routes) {
      await page.goto(`http://127.0.0.1:5173${path}`);
      titles.push(await page.title());
      descriptions.push(await page.locator('meta[name="description"]').getAttribute('content'));
      if(path.startsWith('/services/')) questions.push((await page.locator('summary').allTextContents()).join('|'));
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
    }
    expect(new Set(titles).size).toBe(10);
    expect(new Set(descriptions).size).toBe(10);
    expect(new Set(questions).size).toBe(8);
  } finally {await context.close();}
});
