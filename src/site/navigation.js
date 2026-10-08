export function initNavigation() {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const servicesButton = document.querySelector('.services-toggle');
  const servicesMenu = document.querySelector('#services-menu');
  const disclosure = document.querySelector('.services-disclosure');
  function closeServices() {
    servicesButton.setAttribute('aria-expanded', 'false');
    servicesMenu.hidden = true;
  }
  function closeMenu() {
    closeServices();
    menuButton.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    if (!open) closeServices();
    menuButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  });
  servicesButton.addEventListener('click', () => {
    const open = servicesButton.getAttribute('aria-expanded') !== 'true';
    servicesButton.setAttribute('aria-expanded', String(open));
    servicesMenu.hidden = !open;
  });
  servicesButton.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      servicesButton.setAttribute('aria-expanded', 'true');
      servicesMenu.hidden = false;
      servicesMenu.querySelector('a').focus();
    }
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('click', event => {
    if (!disclosure.contains(event.target)) closeServices();
    if (!nav.contains(event.target) && !menuButton.contains(event.target)) {
      menuButton.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!servicesMenu.hidden) {
      closeServices();
      servicesButton.focus();
    } else if (nav.classList.contains('open')) {
      closeMenu();
      menuButton.focus();
    }
  });
  disclosure.addEventListener('focusout', event => {
    if (!disclosure.contains(event.relatedTarget)) closeServices();
  });
  matchMedia('(min-width: 900px)').addEventListener('change', closeMenu);
}
