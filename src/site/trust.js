import { escapeHtml as e } from './html.js';

export const trustPoints = [
  { label: 'CAA-authorised operations', icon: '<path d="m3 10 7 2 2 7 2-7 7-2-7-2-2-7-2 7-7 2Z"/><path d="M5 19h4m-2-2v4"/>' },
  { label: 'Fully trained & qualified pilots', icon: '<path d="M14 3H5v18h14V8l-5-5Z"/><path d="M14 3v5h5M8 11h8M8 15h3m3 1 2 2 4-4"/>' },
  { label: 'Aviation & public liability insurance', icon: '<path d="m12 3-8 3v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z"/><path d="m8 12 3 3 5-6"/>' },
  { label: 'Site-specific risk assessments', icon: '<path d="M8 5H5v16h14V5h-3M9 3h6v4H9zM8 11h8M8 15h8M8 18h5"/>' },
];
export function renderTrustStrip({ homepage = false } = {}) {
  return `<div class="trust-strip"${homepage ? '' : ' aria-label="Our operating standards"'}><ul class="trust-points">${trustPoints.map(({ label, icon }) => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg><span>${e(label)}</span></li>`).join('')}</ul><div class="trust-support"><p>Qualified people, insured operations and careful planning for every site.</p>${homepage ? '<a class="text-link" href="/drone-cleaning-safety-compliance">Our safety &amp; compliance standards <span aria-hidden="true">→</span></a>' : ''}</div></div>`;
}
