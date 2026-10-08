import { test, expect } from '@playwright/test';

const services = [
  ['Façade cleaning', '/services/facade-cleaning'],
  ['Cladding cleaning', '/services/cladding-cleaning'],
  ['Roof cleaning', '/services/roof-cleaning'],
  ['Window & glass cleaning', '/services/window-glass-cleaning'],
  ['Solar panel cleaning', '/services/solar-panel-cleaning'],
  ['Render cleaning', '/services/render-cleaning'],
  ['Signage cleaning', '/services/signage-cleaning'],
  ['Residential cleaning', '/services/residential-exterior-cleaning'],
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
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Exterior Building Cleaning');
    await expect(page.locator('.hero-background')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Specialist cleaning. From roofs to façades.' })).toBeVisible();
    await expect(page.locator('.service-tile')).toHaveCount(8);

    const grid = await page.locator('.service-grid').evaluate(element => {
      const style = getComputedStyle(element);
      return { columns: style.gridTemplateColumns.split(' ').length, gap: parseFloat(style.columnGap) };
    });
    expect(grid.columns).toBe(width >= 1200 ? 4 : width < 600 ? 1 : 2);
    expect(grid.gap).toBeGreaterThanOrEqual(width < 600 ? 16 : 20);
    expect(grid.gap).toBeLessThanOrEqual(24);

    const benefitLayout = await page.locator('.benefits-section').evaluate(section => {
      const grid = section.querySelector('.benefits');
      const style = getComputedStyle(section);
      const rect = section.getBoundingClientRect();
      return {
        left: rect.left,
        width: rect.width,
        columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
        top: parseFloat(style.paddingTop),
        bottom: parseFloat(style.paddingBottom),
        items: Array.from(grid.children, item => {
          const icon = item.querySelector('.benefit-icon').getBoundingClientRect();
          const heading = item.querySelector('h2');
          const paragraph = item.querySelector('p');
          const itemStyle = getComputedStyle(item);
          const paragraphStyle = getComputedStyle(paragraph);
          return {
            iconWidth: icon.width,
            iconHeight: icon.height,
            headingSize: parseFloat(getComputedStyle(heading).fontSize),
            paragraphSize: parseFloat(paragraphStyle.fontSize),
            paragraphLineHeight: parseFloat(paragraphStyle.lineHeight),
            fits: heading.scrollWidth <= heading.clientWidth && heading.scrollHeight <= heading.clientHeight && paragraph.scrollWidth <= paragraph.clientWidth && paragraph.scrollHeight <= paragraph.clientHeight,
            shadow: itemStyle.boxShadow,
            borderWidth: parseFloat(itemStyle.borderTopWidth),
            background: itemStyle.backgroundColor,
          };
        }),
      };
    });
    expect(benefitLayout.left).toBe(0);
    expect(benefitLayout.width).toBe(width);
    expect(benefitLayout.columns).toBe(width >= 1200 ? 4 : width < 600 ? 1 : 2);
    expect(benefitLayout.top).toBe(width < 600 ? 48 : 72);
    expect(benefitLayout.bottom).toBe(width < 600 ? 48 : 72);
    expect(benefitLayout.items).toHaveLength(4);
    for (const item of benefitLayout.items) {
      expect(item.iconWidth).toBe(52);
      expect(item.iconHeight).toBe(52);
      expect(item.headingSize).toBe(24);
      expect(item.paragraphSize).toBe(16);
      expect(item.paragraphLineHeight).toBeCloseTo(26.4, 1);
      expect(item.fits).toBe(true);
      expect(item.shadow).toBe('none');
      expect(item.borderWidth).toBe(0);
      expect(item.background).toBe('rgba(0, 0, 0, 0)');
    }

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

    const circles = await page.locator('.step-number').evaluateAll(elements => elements.map(element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return { background: style.backgroundColor, color: style.color, width: rect.width, height: rect.height };
    }));
    expect(circles).toHaveLength(3);
    for (const circle of circles) {
      expect(circle.background).toBe('rgb(0, 150, 214)');
      expect(circle.color).toBe('rgb(0, 0, 0)');
      expect(circle.width).toBe(width < 600 ? 44 : 48);
      expect(circle.height).toBe(circle.width);
    }
    const supportingText = await page.locator('.benefits p, footer p, footer a').evaluateAll(elements => elements.map(element => ({
      text: element.textContent.trim(),
      fontSize: parseFloat(getComputedStyle(element).fontSize),
      fits: element.scrollWidth <= element.clientWidth,
    })));
    for (const item of supportingText) {
      expect(item.fontSize, item.text).toBeGreaterThanOrEqual(14);
      expect(item.fits, item.text).toBe(true);
    }
    const audience = await page.locator('.audience').evaluate(element => {
      const style = getComputedStyle(element);
      return { top: parseFloat(style.paddingTop), bottom: parseFloat(style.paddingBottom), linkSizes: Array.from(element.querySelectorAll('.audience-links a'), link => parseFloat(getComputedStyle(link).fontSize)) };
    });
    expect(audience.top).toBe(width < 600 ? 42 : 56);
    expect(audience.bottom).toBe(width < 600 ? 20 : 36);
    expect(audience.linkSizes).toEqual([17, 17, 17]);


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

test('four drone-cleaning benefits form a separate semantic section between the hero and services', async ({ page }) => {
  await page.goto('/');
  const section = page.getByRole('region', { name: 'Benefits of drone cleaning' });
  await expect(section).toBeVisible();
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(['Safer', 'Faster', 'Cost-effective', 'Precision cleaning']);
  await expect(section.locator('.benefits > li p')).toHaveText([
    'Keep cleaning crews on the ground. Drone cleaning reduces the need to work at height, helping limit exposure to the risks associated with ladders, scaffolding and access platforms.',
    'Up to 5 times faster than conventional cleaning methods on suitable jobs. Less time setting up and repositioning access equipment means more time cleaning and less disruption to your site.',
    'On suitable jobs, drone access can remove the need to hire mobile access platforms or erect scaffolding. Less setup and fewer access requirements can help lower costs and minimise disruption.',
    'Bring the clean directly to hard-to-reach surfaces. A controlled, targeted approach allows the cleaning method to be matched to the material and condition of each area.',
  ]);
  await expect(section.locator('.benefits > li')).toHaveCount(4);
  await expect(section.locator('.benefit-icon > svg')).toHaveCount(4);
  for (const icon of await section.locator('.benefit-icon').all()) await expect(icon).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.hero .benefits')).toHaveCount(0);
  await expect(section.locator('.contour-art')).toHaveCount(0);
  expect(await section.evaluate(element => {
    const hero = document.querySelector('.hero-band');
    const services = document.querySelector('.services');
    return Boolean(hero.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) && Boolean(element.compareDocumentPosition(services) & Node.DOCUMENT_POSITION_FOLLOWING);
  })).toBe(true);
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
  expect(initial.overlayOpacity).toBeCloseTo(0.22, 2);
  expect(initial.scale).toBe(1);
  expect(initial.titleColor).toBe('rgb(255, 255, 255)');
  expect(initial.bottomGradient).toContain('linear-gradient');
  expect(initial.bottomOpacity).toBeGreaterThanOrEqual(0.9);

  await tile.hover();
  await expect.poll(async () => (await tileAppearance(tile)).overlayOpacity).toBeLessThan(0.15);
  await expect.poll(async () => (await tileAppearance(tile)).scale).toBeCloseTo(1.03, 2);
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
  await expect.poll(async () => (await tileAppearance(tile)).scale).toBeCloseTo(1.03, 2);
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
    expect((await tileAppearance(tile)).overlayOpacity).toBeCloseTo(0.22, 2);
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

test('shared palette uses only exact brand blue, pure black and white', async ({ page }) => {
  await page.goto('/');
  const palette = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const context = document.createElement('canvas').getContext('2d');
    const rgba = value => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      return Array.from(context.getImageData(0, 0, 1, 1).data);
    };
    const colour = (selector, property, pseudo) => rgba(getComputedStyle(document.querySelector(selector), pseudo)[property]).slice(0, 3);
    const blueSurfaces = [];
    const unapproved = [];
    const allowed = [[0, 0, 0], [255, 255, 255], [0, 150, 214]];
    const isApproved = colour => allowed.some(value => value.every((channel, i) => channel === colour[i]));
    for (const element of document.querySelectorAll('*')) {
      for (const pseudo of [null, '::before', '::after']) {
        const style = getComputedStyle(element, pseudo);
        const [r, g, b, a] = rgba(style.backgroundColor);
        if (a > 0 && !isApproved([r, g, b])) unapproved.push({element: element.className, pseudo, property: 'background', value: style.backgroundColor});
        if (!isApproved(rgba(style.color))) unapproved.push({element: element.className, pseudo, property: 'color', value: style.color});
        if (style.boxShadow !== 'none') unapproved.push({element: element.className, property: 'shadow', value: style.boxShadow});
        if (a > 0 && b > g && g > r) blueSurfaces.push({r, g, b, a, opacity: style.opacity});
      }
    }
    return {
      blueToken: root.getPropertyValue('--brand-blue').trim().toLowerCase(),
      obsoleteTokens: ['--navy', '--cyan', '--pale', '--blue', '--blue-accent', '--navy-hover', '--ink', '--surface', '--border', '--muted', '--label', '--on-dark-muted', '--on-dark-border', '--blue-hover', '--link', '--link-hover'].map(name => root.getPropertyValue(name).trim()),
      heading: colour('h1', 'color'),
      sectionHeading: colour('.services h2', 'color'),
      blueButton: colour('.button.primary', 'backgroundColor'),
      blueButtonText: colour('.button.primary', 'color'),
      benefitIcon: colour('.benefit-icon', 'color'),
      benefitIconBackground: colour('.benefit-icon', 'backgroundColor'),
      cardOverlay: colour('.service-tile', 'backgroundColor', '::before'),
      benefitBackground: colour('.benefits-section', 'backgroundColor'),
      footerBackground: colour('footer', 'backgroundColor'),
      footerText: colour('.footer-grid p', 'color'),
      processBackground: colour('.process', 'backgroundColor'),
      processText: colour('.steps p', 'color'),
      reviewBackground: colour('.feedback', 'backgroundColor'),
      contourColour: colour('.contour-art', 'backgroundColor'),
      blueSurfaces,
      unapproved,
    };
  });
  expect(palette.blueToken).toBe('#0096d6');
  expect(palette.unapproved).toEqual([]);
  expect(palette.obsoleteTokens.every(value => value === '')).toBe(true);
  expect(palette.heading).toEqual([255, 255, 255]);
  for (const name of ['sectionHeading', 'blueButtonText', 'cardOverlay', 'footerBackground', 'processBackground']) expect(palette[name], name).toEqual([0, 0, 0]);
  for (const name of ['blueButton', 'benefitIcon']) expect(palette[name], name).toEqual([0, 150, 214]);
  expect(palette.contourColour).toEqual([0, 150, 214]);
  expect(palette.benefitIconBackground).toEqual([255, 255, 255]);
  for (const name of ['benefitBackground', 'reviewBackground']) expect(palette[name], name).toEqual([255, 255, 255]);
  for (const name of ['footerText', 'processText']) expect(palette[name], name).toEqual([255, 255, 255]);
  expect(palette.blueSurfaces.length).toBeGreaterThan(0);
  for (const surface of palette.blueSurfaces) {
    expect(surface).toEqual({r: 0, g: 150, b: 214, a: 255, opacity: '1'});
  }
});

