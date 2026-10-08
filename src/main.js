import { initNavigation } from './site/navigation.js';
import { initHero } from './hero.js';

initNavigation();
document.querySelector('.skip-link').addEventListener('click', () => document.querySelector('#main').focus());
document.querySelector('#year').textContent = new Date().getFullYear();

// Inner pages do not need a hero or concept review panel.
const review = document.querySelector('[data-review-placeholder]');
if (review && import.meta.env.VITE_SHOW_REVIEW_PLACEHOLDER === 'false') review.hidden = true;
if (document.querySelector('.hero-band')) initHero();
