import { initNavigation } from './site/navigation.js';
import { initHero } from './hero.js';

initNavigation();
document.querySelector('.skip-link').addEventListener('click', () => document.querySelector('#main').focus());
document.querySelector('#year').textContent = new Date().getFullYear();

if (document.querySelector('.hero-band')) initHero();
