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

`src/theme.css` defines one brand-blue token, `#0096D6`, paired with black/near-black, white and neutral greys. Primary buttons and key accents use solid brand blue; button hover/active states mix it with black, never white. Small links use a darker blue for contrast. Benefits and review surfaces are neutral grey; process and footer surfaces are near-black. Hero/card scrims are neutral black, preserving natural photographic hues. The contour artwork uses a neutral grey mask, with no translucent blue surfaces. Dark text on the blue buttons is deliberate: white small text on the brand blue falls below 4.5:1 contrast.

## Imagery and launch details

All current imagery is temporary AI-generated architectural concept imagery, not evidence of completed DroneReach work. The visible disclaimers are retained.

- Existing hero: `public/images/hero.webp`.
- Service cards: `sector-0.webp` (façade), `sector-1.webp` (cladding), and `service-{roof,windows,solar,render,signage,residential}.webp`.
- Existing illustrative before/after: `project-0.webp` and `project-1.webp`.
- Original SVG contour asset: `public/patterns/contours.svg`. CSS custom properties `--contour-color`, `--contour-scale`, `--contour-opacity`, `--contour-position` and `--contour-fade` configure its decoration. It contains 16 elevations of one smooth height field, exported as static paths. Regenerate with `python scripts/generate-contours.py` (development-only NumPy and contourpy required).

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
