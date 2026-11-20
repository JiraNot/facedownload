# Project Instructions

## Product decisions

- Product name: **Facebook Video Loader**.
- Keep the UI centered on pasting Facebook links, monitoring the sequential queue, and managing queue items. The product intro, workflow guidance, FAQ, and two ad positions are intentional user-requested sections; do not add unrelated navigation or marketing.
- This is a browser-only app with a Manifest V3 extension. Do not restore the Windows installer or add an app-side Facebook login.
- Use the user's existing signed-in browser profile. Do not collect passwords, request the `cookies` permission, read or store browser cookies, or send Facebook page source/media URLs to the app server.
- The user may add links over time. Process one at a time and wait for its browser download to finish before opening the next post.
- Keep explanatory copy truthful to the extension's real behavior. Do not promise Google or AI Search placement.
- The visible Thai introduction and FAQ are SEO content and must be present in the pre-rendered HTML.
- AdSense is opt-in: render no ad slot and load no Google script unless the client and corresponding numeric slot ID are configured. Never invent publisher or slot IDs.
- Keep the queue in extension session storage. Validate Facebook post and CDN hosts before opening or downloading URLs.
- Pause takes effect after the currently processing/downloading item finishes. Failed items can be retried or removed; active items cannot be removed.

## Architecture

- React/Vite app source is in `src/`.
- `browser-extension/` contains the MV3 extension. `bridge.js` relays same-origin messages; `background.js` validates and processes the queue; `facebook-page.js` reads the loaded post DOM; `video-parser.js` extracts media URLs.
- The extension must not open browser-internal `view-source:` pages. Read the loaded Facebook page using its isolated content script.
- Local use: load `browser-extension/` unpacked in the same Edge/Chrome profile as Facebook, then visit `http://127.0.0.1:4173/` or the Vite dev URL.
- Production use: the GitHub Pages workflow builds the app at `/facedownload/`. Keep the production Pages host/path in the extension manifest and sender validation synchronized.
- `scripts/prerender.mjs` hydrates static HTML from the React server entry after Vite builds `dist/client`. Keep `src/entry-server.jsx` and the SSR step in both production build scripts.
- Never build or publish an EXE. `src-tauri/` may contain ignored legacy local files; do not add it to source control.

## Verification

- Before handing off implementation changes, run `npm run build` and `npm run build:pages`. Check the pre-rendered `dist/client/index.html` for the visible intro/FAQ text and correct canonical URL.
- For a Pages release, inspect the GitHub Actions deployment result and open the published URL. Do not use real Facebook account data for parser fixtures.
- Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the prototype remains compatible with Sites handoff.
