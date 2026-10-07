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
// Only preview/demo builds may explicitly opt in to the concept review.
document.querySelector('[data-review-placeholder]').hidden = import.meta.env.VITE_SHOW_REVIEW_PLACEHOLDER !== 'true';
document.querySelector('#year').textContent = new Date().getFullYear();
