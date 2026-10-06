# DroneReach

Responsive homepage built with Vite, semantic HTML, CSS and JavaScript.

## Develop and verify

Use Node.js 20.19+ or 22.12+.

```sh
npm ci --cache /tmp/dronereach-npm
npm run dev
npm run build
npm test
```

`npm run preview` serves the production build in `dist`. Tests use `/usr/bin/chromium`; update the executable path in `playwright.config.js` on another machine.

The homepage uses normal page links. Vite runs in multi-page mode, so deliberately unfinished destinations return 404 rather than silently serving the homepage. No placeholder destination pages or enquiry backend have been added.

## Imagery and launch details

All current imagery is temporary AI-generated architectural concept imagery, not evidence of completed DroneReach work. The visible disclaimers are retained.

- Existing hero: `public/images/hero.webp`.
- Service cards: `sector-0.webp` (façade), `sector-1.webp` (cladding), and `service-{roof,windows,solar,render,signage,residential}.webp`.
- Existing illustrative before/after: `project-0.webp` and `project-1.webp`.
- Original SVG contour asset: `public/patterns/contours.svg`. CSS custom properties `--contour-color`, `--contour-scale` and `--contour-opacity` configure its decoration.

Replace concept imagery and SVG logo with approved business assets when available. Supply real contact information and approved legal copy. Set `VITE_SHOW_REVIEW_PLACEHOLDER=false` for a launch build until a genuine approved review is available.

## Linked pages still to build

Only `/` is implemented. The following links intentionally point to future pages:

- `/services`
- `/services/facade-cleaning`
- `/services/cladding-cleaning`
- `/services/roof-cleaning`
- `/services/window-glass-cleaning`
- `/services/solar-panel-cleaning`
- `/services/render-cleaning`
- `/services/signage-cleaning`
- `/services/residential-exterior-cleaning`
- `/sectors`
- `/sectors/commercial-buildings`
- `/sectors/warehouses-industrial`
- `/case-studies`
- `/case-studies/building-facade-cleaning`
- `/about`
- `/contact`
- `/how-it-works`
- `/privacy`
- `/terms`
- `/cookies`

The skip link is the only in-page anchor; it transfers keyboard focus to the main content. No analytics or external font/image requests are included.
