import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { pageLayoutPlugin } from './scripts/page-layout-plugin.js';
import { pageEntries } from './src/site/pages.js';

export default defineConfig({
  appType: 'mpa',
  plugins: [pageLayoutPlugin()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pageEntries.map(({ name, file }) => [name, fileURLToPath(new URL(file, import.meta.url))])),
    },
  },
});
