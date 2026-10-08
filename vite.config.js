import { defineConfig } from 'vite';
import { pageLayoutPlugin } from './scripts/page-layout-plugin.js';

export default defineConfig({ appType: 'mpa', plugins: [pageLayoutPlugin()] });
