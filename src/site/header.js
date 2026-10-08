import { links, mainNavigation } from './config.js';
import { renderBrand } from './brand.js';
import { escapeHtml, renderLinks } from './html.js';

export function renderHeader(variant) {
  return `<div class="header-shell header-shell--${variant}">
<header class="site-header container">
${renderBrand({ accent: true })}
<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation"><span>Menu</span><span class="menu-icon" aria-hidden="true">☰</span></button>
<nav id="navigation" aria-label="Main navigation">${renderLinks(mainNavigation)}<a class="button primary" href="${escapeHtml(links.contact.href)}">Get a quote <span aria-hidden="true">→</span></a></nav>
</header>
</div>`;
}
