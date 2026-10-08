import { services } from '../content/services.js';

// Single route registry for production entries and sitemap; no placeholder pages.
export const pageEntries = [
  { name: 'home', path: '/', file: './index.html' },
  { name: 'services', path: '/services', file: './services.html' },
  { name: 'contact', path: '/contact', file: './contact.html' },
  { name: 'safety', path: '/drone-cleaning-safety-compliance', file: './drone-cleaning-safety-compliance.html' },
  ...services.map(({ slug, href }) => ({ name: slug, path: href, file: `./services/${slug}.html` })),
];
