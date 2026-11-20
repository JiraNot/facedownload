# Project Instructions

## Prototype workflow

- Run the local server and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.
- Before substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal.
- Record durable prototype feedback and decisions here.
- When implementing from a selected generated mock, treat it as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Product decisions

- Keep the utility screen streamlined: brand and controls for the private-video workflow only. Exclude marketing sections, FAQs, unrelated navigation, and footer content.
- This is a browser-only app. Do not restore the Windows installer or add an app-side Facebook login.
- Use the user's existing signed-in browser profile. Do not collect passwords or read/store browser cookies, and do not send Facebook page source or media URLs to an app server.
- The user adds queue links over time. Process one link at a time and wait for its browser download to finish before opening the next.

## Architecture

- Build the React/Vite web UI in `src/`.
- The single-video workflow parses source pasted by the user in the page and opens a validated Facebook CDN URL in a new browser tab.
- `browser-extension/` contains the Manifest V3 extension required for automatic queue processing. The web page communicates with it through `bridge.js`; the extension opens one Facebook post in a background tab, reads its loaded page DOM with `facebook-page.js` and `video-parser.js`, and downloads through the browser download manager.
- Do not open browser-internal `view-source:` pages from the extension. Read the loaded Facebook page instead.
- Keep the queue in session-only extension storage. Validate Facebook page hosts and Facebook CDN media hosts before opening or downloading URLs.
- The extension should not request the `cookies` permission or persist credentials. The browser may attach matching cookies to its own download request.
- For local Edge use, load `browser-extension/` as an unpacked extension in the same profile as Facebook, then refresh the app at `http://127.0.0.1:4173/`.
- `src-tauri/` contains legacy desktop build artifacts and is excluded from Git. Do not build or publish an EXE unless the user changes the browser-only decision.

## Sites handoff

- Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the local prototype can be handed to Sites.
- Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
