import { test, expect } from '@playwright/test';

const path = '/drone-cleaning-safety-compliance';
const points = ['CAA-authorised operations', 'Fully trained & qualified pilots', 'Aviation & public liability insurance', 'Site-specific risk assessments'];
const headings = ['CAA-authorised operations', 'Fully trained and qualified pilots', 'Insured and accountable', 'Site-specific risk assessments and method statements', 'Aircraft checks and operational controls', 'Protecting your building', 'Environmental and chemical controls', 'Ready for your contractor approval process'];

for (const width of [390,768,1440]) {
  test(`safety page and shared homepage trust strip are complete and readable at ${width}px`, async ({page}) => {
    await page.setViewportSize({width,height:900});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const response=await page.goto(path);
    expect(response.status()).toBe(200);
    const html=await response.text();
    expect(html).toContain('DroneReach operates under a Civil Aviation Authority Operational Authorisation.');
    await expect(page).toHaveTitle('Drone Cleaning Safety & Compliance | DroneReach');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content','Explore DroneReach’s approach to safe exterior cleaning, including CAA-authorised operations, qualified pilots, insurance and site-specific RAMS.');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`https://dronereach.co.uk${path}`);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Drone Cleaning Safety & Compliance');
    await expect(page.locator('.page-intro>p:not(.eyebrow)')).toHaveText('CAA-authorised drone operations, insured services and site-specific planning. Professional exterior cleaning with safety at the centre of every project.');
    await expect(page.locator('header.site-header')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
    await expect(page.locator('.header-shell--solid')).toHaveCount(1);
    await expect(page.locator('.safety-topic h2')).toHaveText(headings);
    await expect(page.locator('.trust-points li')).toHaveText(points);
    await expect(page.locator('.trust-points svg')).toHaveCount(4);
    for(const icon of await page.locator('.trust-points svg').all()) await expect(icon).toHaveAttribute('aria-hidden','true');
    await expect(page.locator('.trust-support p')).toHaveText('Qualified people, insured operations and careful planning for every site.');
    await expect(page.locator('.service-faq details')).toHaveCount(7);
    for(const detail of await page.locator('.service-faq details').all()) {
      expect(await detail.evaluate(el=>el.open)).toBe(false);
      await detail.locator('summary').focus();
      await page.keyboard.press('Enter');
      await expect(detail).toHaveJSProperty('open',true);
      await expect(detail.locator('p')).toBeVisible();
      expect(await detail.locator('summary').evaluate(el=>getComputedStyle(el).outlineStyle)).toBe('solid');
      await page.keyboard.press('Space');
      await expect(detail).toHaveJSProperty('open',false);
    }
    await expect(page.locator('.service-quote h2')).toHaveText('Professional cleaning. Carefully planned.');
    await expect(page.locator('.service-quote p')).toHaveText('Talk to us about your building, site requirements and contractor approval process.');
    await expect(page.locator('.service-quote a')).toHaveAttribute('href','/contact');
    await expect(page.locator('form,.contour-art,main img,main a[download]')).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText(/coming soon|we plan to|pre-launch|CAA-certified|100% eco-friendly|risk-free|policy number|£/i);
    const geometry = await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth>innerWidth,
      clipped:Array.from(document.querySelectorAll('main h1,main h2,main p,main li,main a'),el=>el.scrollWidth>el.clientWidth+1?el.textContent:null).filter(Boolean),
      columns:getComputedStyle(document.querySelector('.trust-points')).gridTemplateColumns.split(' ').length,
      backgrounds:Array.from(document.querySelectorAll('main section,.trust-strip'),el=>getComputedStyle(el).backgroundColor),
      text:getComputedStyle(document.querySelector('.safety-topic p')).color,
    }));
    expect(geometry.overflow).toBe(false);expect(geometry.clipped).toEqual([]);
    expect(geometry.columns).toBe(width>=1200?4:width>=600?2:1);
    expect(geometry.backgrounds.every(value=>['rgba(0, 0, 0, 0)','rgb(255, 255, 255)'].includes(value))).toBe(true);
    expect(geometry.text).toBe('rgb(0, 0, 0)');
    await page.evaluate(()=>{document.activeElement.blur();scrollTo(0,0);});
    await page.screenshot({path:`test-results/safety-${width}.png`,fullPage:true});
    expect((await page.reload()).status()).toBe(200);
    await page.goto('/');
    await expect(page.locator('.trust-points li')).toHaveText(points);
    await expect(page.locator('.benefits h2')).toHaveText(['Safer','Faster','Cost-effective','Precision cleaning']);
    expect(await page.locator('.hero-band').evaluate(el=>el.nextElementSibling.classList.contains('benefits-section'))).toBe(true);
    expect(await page.locator('.trust-strip').evaluate(el=>Boolean(el.compareDocumentPosition(document.querySelector('.benefits'))&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
    await expect(page.getByRole('link',{name:'Our safety & compliance standards'})).toHaveAttribute('href',path);
    if(width<900) await page.locator('.menu-toggle').click();
    await expect(page.locator('#navigation').getByRole('link',{name:'Safety & Compliance',exact:true})).toBeVisible();
    await page.locator('#navigation').getByRole('link',{name:'Safety & Compliance',exact:true}).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator('footer').getByRole('link',{name:'Safety & Compliance',exact:true})).toHaveAttribute('href',path);
    expect(errors).toEqual([]);
  });
}

test('sitemap contains every genuine page and robots advertises it',async({request})=>{
  const response=await request.get('/sitemap.xml');expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/xml');
  const xml=await response.text();
  const locations=Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g),match=>match[1]);
  expect(locations).toHaveLength(12);
  expect(new Set(locations).size).toBe(12);
  expect(locations).toContain(`https://dronereach.co.uk${path}`);
  for(const location of locations){expect((await request.get(new URL(location).pathname)).status()).toBe(200);}
  const robots=await request.get('/robots.txt');expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Sitemap: https://dronereach.co.uk/sitemap.xml');
});

test('touch trust link and safety FAQs work without hover',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage();
 try {
   await page.goto('http://127.0.0.1:5173/');
   await page.getByRole('link',{name:'Our safety & compliance standards'}).tap();
   await expect(page).toHaveURL(new RegExp(`${path}$`));
   const detail=page.locator('.service-faq details').first();
   await detail.locator('summary').tap();await expect(detail).toHaveJSProperty('open',true);
   await detail.locator('summary').tap();await expect(detail).toHaveJSProperty('open',false);
   await page.locator('.menu-toggle').tap();
   await expect(page.locator('#navigation').getByRole('link',{name:'Safety & Compliance',exact:true})).toBeVisible();
 }finally{await context.close();}
});
