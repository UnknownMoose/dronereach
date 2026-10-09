import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  workers: 2,
  use: { baseURL: 'http://127.0.0.1:5173', launchOptions: {
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox'],
  } },
  webServer: { command: 'npm run dev -- --host 127.0.0.1', url: 'http://127.0.0.1:5173', reuseExistingServer: true },
});
