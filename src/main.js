document.querySelector('.skip-link').addEventListener('click', () => document.querySelector('#main').focus());
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
});
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menuButton.focus(); }
});
matchMedia('(min-width: 900px)').addEventListener('change', closeMenu);
// Hide the concept review on launch until genuine approved feedback is available.
if (import.meta.env.VITE_SHOW_REVIEW_PLACEHOLDER === 'false') document.querySelector('[data-review-placeholder]').hidden = true;
document.querySelector('#year').textContent = new Date().getFullYear();
