import { links, footerExplore, footerServices } from './config.js';
import { renderBrand } from './brand.js';
import { escapeHtml, renderLinks } from './html.js';
import { renderContactDetails } from './contact.js';

export function renderFooter() {
  return `<footer><div class="container"><div class="footer-grid"><div>${renderBrand()}<p>Specialist exterior cleaning.<br>Commercial, industrial and heritage buildings.</p></div><div><h3>Explore</h3>${renderLinks(footerExplore)}</div><div class="footer-services"><h3>Our services</h3>${renderLinks(footerServices)}</div><div><h3>Get in touch</h3><p>Based in the North East.<br>Further afield by arrangement.</p><a href="${escapeHtml(links.contact.href)}">Get a quote →</a>${renderContactDetails()}</div></div><div class="footer-bottom"><p>© <span id="year">${new Date().getFullYear()}</span> DroneReach. All rights reserved.<br>Design concept · Project imagery is illustrative.</p></div></div></footer>`;
}
