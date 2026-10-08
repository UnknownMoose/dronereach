import { links, footerExplore, footerServices, legalNavigation } from './config.js';
import { renderBrand } from './brand.js';
import { escapeHtml, renderLinks } from './html.js';

export function renderFooter() {
  return `<footer><div class="container"><div class="footer-grid"><div>${renderBrand()}<p>Specialist exterior cleaning.<br>For homes and businesses.</p></div><div><h3>Explore</h3>${renderLinks(footerExplore)}</div><div><h3>What we clean</h3>${renderLinks(footerServices)}</div><div><h3>Get in touch</h3><p>Based in the North East.<br>Further afield by arrangement.</p><a href="${escapeHtml(links.contact.href)}">Request a quote →</a><p>Phone and email to be added before launch.</p></div></div><div class="footer-bottom"><p>© <span id="year">${new Date().getFullYear()}</span> DroneReach. All rights reserved.<br>Design concept · Project imagery and review areas are illustrative placeholders.</p><div>${renderLinks(legalNavigation)}</div></div></div></footer>`;
}
