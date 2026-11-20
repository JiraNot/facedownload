# Project Instructions

## Product decisions

- Product name: **Facebook Video Loader**.
- Keep the UI focused on pasting Facebook links, monitoring the sequential download queue, and managing queue items. Exclude marketing, FAQs, unrelated navigation, and legacy source-paste controls.
- This is a browser-only app with a Manifest V3 extension. Do not restore the Windows installer or add an app-side Facebook login.
- Use the user's existing signed-in browser profile. Do not collect passwords, request the `cookies` permission, read or store browser cookies, or send Facebook page source/media URLs to the app server.
- The user may add links over time. Process one at a time and wait for its browser download to finish before opening the next post.
- Keep the queue in extension session storage. Validate Facebook post and CDN hosts before opening or downloading URLs.
- Pause takes effect after the currently processing/downloading item finishes. Failed items can be retried or removed; active items cannot be removed.

## Architecture

- React/Vite app source is in `src/`.
- `browser-extension/` contains the MV3 extension. `bridge.js` relays same-origin messages; `background.js` validates and processes the queue; `facebook-page.js` reads the loaded post DOM; `video-parser.js` extracts media URLs.
- The extension must not open browser-internal `view-source:` pages. Read the loaded Facebook page using its isolated content script.
- Local use: load `browser-extension/` unpacked in the same Edge/Chrome profile as Facebook, then visit `http://127.0.0.1:4173/` or the Vite dev URL.
- Production use: the GitHub Pages workflow builds the app at `/facedownload/`. Keep the production Pages host/path in the extension manifest and sender validation synchronized.
- Never build or publish an EXE. `src-tauri/` may contain ignored legacy local files; do not add it to source control.

## Verification

- Before handing off implementation changes, run `npm run build`, `npm run build:pages`, `npm run test:parser`, and `npm run test:sites`.
- For a Pages release, inspect the GitHub Actions deployment result and open the published URL. Do not use real Facebook account data for parser fixtures.
- Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the prototype remains compatible with Sites handoff.
