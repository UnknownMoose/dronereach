import { renderPage } from '../src/site/layout.js';

export function pageLayoutPlugin() {
  return {
    name: 'dronereach-page-layout',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const page = html.match(/^\s*<!--\s*page\s+([\s\S]*?)-->/);
        if (!page) return html;
        return renderPage(JSON.parse(page[1]), html.slice(page[0].length).trim());
      },
    },
    // Changes to shared templates should refresh the document, not just page scripts.
    handleHotUpdate({ file, server }) {
      if (file.replaceAll('\\', '/').includes('/src/site/') && file.endsWith('.js')) {
        server.ws.send({ type: 'full-reload' });
      }
    },
  };
}
