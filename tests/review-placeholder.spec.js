import { test, expect } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build, preview } from 'vite';

const flag = 'VITE_SHOW_REVIEW_PLACEHOLDER';

for (const value of [undefined, '', 'false', 'TRUE', '1', 'true']) {
  test.describe(`production review flag: ${value === undefined ? 'unset' : JSON.stringify(value)}`, () => {
    let outDir;
    let server;
    let url;

    test.beforeAll(async () => {
      outDir = await mkdtemp(join(tmpdir(), 'dronereach-review-'));
      const previous = process.env[flag];
      if (value === undefined) delete process.env[flag];
      else process.env[flag] = value;
      try {
        // Ignore local .env files so each case exercises exactly the specified value.
        await build({ envDir: false, logLevel: 'silent', build: { outDir } });
      } finally {
        if (previous === undefined) delete process.env[flag];
        else process.env[flag] = previous;
      }
      server = await preview({
        envDir: false,
        build: { outDir },
        preview: { host: '127.0.0.1', port: 0, open: false },
      });
      url = server.resolvedUrls.local[0];
    });

    test.afterAll(async () => {
      if (server) await new Promise((resolve, reject) => {
        server.httpServer.close(error => error ? reject(error) : resolve());
      });
      if (outDir) await rm(outDir, { recursive: true, force: true });
    });

    test('shows the placeholder only for an exact true opt-in', async ({ page }) => {
      await page.goto(url);
      // Wait for application JavaScript, rather than passing on the initial hidden HTML.
      await page.locator('.skip-link').evaluate(link => link.click());
      await expect(page.locator('#main')).toBeFocused();
      const review = page.locator('[data-review-placeholder]');
      await expect(review).toHaveCount(1);
      if (value === 'true') {
        await expect(review).toBeVisible();
        await expect(review).toContainText('Review placeholder');
      } else {
        await expect(review).toBeHidden();
        await expect(page.getByRole('heading', { name: 'In our customers’ words.' })).toHaveCount(0);
      }
    });

    if (value === undefined) {
      test('keeps the default placeholder hidden without JavaScript', async ({ browser }) => {
        const context = await browser.newContext({ javaScriptEnabled: false });
        try {
          const page = await context.newPage();
          await page.goto(url);
          await expect(page.locator('[data-review-placeholder]')).toHaveCount(1);
          await expect(page.locator('[data-review-placeholder]')).toBeHidden();
          await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        } finally {
          await context.close();
        }
      });
    }
  });
}
