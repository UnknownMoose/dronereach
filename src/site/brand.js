import { links } from './config.js';
import { escapeHtml } from './html.js';

export function renderBrand({ accent = false } = {}) {
  return `<a class="brand" href="${escapeHtml(links.home.href)}" aria-label="DroneReach home"><svg viewBox="0 0 44 44" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="6"/><circle cx="34" cy="10" r="6"/><circle cx="10" cy="34" r="6"/><circle cx="34" cy="34" r="6"/><path d="m10 10 24 24M34 10 10 34"/><rect x="16" y="16" width="12" height="12" rx="4" fill="var(--black)"/></g>${accent ? '<circle cx="22" cy="22" r="3" fill="var(--brand-blue)"/>' : ''}</svg><span>DroneReach</span></a>`;
}
