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

## Shared page layout

`src/site/layout.js` renders the common document, skip link, header, main and footer. `header.js`, `footer.js` and `brand.js` are the single source for shared markup; `config.js` defines navigation destinations and menus. Vite renders these templates during development and production builds, so the header/footer and metadata are in the initial HTML. Shared navigation code is in `src/site/navigation.js`; hero playback initializes only when a page contains a hero.

To add a real page later:

1. Create a root-relative entry such as `about/index.html`. Start it with the JSON page comment below, followed by page-specific HTML. Do not include a second document, header, main or footer.
2. Set `title`, `description` and `headerVariant`. Use `solid` (the default) for a full-width black header in normal document flow, or `hero` for the overlay header when the content includes the existing full-screen hero.
3. Add the new HTML entry alongside `index.html` in `vite.config.js` under `build.rollupOptions.input`, using absolute paths via Node's `resolve`. Vite will emit `about/index.html`; navigation remains root-relative. Run the build and browser checks.

```html
<!-- page
{
  "title": "About DroneReach",
  "description": "Your approved page description.",
  "headerVariant": "solid"
}
-->
<section class="container section">
  <h1>Your page heading</h1>
  <p>Your page content.</p>
</section>
```

No additional public page entries have been created. The solid-header fixture used by browser tests exists only in intercepted test responses.

## Launch video

Set the single `videoSrc` value in `public/hero-config.json` to the actual footage URL, for example a locally hosted `/videos/drone-cleaning.webm`. Leave it empty until footage is available. The JSON file is fetched at runtime; changing the deployed configuration does not require rebuilding the hero layout. The current image stays underneath as poster/fallback. Playback is muted, looping and inline; the pause/play control appears only after successful playback. Reduced-motion users see the static image without a video request.

Video tests generate a temporary WebM using FFmpeg; no test video is shipped in the website.

## Brand theme

`src/theme.css` defines only the approved interface palette: brand blue `#0096D6`, pure black `#000000` and white `#FFFFFF`. Light sections and feedback use white; process and footer use pure black. Text is black on white/blue and white on black. Primary buttons use solid brand blue with black text and invert to black/white on hover or active; text links underline, with blue arrows as accents. Focus rings use blue on white/black and white over hero photography. Only photographic scrims retain black transparency for readability; no grey tokens, colour mixes or faded interface text remain.

## Imagery and launch details

All current imagery is temporary AI-generated architectural concept imagery, not evidence of completed DroneReach work. The visible disclaimers are retained.

- Existing hero: `public/images/hero.webp`.
- Service cards: `sector-0.webp` (façade), `sector-1.webp` (cladding), and `service-{roof,windows,solar,render,signage,residential}.webp`.
- Existing illustrative before/after: `project-0.webp` and `project-1.webp`.

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
