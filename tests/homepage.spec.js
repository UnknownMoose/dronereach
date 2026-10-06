import { test, expect } from '@playwright/test';

const services = [
  ['Façade cleaning', '/services/facade-cleaning'],
  ['Cladding cleaning', '/services/cladding-cleaning'],
  ['Roof cleaning', '/services/roof-cleaning'],
  ['Window & glass cleaning', '/services/window-glass-cleaning'],
  ['Solar panel cleaning', '/services/solar-panel-cleaning'],
  ['Render cleaning', '/services/render-cleaning'],
  ['Signage cleaning', '/services/signage-cleaning'],
  ['Residential exterior cleaning', '/services/residential-exterior-cleaning'],
];

async function loadImages(page) {
  for (const image of await page.locator('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(element => element.decode());
  }
  await page.evaluate(() => document.fonts.ready);
}

async function expectNavigationRequest(page, destination, navigate) {
  // An intentional empty 404 response can use Chromium's internal error-page URL.
  // Verify the requested document destination rather than requiring an unfinished page.
  const [request] = await Promise.all([
    page.waitForRequest(request => request.isNavigationRequest() && new URL(request.url()).pathname === destination),
    navigate(),
  ]);
  expect(new URL(request.url()).pathname).toBe(destination);
}

async function tileAppearance(tile) {
  return tile.evaluate(element => {
    const image = element.querySelector('img');
    const title = element.querySelector('h3');
    const style = getComputedStyle(element);
    const bottom = getComputedStyle(element, '::after');
    const titleRect = title.getBoundingClientRect();
    const imageTransform = getComputedStyle(image).transform;
    return {
      overlayOpacity: Number(getComputedStyle(element, '::before').opacity),
      bottomGradient: bottom.backgroundImage,
      bottomOpacity: Number(bottom.opacity),
      scale: imageTransform === 'none' ? 1 : new DOMMatrix(imageTransform).a,
      titleColor: getComputedStyle(title).color,
      titleX: titleRect.x,
      titleY: titleRect.y,
      outlineStyle: style.outlineStyle,
      outlineWidth: parseFloat(style.outlineWidth),
    };
  });
}

for (const width of [390, 768, 1024, 1440]) {
  test(`homepage layout and imagery at ${width}px`, async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Specialist exterior cleaning for hard-to-reach buildings.');
    await expect(page.locator('.hero-photo img')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Specialist cleaning. From roofs to façades.' })).toBeVisible();
    await expect(page.locator('.service-tile')).toHaveCount(8);

    const grid = await page.locator('.service-grid').evaluate(element => {
      const style = getComputedStyle(element);
      return { columns: style.gridTemplateColumns.split(' ').length, gap: parseFloat(style.columnGap) };
    });
    expect(grid.columns).toBe(width >= 1200 ? 4 : width < 600 ? 1 : 2);
    expect(grid.gap).toBeGreaterThanOrEqual(width < 600 ? 16 : 20);
    expect(grid.gap).toBeLessThanOrEqual(24);

    for (const tile of await page.locator('.service-tile').all()) {
      const bounds = await tile.evaluate(element => {
        const card = element.getBoundingClientRect();
        const title = element.querySelector('h3').getBoundingClientRect();
        return { width: card.width, height: card.height, titleInside: title.left >= card.left && title.right <= card.right && title.top >= card.top && title.bottom <= card.bottom, noOverflow: element.scrollWidth <= element.clientWidth };
      });
      expect(bounds.noOverflow).toBe(true);
      expect(bounds.titleInside).toBe(true);
      if (width >= 1200) expect(bounds.width / bounds.height).toBeCloseTo(1, 1);
      if (width < 600) expect(bounds.width).toBeGreaterThan(bounds.height);
    }

    const headlineWord = page.locator('.no-break');
    expect(await headlineWord.evaluate(element => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getClientRects().length;
    })).toBe(1);

    await loadImages(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(pageErrors).toEqual([]);
    await page.evaluate(() => { document.activeElement.blur(); window.scrollTo(0, 0); });
    await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true });
  });
}

test('all eight photographic service cards are single links with the requested destinations', async ({ page }) => {
  await page.goto('/');
  const tiles = page.locator('.service-tile');
  await expect(tiles).toHaveCount(services.length);
  const imageSources = [];
  for (let index = 0; index < services.length; index++) {
    const [title, destination] = services[index];
    const tile = tiles.nth(index);
    await expect(tile).toHaveJSProperty('tagName', 'A');
    await expect(tile).toHaveAttribute('href', destination);
    await expect(tile.getByRole('heading', { level: 3 })).toHaveText(title);
    await expect(tile.locator('a, button, p')).toHaveCount(0);
    await expect(tile.locator('.service-arrow')).toHaveAttribute('aria-hidden', 'true');
    const image = tile.locator('img');
    await expect(image).toHaveAttribute('loading', 'lazy');
    expect(Number(await image.getAttribute('width'))).toBeGreaterThan(0);
    expect(Number(await image.getAttribute('height'))).toBeGreaterThan(0);
    imageSources.push(await image.getAttribute('src'));
  }
  expect(new Set(imageSources).size).toBe(8);
  await expect(page.locator('body')).not.toContainText(/gutter cleaning/i);
});

