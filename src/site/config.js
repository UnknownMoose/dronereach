// Root-relative destinations work from every page. Shared menus reference these objects.
export const links = {
  home: { label: 'DroneReach', href: '/' },
  services: { label: 'Services', href: '/services' },
  sectors: { label: 'Sectors', href: '/sectors' },
  caseStudies: { label: 'Case studies', href: '/case-studies' },
  about: { label: 'About', href: '/about' },
  contact: { label: 'Contact', href: '/contact' },
  howItWorks: { label: 'How it works', href: '/how-it-works' },
  commercial: { label: 'Commercial buildings', href: '/sectors/commercial-buildings' },
  industrial: { label: 'Warehouses & industrial', href: '/sectors/warehouses-industrial' },
  residential: { label: 'Homes & residential', href: '/services/residential-exterior-cleaning' },
  roof: { label: 'Roof cleaning', href: '/services/roof-cleaning' },
  solar: { label: 'Solar panel cleaning', href: '/services/solar-panel-cleaning' },
  privacy: { label: 'Privacy', href: '/privacy' },
  terms: { label: 'Terms', href: '/terms' },
  cookies: { label: 'Cookies', href: '/cookies' },
};

export const mainNavigation = [links.services, links.sectors, links.caseStudies, links.about, links.contact];
export const footerExplore = [links.services, links.sectors, links.howItWorks, links.contact];
export const footerServices = [links.commercial, links.industrial, links.residential, links.roof, links.solar];
export const legalNavigation = [links.privacy, links.terms, links.cookies];
