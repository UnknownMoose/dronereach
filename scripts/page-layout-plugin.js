import { productionOrigin } from '../src/site/config.js';
import { renderPage } from '../src/site/layout.js';
import { services } from '../src/content/services.js';
import { renderService, renderServiceCards } from '../src/site/service.js';
import { renderContactDetails } from '../src/site/contact.js';

export function pageLayoutPlugin() {
  return {
    name: 'dronereach-page-layout',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const page = html.match(/^\s*<!--\s*page\s+([\s\S]*?)-->/);
        if (!page) return html;
        let metadata = JSON.parse(page[1]);
        let content = html.slice(page[0].length).trim();
        if (metadata.service) {
          const service = services.find(item => item.slug === metadata.service);
          if (!service) throw new Error(`Unknown service: ${metadata.service}`);
          metadata = { title: service.seoTitle, description: service.meta, headerVariant: 'solid', styles: ['/src/service.css'], path: service.href };
          content = renderService(service);
        }
        content = content.replace('<!-- service-cards -->', renderServiceCards())
          .replace('<!-- overview-cards -->', renderServiceCards({ descriptions: true }))
          .replace('<!-- contact-details -->', renderContactDetails());
        const siteUrl = process.env.SITE_URL || productionOrigin;
        if (siteUrl) {
          const base = new URL(siteUrl);
          if (!['https:', 'http:'].includes(base.protocol) || base.pathname !== '/' || base.search || base.hash || base.username || base.password) {
            throw new Error('SITE_URL must be the verified production origin, e.g. https://your-domain.example');
          }
          metadata.canonical = new URL(metadata.path || '/', base).href;
        }
        return renderPage(metadata, content);
      },
    },
    handleHotUpdate({ file, server }) {
      if (/\/src\/(site|content)\//.test(file.replaceAll('\\', '/')) && file.endsWith('.js')) {
        server.ws.send({ type: 'full-reload' });
      }
    },
  };
}
