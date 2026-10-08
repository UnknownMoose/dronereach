import { buildings, services } from '../content/services.js';
import { escapeHtml as e } from './html.js';

const arrow = '<span aria-hidden="true">→</span>';
const quote = () => `<a class="button primary" href="/contact">Get a quote ${arrow}</a>`;
const icons = [
  '<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z"/>',
  '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
];
function photograph(image, { hero = false } = {}) {
  return `<img ${hero ? 'class="service-hero-image"' : ''} src="${e(image.src)}" alt="${e(image.alt)}" width="${image.width}" height="${image.height}" ${hero ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
}
export function renderPhotoCard({ title, href, image }) {
  const tag = href ? 'a' : 'article';
  return `<${tag} class="service-tile${href ? '' : ' service-tile--static'}"${href ? ` href="${e(href)}"` : ''}>${photograph(image)}<h3>${e(title)}</h3>${href ? '<span class="service-arrow" aria-hidden="true">→</span>' : ''}</${tag}>`;
}
export function renderServiceCards({ descriptions = false } = {}) {
  return services.map(service => descriptions
    ? `<div class="overview-service">${renderPhotoCard(service)}<p>${e(service.summary)}</p></div>`
    : renderPhotoCard(service)).join('\n');
}
export function renderService(service) {
  const relatedBuildings = service.buildings.map(key => buildings[key]).map(building => {
    // The current service is already identified by the page title, not a self-link.
    return renderPhotoCard({ ...building, href: building.href === service.href ? undefined : building.href });
  }).join('');
  return `<article class="service-page">
<section class="service-hero" aria-labelledby="service-heading">${photograph(service.hero || service.image, { hero: true })}
<div class="container service-hero-content"><nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/services">Services</a></li><li aria-current="page">${e(service.title)}</li></ol></nav>
<h1 id="service-heading">${e(service.title)}</h1><p class="service-description">${e(service.description)}</p>${quote()}<p class="service-image-note">Illustrative concept imagery · not completed DroneReach work.</p></div></section>
<section class="service-benefits container" aria-label="Benefits of ${e(service.title.toLowerCase())}"><ul>${service.benefits.map((text, i) => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[i]}</svg><span>${e(text)}</span></li>`).join('')}</ul></section>
<section class="service-intro container service-section" aria-labelledby="intro-heading"><figure>${photograph(service.image)}<figcaption>Illustrative concept photography.</figcaption></figure><div><h2 id="intro-heading">${e(service.heading)}</h2><p>${e(service.introduction)}</p><ul class="service-materials">${service.checklist.map(text => `<li><span aria-hidden="true">✓</span>${e(text)}</li>`).join('')}</ul><p class="service-support">${e(service.support)}</p></div></section>
<section class="process service-section" aria-labelledby="process-heading"><div class="container"><h2 id="process-heading">Simple from start to finish.</h2><ol class="steps"><li><span class="step-number">1</span><div><h3>Tell us about your building</h3><p>Share the location, surfaces and photos of the areas needing cleaning.</p></div></li><li><span class="step-number">2</span><div><h3>We assess and plan</h3><p>We review suitability and agree the method, scope and site arrangements.</p></div></li><li><span class="step-number">3</span><div><h3>We clean and review</h3><p>The agreed work is carried out, with a review of the results.</p></div></li></ol></div></section>
<section class="service-sectors container service-section" aria-labelledby="sectors-heading"><h2 id="sectors-heading">Buildings we clean</h2><div class="service-grid">${relatedBuildings}</div><div class="service-sectors-caption"><p class="service-support">Illustrative concept photography · not completed DroneReach work.</p><a class="text-link" href="/services">View all services ${arrow}</a></div></section>
<section class="service-faq container service-section" aria-labelledby="faq-heading"><h2 id="faq-heading">Your questions, answered.</h2><div class="service-faq-list">${service.faqs.map(([question, answer]) => `<details><summary><span>${e(question)}</span><span class="faq-icon" aria-hidden="true"></span></summary><p>${e(answer)}</p></details>`).join('')}</div></section>
<section class="service-quote container service-section" aria-labelledby="quote-heading"><div><h2 id="quote-heading">Let’s discuss your building.</h2><p>Tell us what needs cleaning and we’ll help you take the next step.</p></div>${quote()}</section>
</article>`;
}
