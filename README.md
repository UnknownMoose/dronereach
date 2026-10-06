# DroneReach

A responsive homepage concept built with Vite, semantic HTML, CSS and JavaScript.

## Develop

Use Node.js 20.19+ or 22.12+.

```sh
npm ci --cache /tmp/dronereach-npm
npm run dev
```

`npm run build` creates the production site in `dist`. `npm run preview` serves that build.

## Verify

`npm test` checks 375, 390, 768 and 1440px layouts, overflow, mobile-menu keyboard handling, dialogs and local enquiry preparation. Tests use the cloud machine's `/usr/bin/chromium`; change `executablePath` in `playwright.config.js` for another machine.

## Before launch

- Replace AI-generated, explicitly illustrative images in `public/images` with approved business photography. `hero.webp`, `sector-0.webp` through `sector-2.webp`, and `project-0.webp`/`project-1.webp` correspond to the hero, sector cards and comparison.
- Supply approved contact details, privacy/terms information, and an actual enquiry delivery integration. The form currently prepares a copyable brief locally; it does not send or store it.
- Set `VITE_SHOW_REVIEW_PLACEHOLDER=false` when building to hide the feedback placeholder until a verified review is supplied.
- The logo is an editable SVG concept, to be replaced with official artwork if available.

No analytics, external font requests, or external image requests are included.
