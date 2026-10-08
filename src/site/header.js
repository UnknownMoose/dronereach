import { links, mainNavigation, serviceNavigation } from './config.js';
import { renderBrand } from './brand.js';
import { escapeHtml, renderLinks } from './html.js';

export function renderHeader(variant) {
  return `<div class="header-shell header-shell--${variant}">
<header class="site-header container">
${renderBrand({ accent: true })}
<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation"><span>Menu</span><span class="menu-icon" aria-hidden="true">☰</span></button>
<nav id="navigation" aria-label="Main navigation"><div class="services-disclosure"><button class="services-toggle" type="button" aria-expanded="false" aria-controls="services-menu">Services <span aria-hidden="true">▾</span></button><div id="services-menu" class="services-menu" hidden>${renderLinks(serviceNavigation)}</div></div>${renderLinks(mainNavigation)}<a class="button primary" href="${escapeHtml(links.contact.href)}">Get a quote <span aria-hidden="true">→</span></a></nav>
</header>
</div>`;
}
