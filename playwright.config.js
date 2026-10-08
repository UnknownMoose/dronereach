import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    launchOptions: {
      executablePath: existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined,
      args: ['--no-sandbox'],
    },
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 5173 --strictPort',
    url: 'http://127.0.0.1:5173',
    env: { VITE_SHOW_REVIEW_PLACEHOLDER: '' },
    reuseExistingServer: false,
  },
});
