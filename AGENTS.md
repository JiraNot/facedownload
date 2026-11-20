# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

The user prefers a streamlined utility screen. Keep only the brand and the controls required for the private-video download workflow; remove marketing sections, FAQ, unrelated navigation, and footer content.

The user chose a browser-only web app instead of a Windows installer. Keep Facebook login in the user's existing browser profile, parse pasted page source locally, and open signed CDN links directly in that browser. Do not add an app-side Facebook password or cookie collection flow.

For multi-link automation, the user wants to enqueue links over time and process them sequentially, waiting for each download to finish before starting the next. Use a small local browser extension for cross-tab Facebook page access; do not request cookie access or send page data to a server.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
