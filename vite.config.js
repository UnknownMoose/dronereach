import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { pageLayoutPlugin } from './scripts/page-layout-plugin.js';

export default defineConfig({
  appType: 'mpa',
  plugins: [pageLayoutPlugin()],
  build: {
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        facadeCleaning: fileURLToPath(new URL('./services/facade-cleaning.html', import.meta.url)),
      },
    },
  },
});
