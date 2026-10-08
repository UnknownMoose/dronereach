import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { pageLayoutPlugin } from './scripts/page-layout-plugin.js';
import { services } from './src/content/services.js';

export default defineConfig({
  appType: 'mpa',
  plugins: [pageLayoutPlugin()],
  build: {
    rollupOptions: {
      input: Object.fromEntries([
        ['home', './index.html'], ['services', './services.html'], ['contact', './contact.html'],
        ...services.map(service => [service.slug, `./services/${service.slug}.html`]),
      ].map(([name, path]) => [name, fileURLToPath(new URL(path, import.meta.url))])),
    },
  },
});
