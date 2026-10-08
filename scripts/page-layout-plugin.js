import { pageEntries } from '../src/site/pages.js';
import { escapeHtml } from '../src/site/html.js';
import { productionOrigin } from '../src/site/config.js';
import { renderTrustStrip } from '../src/site/trust.js';
import { renderPage } from '../src/site/layout.js';
import { services } from '../src/content/services.js';
import { renderService, renderServiceCards } from '../src/site/service.js';
import { renderContactDetails } from '../src/site/contact.js';

function productionBase() {
  const base = new URL(process.env.SITE_URL || productionOrigin);
  if (!['https:', 'http:'].includes(base.protocol) || base.pathname !== '/' || base.search || base.hash || base.username || base.password) {
    throw new Error('SITE_URL must be the verified production origin, e.g. https://your-domain.example');
  }
  return base;
}
function sitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pageEntries.map(({ path }) => `<url><loc>${escapeHtml(new URL(path, productionBase()).href)}</loc></url>`).join('')}</urlset>\n`;
}
function robots() {
  return `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', productionBase()).href}\n`;
}
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
          .replace('<!-- contact-details -->', renderContactDetails())
          .replace('<!-- homepage-trust -->', renderTrustStrip({ homepage: true }))
          .replace('<!-- trust-strip -->', renderTrustStrip());
        metadata.canonical = new URL(metadata.path || '/', productionBase()).href;
        return renderPage(metadata, content);
      },
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap() });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots() });
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = request.url?.split('?')[0];
        if (!['GET', 'HEAD'].includes(request.method) || !['/sitemap.xml', '/robots.txt'].includes(path)) return next();
        response.setHeader('Content-Type', path === '/sitemap.xml' ? 'application/xml; charset=utf-8' : 'text/plain; charset=utf-8');
        response.end(request.method === 'HEAD' ? '' : path === '/sitemap.xml' ? sitemap() : robots());
      });
    },
    handleHotUpdate({ file, server }) {
      if (/\/src\/(site|content)\//.test(file.replaceAll('\\', '/')) && file.endsWith('.js')) {
        server.ws.send({ type: 'full-reload' });
      }
    },
  };
}
