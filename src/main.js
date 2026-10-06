document.querySelector('.skip-link').addEventListener('click', () => document.querySelector('#main').focus());
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
nav.addEventListener('click', event => { if (event.target.closest('a, [data-quote]')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menuButton.focus(); } });
matchMedia('(min-width: 900px)').addEventListener('change', closeMenu);
const dialog = document.querySelector('#detail-dialog');
const title = document.querySelector('#dialog-title');
const content = document.querySelector('#dialog-content');
function showDialog(heading, html) { title.textContent = heading; content.innerHTML = html; dialog.showModal(); }
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
const serviceCopy = {
 'Commercial buildings': 'Façades, cladding and signage for offices, student accommodation and retail properties.',
 'Warehouses & industrial': 'Exterior cleaning for large buildings and difficult-access surfaces. A site assessment helps establish a suitable approach.',
 'Homes & residential': 'Cleaning for roofs, render, solar panels and other hard-to-reach exterior areas.',
 'Roof & solar cleaning': 'Tell us about your roof or solar panels. Suitability and access are assessed before a cleaning plan is agreed.'
};
document.addEventListener('click', event => {
 const trigger = event.target.closest('[data-quote], [data-service], [data-project], [data-policy]');
 if (!trigger) return;
 if (trigger.hasAttribute('data-quote')) {
 showDialog('Tell us about your building.', `<p class="dialog-description">Prepare your enquiry below. This concept site doesn’t send enquiries yet; copy your brief and save it until DroneReach’s contact details are available.</p><form id="quote-form"><label for="building-type">Building type</label><select id="building-type"><option>Commercial building</option><option>Warehouse or industrial building</option><option>Home or residential property</option><option>Roof or solar panels</option></select><label for="building-location">Location</label><input id="building-location" required placeholder="Town or postcode" autocomplete="postal-code"><label for="cleaning-details">What needs cleaning?</label><textarea id="cleaning-details" required rows="4" placeholder="Surfaces, approximate size and any access considerations"></textarea><p class="muted">Useful to include later: photographs of the building and surfaces.</p><button class="button navy" type="submit">Prepare enquiry <span aria-hidden="true">→</span></button><div id="brief-output" aria-live="polite"></div></form>`);
 document.querySelector('#quote-form').addEventListener('submit', event => {
 event.preventDefault();
 const brief = `DroneReach enquiry\nBuilding: ${document.querySelector('#building-type').value}\nLocation: ${document.querySelector('#building-location').value.trim()}\nCleaning required: ${document.querySelector('#cleaning-details').value.trim()}`;
 const output = document.querySelector('#brief-output'); output.replaceChildren();
 const label = document.createElement('label'); label.htmlFor = 'prepared-brief'; label.textContent = 'Your enquiry brief — not submitted';
 const area = document.createElement('textarea'); area.id = 'prepared-brief'; area.readOnly = true; area.rows = 5; area.value = brief;
 const copy = document.createElement('button'); copy.type = 'button'; copy.className = 'button outline'; copy.textContent = 'Copy brief';
 copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(brief); copy.textContent = 'Brief copied'; } catch { area.focus(); area.select(); copy.textContent = 'Select and copy the brief above'; } });
 output.append(label, area, copy); area.focus();
 });
 } else if (trigger.hasAttribute('data-service')) {
 const service = trigger.dataset.service; showDialog(service, `<p>${serviceCopy[service]}</p><p>We assess your building, agree a clear scope and schedule, then plan the cleaning and final check.</p><button class="button navy" data-quote>Prepare an enquiry →</button>`);
 } else if (trigger.hasAttribute('data-project')) {
 showDialog('Building façade cleaning', '<p>This is an illustrative project layout, not a completed DroneReach project.</p><p>Before launch, replace the concept images with genuine before-and-after photographs and add the agreed project brief, surfaces cleaned and finished results.</p>');
 } else {
 const policy = trigger.dataset.policy;
 showDialog(policy, `<p>${policy === 'Cookies' ? 'This concept does not set analytics or marketing cookies. Images and site assets are served locally.' : `The ${policy.toLowerCase()} information has not yet been supplied for this concept.`}</p><p>Approved business and legal information must be added before launch. No enquiry information is transmitted by the form.</p>`);
 }
});
// Set VITE_SHOW_REVIEW_PLACEHOLDER=false for the launch build until approved feedback exists.
if (import.meta.env.VITE_SHOW_REVIEW_PLACEHOLDER === 'false') document.querySelector('[data-review-placeholder]').hidden = true;
document.querySelector('#year').textContent = new Date().getFullYear();
