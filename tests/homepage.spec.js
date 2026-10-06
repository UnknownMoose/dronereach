import { test, expect } from '@playwright/test';
for (const width of [375,390,768,1440]) {
 test(`homepage at ${width}px`, async ({page}) => {
  await page.setViewportSize({width,height:1000});
  await page.goto('/');
  await expect(page.getByRole('heading',{level:1})).toHaveText('Specialist exterior cleaning for hard-to-reach buildings.');
  await expect(page.locator('.hero-photo img')).toBeVisible();
  await expect.poll(()=>page.locator('.hero-photo img').evaluate(img=>img.complete && img.naturalWidth>0)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  for(const card of await page.locator('.service-card').all()) expect(await card.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  if(width<900) {
   const toggle=page.getByRole('button',{name:'Menu'});
   await toggle.focus(); await page.keyboard.press('Enter');
   await expect(toggle).toHaveAttribute('aria-expanded','true');
   await expect(page.getByRole('navigation',{name:'Main navigation'})).toBeVisible();
   await page.keyboard.press('Escape'); await expect(toggle).toHaveAttribute('aria-expanded','false'); await expect(toggle).toBeFocused();
   await toggle.click(); await page.getByRole('navigation').getByRole('link',{name:'Services',exact:true}).click(); await expect(toggle).toHaveAttribute('aria-expanded','false');
  }
  for (const img of await page.locator('img').all()) { await img.scrollIntoViewIfNeeded(); await img.evaluate(el => el.decode()); }
  await page.evaluate(() => { document.activeElement.blur(); window.scrollTo(0, 0); });
  await page.screenshot({path:`test-results/home-${width}.png`,fullPage:true});
 });
}
test('enquiry prepares a brief without submitting it',async({page})=>{
 await page.goto('/'); await page.locator('.hero-actions [data-quote]').click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByLabel('Location',{exact:true}).fill('Newcastle'); await page.getByLabel('What needs cleaning?').fill('Glass facade');
 await page.getByRole('button',{name:'Prepare enquiry'}).click();
 await expect(page.getByLabel('Your enquiry brief — not submitted')).toHaveValue(/Newcastle/);
 await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).not.toBeVisible();
 await page.getByRole('button',{name:'Learn more'}).first().click(); await expect(page.getByRole('dialog')).toContainText('Commercial buildings');
});
