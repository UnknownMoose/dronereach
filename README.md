# DroneReach

A responsive, multi-page exterior building cleaning website built with Vite, semantic HTML, CSS and JavaScript. Shared components and all page content are rendered into the initial HTML during development and production builds.

## Develop and verify

Use Node.js 20.19+ or 22.12+.

```sh
npm ci --cache /tmp/dronereach-npm
npm run dev
npm run build
npm test
npm run preview
```

Tests use `/usr/bin/chromium`; adjust `playwright.config.js` for another machine. There is no separate lint script. Production output is in `dist`. The existing clean URLs have no trailing slash; Vite development and preview resolve the flat HTML entries. `vercel.json` enables Vercel clean URLs and disables trailing slashes, resolving each route to its compiled `.html` file. Missing pages continue to return 404; there is no homepage fallback. Vite’s local extension lookup is not proof of a production host’s routing.

## Shared document and navigation

`src/site/layout.js` renders the document, metadata, skip link, global header, main content and global footer. `header.js`, `footer.js` and `brand.js` remain the single source of shared markup. `config.js` defines navigation, the verified production origin `https://dronereach.co.uk`, and approved business contact details. `src/site/navigation.js` manages the click-operated Services disclosure and mobile menu, including keyboard focus, expanded states, Escape, outside-click dismissal and responsive reset.

Only genuine page destinations are published in navigation. Sectors, About, project details, legal pages and a separate process page do not exist, so they are not linked. Homepage commercial/industrial category labels and service-page building types without destinations are non-interactive; heritage links to its service page. The illustrative project showcase and labelled review placeholder remain intact.

To add a normal page:

1. Create a flat HTML entry, such as `about.html`, for a clean `/about` URL. Include a JSON `page` comment followed by page content; do not duplicate the document, header, main or footer.
2. Set unique `title`, `description`, `path` and `headerVariant`. `solid` is a black header in normal flow; `hero` overlays the existing full-screen homepage hero. Optional `styles` contains local `/src/*.css` paths.
3. Register the entry in `src/site/pages.js`, then add its genuine destination to the shared navigation configuration where appropriate.
4. Build and verify direct access, refresh, keyboard navigation and mobile layout.

```html
<!-- page
{
  "title": "Your approved page title | DroneReach",
  "description": "Your approved page description.",
  "path": "/about",
  "headerVariant": "solid"
}
-->
<section class="container section">
  <h1>Your page heading</h1>
  <p>Your page content.</p>
</section>
```

The layout plugin creates canonical links from the approved production origin and each page path. An optional `SITE_URL` environment variable can replace the origin for another verified production domain. The shared route registry in `src/site/pages.js` drives both production HTML entries and the sitemap. The layout plugin serves `sitemap.xml` and `robots.txt` during development and emits them in `dist` for production, using the same production origin as canonical URLs.

## Service catalogue

`src/content/services.js` contains each service's metadata, copy, images, benefits, checklist, building types and FAQs. `src/site/service.js` is the shared service-page and photographic-card template. `src/service.css` contains the reusable service layout; `src/pages.css` adds overview and contact styling. Editing service data updates the page, homepage/overview cards and global service links together.

Each service entry in `services/*.html` contains only its service slug:

```html
<!-- page
{"service":"cladding-cleaning"}
-->
```

The Vite layout plugin renders the complete service template in initial HTML, and `vite.config.js` registers all service entries from the shared catalogue. Native `details`/`summary` FAQs work with keyboard and touch without an accordion library. Building cards link only to genuine destinations; cards identifying the current service are non-interactive.

Implemented routes:

- `/`
- `/services`
- `/services/facade-cleaning`
- `/services/cladding-cleaning`
- `/services/roof-cleaning`
- `/services/window-glass-cleaning`
- `/services/solar-panel-cleaning`
- `/services/render-cleaning`
- `/services/shopfront-signage-cleaning`
- `/services/heritage-building-cleaning`
- `/contact`
- `/drone-cleaning-safety-compliance`

The quote page uses the approved email `contact@dronereach.co.uk`, with useful details to include. It contains no form or backend. No telephone number has been supplied. Add a verified number to `businessContact` when available; the quote page and footer will both use it. A future form can be added to the contact page's main content without changing the global layout.

## Safety & Compliance

`drone-cleaning-safety-compliance.html` uses the existing global layout, shared service FAQs and CTA styling. `src/site/trust.js` renders the same four operating-standard points on that page and beneath the homepage hero, inside the existing benefits band. `src/trust.css` and `src/safety.css` keep the layout open and white with brand-blue icons and accents. The shared header and footer both link to Safety & Compliance.

The page uses the supplied present-tense copy. Before launch, verify authorisation, pilot qualifications/training, insurance and operating-process statements against the final documents using [the internal launch checklist](docs/launch-checklist.md). The checklist is not copied into public pages or production output. No official CAA logo, accreditation seal, policy limit, qualification name or fake document download is introduced.

## Launch video

Set `videoSrc` in `public/hero-config.json` to the actual footage URL. Leave it empty until footage is available. Changing this deployed configuration does not require rebuilding the hero layout. The image stays underneath as poster/fallback. Playback is muted, looping and inline, with a pause/play control after successful playback. Reduced-motion users see the static image without a video request.

Video tests generate a temporary WebM using FFmpeg; no test video is shipped.

## Brand and imagery

`src/theme.css` defines only brand blue `#0096D6`, black `#000000` and white `#FFFFFF`. White content sections, black process/footer sections, black text on blue buttons, and visible blue/white keyboard focus preserve the approved interface palette. Only photographic scrims use black transparency. Photos retain natural colours; there are no topographic, pale-blue or grey interface backgrounds.

All current photographs are temporary AI-generated architectural concept imagery, not completed DroneReach work. Visible disclaimers remain on the homepage, overview and service pages.

- `hero.webp`: existing drone/glass hero.
- `sector-0.webp`: glass-fronted building; `sector-1.webp`: metal cladding.
- `service-commercial-roof.webp`: new large warehouse-roof concept, optimised to WebP, 1200 × 800.
- `service-windows.webp`, `service-solar.webp`, `service-render.webp`, `service-signage.webp`: corresponding material details.
- `service-roof.webp`: traditional stone/slate building used for heritage imagery.
- `project-0.webp`, `project-1.webp`: illustrative before/after comparison.

Replace these with approved business photography and supply launch footage when available. The existing solar and render images are material-detail concepts, not evidence of commercial projects. `sector-2.webp` and `service-residential.webp` are legacy assets no longer used by the pages.

Set `VITE_SHOW_REVIEW_PLACEHOLDER=false` for a launch build until a genuine approved review is available. Substantiate the supplied homepage claim “Up to 5 times faster than conventional cleaning methods on suitable jobs” before launch. No additional performance claims, credentials, prices or testimonials have been introduced.