test('navigation, sectors, project and legal links use real page URLs', async ({ page }) => {
  await page.goto('/');
  const destinations = {
    'Services': '/services',
    'Our services': '/services',
    'View all services': '/services',
    'Sectors': '/sectors',
    'Case studies': '/case-studies',
    'View projects': '/case-studies',
    'About': '/about',
    'Contact': '/contact',
    'Get a quote': '/contact',
    'How it works': '/how-it-works',
    'Commercial buildings': '/sectors/commercial-buildings',
    'Warehouses & industrial': '/sectors/warehouses-industrial',
    'Homes & residential': '/services/residential-exterior-cleaning',
    'Privacy': '/privacy',
    'Terms': '/terms',
    'Cookies': '/cookies',
  };
  for (const [name, destination] of Object.entries(destinations)) {
    const links = page.getByRole('link', { name, exact: true });
    expect(await links.count(), `${name} is present`).toBeGreaterThan(0);
    for (const link of await links.all()) await expect(link).toHaveAttribute('href', destination);
  }
  for (const brand of await page.locator('a.brand').all()) await expect(brand).toHaveAttribute('href', '/');
  await expect(page.getByRole('link', { name: 'Explore the project' })).toHaveAttribute('href', /^\/case-studies\/[a-z0-9-]+$/);
  for (const link of await page.locator('a').all()) {
    if (await link.getAttribute('class') === 'skip-link') continue;
    expect(await link.getAttribute('href')).toMatch(/^\/(?!.*#)[a-z0-9/-]*$/);
  }
  await expect(page.locator('dialog, .cta, [data-quote], form')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('Tell us about your building.');
  await expect(page.locator('[data-review-placeholder]')).toContainText('Review placeholder');
  await expect(page.locator('.projects')).toContainText('Illustrative comparison — not completed DroneReach work.');
  const sectorSection = page.locator('.audience');
  await expect(sectorSection).toBeVisible();
  await expect(sectorSection).toContainText('Who we work with');
  const ordering = await page.evaluate(() => {
    const process = document.querySelector('.process');
    const sectors = Array.from(document.querySelectorAll('section')).find(section => section.textContent.includes('Who we work with'));
    const projects = document.querySelector('.projects');
    return Boolean(process.compareDocumentPosition(sectors) & Node.DOCUMENT_POSITION_FOLLOWING) && Boolean(sectors.compareDocumentPosition(projects) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(ordering).toBe(true);
});

test('hover and keyboard focus brighten photos while titles and their bottom gradient stay readable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const tile = page.locator('.service-tile').first();
  await tile.scrollIntoViewIfNeeded();
  const initial = await tileAppearance(tile);
  expect(initial.overlayOpacity).toBeGreaterThanOrEqual(0.35);
  expect(initial.scale).toBe(1);
  expect(initial.titleColor).toBe('rgb(255, 255, 255)');
  expect(initial.bottomGradient).toContain('linear-gradient');
  expect(initial.bottomOpacity).toBeGreaterThanOrEqual(0.9);

  await tile.hover();
  await expect.poll(async () => (await tileAppearance(tile)).overlayOpacity).toBeLessThan(0.15);
  const hovered = await tileAppearance(tile);
  expect(hovered.scale).toBeCloseTo(1.03, 2);
  expect(hovered.titleX).toBeCloseTo(initial.titleX, 1);
  expect(hovered.titleY).toBeCloseTo(initial.titleY, 1);
  expect(hovered.bottomGradient).toBe(initial.bottomGradient);
  expect(hovered.titleColor).toBe(initial.titleColor);

  await page.mouse.move(0, 0);
  await page.locator('.services .text-link').focus();
  await page.keyboard.press('Tab');
  await expect(tile).toBeFocused();
  await expect.poll(async () => (await tileAppearance(tile)).overlayOpacity).toBeLessThan(0.15);
  const focused = await tileAppearance(tile);
  expect(focused.outlineStyle).not.toBe('none');
  expect(focused.outlineWidth).toBeGreaterThanOrEqual(2);
  expect(focused.scale).toBeCloseTo(1.03, 2);
  expect(focused.titleX).toBeCloseTo(initial.titleX, 1);
  expect(focused.titleY).toBeCloseTo(initial.titleY, 1);
  await expectNavigationRequest(page, '/services/facade-cleaning', () => page.keyboard.press('Enter'));
});

test('mobile menu supports keyboard dismissal and real-route navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Menu' });
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await toggle.click();
  await expectNavigationRequest(page, '/services', () => navigation.getByRole('link', { name: 'Services', exact: true }).click());
});

test('touch cards retain their readable overlay and navigate with a single tap', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  try {
    await page.goto('http://127.0.0.1:5173/');
    expect(await page.evaluate(() => matchMedia('(hover: none)').matches)).toBe(true);
    const tile = page.locator('.service-tile').last();
    await tile.scrollIntoViewIfNeeded();
    expect((await tileAppearance(tile)).overlayOpacity).toBeGreaterThanOrEqual(0.35);
    await expectNavigationRequest(page, '/services/residential-exterior-cleaning', () => tile.tap());
  } finally {
    await context.close();
  }
});

test('reduced motion removes image animation and transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const tile = page.locator('.service-tile').first();
  await tile.hover();
  const motion = await tile.evaluate(element => {
    const imageStyle = getComputedStyle(element.querySelector('img'));
    const overlayStyle = getComputedStyle(element, '::before');
    return { imageDuration: imageStyle.transitionDuration, overlayDuration: overlayStyle.transitionDuration, imageTransform: imageStyle.transform };
  });
  for (const duration of [motion.imageDuration, motion.overlayDuration]) expect(duration.split(',').every(value => parseFloat(value) <= 0.01)).toBe(true);
  expect(motion.imageTransform).toBe('none');
});

