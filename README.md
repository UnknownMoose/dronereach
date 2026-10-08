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

## Launch video

Set the single `videoSrc` value in `public/hero-config.json` to the actual footage URL, for example a locally hosted `/videos/drone-cleaning.webm`. Leave it empty until footage is available. The JSON file is fetched at runtime; changing the deployed configuration does not require rebuilding the hero layout. The current image stays underneath as poster/fallback. Playback is muted, looping and inline; the pause/play control appears only after successful playback. Reduced-motion users see the static image without a video request.

Video tests generate a temporary WebM using FFmpeg; no test video is shipped in the website.

## Brand theme

`src/theme.css` defines only the approved interface palette: brand blue `#0096D6`, pure black `#000000` and white `#FFFFFF`. Light sections and feedback use white; process and footer use pure black. Text is black on white/blue and white on black. Primary buttons use solid brand blue with black text and invert to black/white on hover or active; text links underline, with blue arrows as accents. Focus rings use blue on white/black and white over hero photography. Contour lines use solid brand blue. Only photographic scrims retain black transparency for readability; no grey tokens, colour mixes or faded interface text remain.

## Imagery and launch details

All current imagery is temporary AI-generated architectural concept imagery, not evidence of completed DroneReach work. The visible disclaimers are retained.

- Existing hero: `public/images/hero.webp`.
- Service cards: `sector-0.webp` (façade), `sector-1.webp` (cladding), and `service-{roof,windows,solar,render,signage,residential}.webp`.
- Existing illustrative before/after: `project-0.webp` and `project-1.webp`.
- Original SVG contour asset: `public/patterns/contours.svg`. CSS custom properties `--contour-color`, `--contour-scale` and `--contour-position` configure its decoration. It contains 16 elevations of one smooth height field, exported as static paths. Regenerate with `python scripts/generate-contours.py` (development-only NumPy and contourpy required).

Replace concept imagery and SVG logo with approved business assets when available. Supply real contact information and approved legal copy. Set `VITE_SHOW_REVIEW_PLACEHOLDER=false` for a launch build until a genuine approved review is available.

## Pre-launch content check

Substantiate the supplied “Up to 5 times faster than conventional cleaning methods on suitable jobs” claim before launch. The benefits section uses the supplied marketing copy without adding supporting statistics, citations or comparisons.

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