for (const width of [390, 1440]) {
  test(`buttons, links and image overlays preserve contrast through interaction at ${width}px`, async ({ page }) => {
    await page.setViewportSize({width, height: 1000});
    await page.goto('/');
    const primary = page.locator('.hero-actions .primary');
    const snapshot = async locator => locator.evaluate(element => {
      const context = document.createElement('canvas').getContext('2d');
      const rgb = colour => { context.fillStyle = colour; context.fillRect(0, 0, 1, 1); return Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3); };
      const style = getComputedStyle(element);
      return {background: rgb(style.backgroundColor), foreground: rgb(style.color)};
    });
    const luminance = rgb => rgb.map(value => { const v = value / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum, value, i) => sum + value * [.2126, .7152, .0722][i], 0);
    const contrast = (fg, bg) => { const [a, b] = [luminance(fg), luminance(bg)].sort((a, b) => b - a); return (a + .05) / (b + .05); };
    const assertContrast = async (selector, background) => {
      const sample = await snapshot(page.locator(selector).first());
      expect(contrast(sample.foreground, background || sample.background), selector).toBeGreaterThanOrEqual(4.5);
      return sample;
    };
    const normal = await assertContrast('.hero-actions .primary');
    expect(normal.background).toEqual([0, 150, 214]);
    await primary.hover();
    await expect.poll(async () => (await snapshot(primary)).background).toEqual([0, 0, 0]);
    const hover = await assertContrast('.hero-actions .primary');
    expect(hover.foreground).toEqual([255, 255, 255]);
    await page.mouse.down();
    await assertContrast('.hero-actions .primary');
    await page.mouse.move(0, 0); await page.mouse.up();
    await primary.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(primary).toBeFocused();
    expect(await primary.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
    await assertContrast('.hero-actions .outline');
    await assertContrast('.services .text-link', [255, 255, 255]);
    await assertContrast('.audience-links a', [255, 255, 255]);
    await assertContrast('.benefits p', [255, 255, 255]);
    await assertContrast('.steps p', [0, 0, 0]);
    await assertContrast('.process .text-link', [0, 0, 0]);
    await assertContrast('.footer-grid a:not(.brand)', [0, 0, 0]);
    await page.locator('.footer-grid a:not(.brand)').first().hover();
    await assertContrast('.footer-grid a:not(.brand)', [0, 0, 0]);
    const images = await page.locator('.hero-background,.hero-video,.service-tile img,.facade img').evaluateAll(elements => elements.map(el => getComputedStyle(el).filter));
    expect(images.every(filter => filter === 'none')).toBe(true);
    if (width < 900) {
      await page.getByRole('button', {name: 'Menu'}).click();
      await expect(page.locator('nav')).toBeVisible();
      expect((await snapshot(page.locator('nav'))).background).toEqual([0, 0, 0]);
      await assertContrast('nav .primary');
      await page.screenshot({path: `test-results/palette-menu-${width}.png`});
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('contour artwork stays decorative and clipped to the process section', async ({ page }) => {
  await page.goto('/');
  const contours = page.locator('.contour-art');
  await expect(contours).toHaveCount(1);
  for (const contour of await contours.all()) {
    await expect(contour).toHaveAttribute('aria-hidden', 'true');
    const decoration = await contour.evaluate(element => {
      const style = getComputedStyle(element);
      return {
        intendedSection: element.parentElement.matches('.process'),
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
