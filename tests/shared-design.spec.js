import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
 test(`shared typography, imagery and quote UI at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  const sizes=[];
  for (const route of ['/services/facade-cleaning','/contact','/drone-cleaning-safety-compliance']) {
   await page.goto(route);
   sizes.push(await page.locator('h1').evaluate(el=>getComputedStyle(el).fontSize));
   expect(await page.locator('main p').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(13);
   await expect(page.locator('.site-header')).toHaveCount(1);
   await expect(page.locator('footer')).toHaveCount(1);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   if(route==='/contact'||route.includes('compliance')) {
    await page.locator('.page-intro-media img').evaluate(el=>el.decode());
    await expect(page.locator('.page-intro-media img')).toBeVisible();
   }
  }
  expect(new Set(sizes).size).toBe(1);
  await page.goto('/contact');
  for(const label of ['Name','Company','Email','Phone','Building / site address','Project details']) await expect(page.getByLabel(label,{exact:true})).toBeEditable();
  await expect(page.getByRole('button',{name:'Request a quote'})).toBeDisabled();
  await page.getByLabel('Name',{exact:true}).fill('Example');
  await page.getByLabel('Name',{exact:true}).press('Enter');
  await expect(page).toHaveURL(/\/contact$/);
  await page.goto('/');
  await expect(page.locator('.feedback,[data-review-placeholder]')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('Review placeholder');
 });
}