test('skip link stays hidden until focused and transfers focus to main', async ({ page }) => {
  await page.goto('/');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  expect(await skip.evaluate(element => getComputedStyle(element).clipPath)).toBe('inset(50%)');
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  expect(await skip.evaluate(element => element.getBoundingClientRect().top)).toBe(12);
  expect(await skip.evaluate(element => getComputedStyle(element).clipPath)).toBe('none');
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('brand colours and pale backgrounds use the exact navy and blue palette', async ({ page }) => {
  await page.goto('/');
  const palette = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const context = document.createElement('canvas').getContext('2d');
    const colour = (selector, property, pseudo) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = getComputedStyle(document.querySelector(selector), pseudo)[property];
      context.fillRect(0, 0, 1, 1);
      return Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
    };
    return {
      navyToken: root.getPropertyValue('--navy').trim().toLowerCase(),
      blueToken: root.getPropertyValue('--brand-blue').trim().toLowerCase(),
      heading: colour('h1', 'color'),
      sectionHeading: colour('.services h2', 'color'),
      darkButton: colour('.button.navy', 'backgroundColor'),
      blueButton: colour('.button.cyan', 'backgroundColor'),
      blueButtonText: colour('.button.cyan', 'color'),
      headlineAccent: colour('h1 > span', 'color'),
      benefitIcon: colour('.benefit-icon', 'color'),
      cardOverlay: colour('.service-tile', 'backgroundColor', '::before'),
      subtleBackground: colour('footer', 'backgroundColor'),
      processBackground: colour('.process', 'backgroundColor'),
      reviewBackground: colour('.feedback', 'backgroundColor'),
    };
  });
  expect(palette.navyToken).toBe('#13294a');
  expect(palette.blueToken).toBe('#2b9fd6');
  for (const name of ['heading', 'sectionHeading', 'darkButton', 'blueButtonText', 'cardOverlay']) expect(palette[name], name).toEqual([19, 41, 74]);
  for (const name of ['blueButton', 'headlineAccent', 'benefitIcon']) expect(palette[name], name).toEqual([43, 159, 214]);
  // Expected rendered sRGB mixes of the brand blue with white at 10% and 18%.
  expect(palette.subtleBackground).toEqual([234, 245, 251]);
  expect(palette.processBackground).toEqual([217, 238, 248]);
  expect(palette.reviewBackground).toEqual([217, 238, 248]);
});

test('contour artwork stays decorative and clipped to the hero and process sections', async ({ page }) => {
  await page.goto('/');
  const contours = page.locator('.contour-art');
  await expect(contours).toHaveCount(2);
  for (const contour of await contours.all()) {
    await expect(contour).toHaveAttribute('aria-hidden', 'true');
    const decoration = await contour.evaluate(element => {
      const style = getComputedStyle(element);
      return {
        intendedSection: element.parentElement.matches('.hero-band, .process'),
        pointerEvents: style.pointerEvents,
        sectionOverflow: getComputedStyle(element.parentElement).overflow,
        mask: style.maskImage,
        repeat: style.maskRepeat,
        interactiveDescendants: element.querySelectorAll('a, button, input, [tabindex]').length,
      };
    });
    expect(decoration.intendedSection).toBe(true);
    expect(decoration.pointerEvents).toBe('none');
    expect(['hidden', 'clip']).toContain(decoration.sectionOverflow);
    expect(decoration.mask).toContain('/patterns/contours.svg');
    expect(decoration.repeat.split(',').every(value => value.trim() === 'no-repeat')).toBe(true);
    expect(decoration.interactiveDescendants).toBe(0);
  }
});
