import { services } from '../content/services.js';

// Root-relative URLs work from every page. Only publish navigation to real pages.
export const links = {
  home: { label: 'DroneReach', href: '/' },
  services: { label: 'Services', href: '/services' },
  safety: { label: 'Safety & Compliance', href: '/drone-cleaning-safety-compliance' },
  contact: { label: 'Get a quote', href: '/contact' },
};
export const serviceNavigation = [{ label: 'View all services', href: '/services' }, ...services.map(({ title, href }) => ({ label: title, href }))];
// Add Sectors and About here once genuine pages exist; no placeholder links.
export const mainNavigation = [links.safety];
export const footerExplore = [links.home, links.services, links.safety, links.contact];
export const footerServices = serviceNavigation.slice(1);
// Fill only with verified business details. Never display invented contact methods.
export const businessContact = { email: 'contact@dronereach.co.uk', phone: '' };

export const productionOrigin = 'https://dronereach.co.uk';
