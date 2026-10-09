import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const description = 'Specialist cleaning for commercial, industrial and heritage buildings — reducing work at height, saving time and minimising disruption.';
let fixtureDirectory, fixture;
test.beforeAll(() => {
  fixtureDirectory = mkdtempSync(join(tmpdir(), 'dronereach-video-'));
  const path = join(fixtureDirectory, 'test.webm');
  execFileSync('ffmpeg', ['-hide_banner','-loglevel','error','-f','lavfi','-i','testsrc=size=160x120:rate=10','-t','2','-c:v','libvpx','-pix_fmt','yuv420p','-an',path]);
  fixture = readFileSync(path);
});
test.afterAll(() => rmSync(fixtureDirectory, { recursive:true, force:true }));
async function configureVideo(page, failure=false) {
  await page.route('**/hero-config.json', route => route.fulfill({json:{videoSrc:'/__test__/hero.webm'}}));
  await page.route('**/__test__/hero.webm', route => failure ? route.fulfill({status:404,body:''}) : route.fulfill({contentType:'video/webm',body:fixture}));
}
for (const [width,height] of [[390,844],[768,1024],[1440,900],[844,390]]) {
  test(`hero fits the first screen and grows safely at ${width}x${height}`, async ({page}) => {
    await page.setViewportSize({width,height});
    await page.goto('/');
    await expect(page.getByRole('heading',{level:1})).toHaveText('Drone-Powered Exterior Building Cleaning');
    await expect(page.locator('.hero-band .intro')).toHaveText(description);
    await expect(page.locator('.hero-background')).toBeVisible();
    await expect.poll(()=>page.locator('.hero-background').evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
    await expect.poll(()=>page.evaluate(()=>Math.abs(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hero-header-height'))-document.querySelector('.site-header').getBoundingClientRect().height)<1)).toBe(true);
    const geometry=await page.evaluate(()=>{
      const hero=document.querySelector('.hero-band').getBoundingClientRect();
      const header=document.querySelector('.site-header').getBoundingClientRect();
      const next=document.querySelector('.benefits-section').getBoundingClientRect();
      return {heroHeight:hero.height,heroTop:hero.top,headerBottom:header.bottom,nextTop:next.top,overflow:document.documentElement.scrollWidth>innerWidth,buttons:[...document.querySelectorAll('.hero-actions a')].map(el=>({top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom}))};
    });
    expect(geometry.heroTop).toBe(0);
    expect(geometry.heroHeight).toBeGreaterThanOrEqual(height);
    if (height>=800) expect(geometry.heroHeight).toBeCloseTo(height,0);
    expect(geometry.nextTop).toBeCloseTo(geometry.heroHeight,0);
    expect(geometry.overflow).toBe(false);
    for(const button of geometry.buttons) { expect(button.top).toBeGreaterThanOrEqual(geometry.headerBottom);expect(button.bottom).toBeLessThan(geometry.heroHeight); }
    await expect(page.locator('.hero-actions a').first()).toHaveAttribute('href','/contact');
    await expect(page.locator('.hero-actions a').last()).toHaveAttribute('href','/services');
    await expect(page.locator('.video-toggle')).toBeHidden();
    expect(await page.locator('.hero-video').getAttribute('src')).toBeNull();
    await page.screenshot({path:`test-results/hero-${width}-${height}.png`});
  });
}
test('configured video actually plays, pauses and resumes; reduced motion restores the image',async({page})=>{
  await configureVideo(page);await page.goto('/');
  const video=page.locator('.hero-video');const toggle=page.locator('.video-toggle');
  await expect(page.locator('.hero-band')).toHaveClass(/video-active/);
  await expect(toggle).toHaveAccessibleName('Pause background video');
  await expect.poll(()=>video.evaluate(el=>el.currentTime)).toBeGreaterThan(0);
  expect(await video.evaluate(el=>el.muted&&el.loop&&el.playsInline)).toBe(true);
  await toggle.click();await expect.poll(()=>video.evaluate(el=>el.paused)).toBe(true);
  await expect(toggle).toHaveAccessibleName('Play background video');
  await toggle.click();await expect.poll(()=>video.evaluate(el=>el.paused)).toBe(false);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(toggle).toBeHidden();await expect(page.locator('.hero-band')).not.toHaveClass(/video-active/);
  await expect.poll(()=>video.evaluate(el=>el.paused)).toBe(true);
});
test('reduced-motion users never request the configured video',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await configureVideo(page);
  const requests=[];page.on('request',r=>{if(r.url().includes('/__test__/'))requests.push(r.url());});
  await page.goto('/');await expect(page.locator('.hero-background')).toBeVisible();
  expect(await page.locator('.hero-video').getAttribute('src')).toBeNull();
  expect(requests).toEqual([]);await expect(page.locator('.video-toggle')).toBeHidden();
});
for(const failure of ['missing footage','autoplay blocked']) {
  test(`image remains the fallback when ${failure}`,async({page})=>{
    await configureVideo(page,failure==='missing footage');
    if(failure==='autoplay blocked')await page.addInitScript(()=>{HTMLMediaElement.prototype.play=()=>Promise.reject(new DOMException('Blocked','NotAllowedError'));});
    await page.goto('/');
    await expect.poll(()=>page.locator('.hero-video').getAttribute('src')).toBe('/__test__/hero.webm');
    if(failure==='missing footage')await expect.poll(()=>page.locator('.hero-video').evaluate(el=>Boolean(el.error))).toBe(true);
    await expect(page.locator('.hero-band')).not.toHaveClass(/video-active/);
    await expect(page.locator('.video-toggle')).toBeHidden();await expect(page.locator('.hero-background')).toBeVisible();
  });
}
