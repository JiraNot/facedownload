# Facebook Video Loader extension

The extension connects the Facebook Video Loader web app to the current Edge or Chrome profile so it can process links sequentially.

## Load the extension

1. Open `edge://extensions` or `chrome://extensions` in the browser profile signed in to Facebook.
2. Turn on **Developer mode**.
3. Choose **Load unpacked** and select this `browser-extension` folder.
4. Open or refresh the web app at `https://jiranot.github.io/facedownload/` (or the local Vite development URL).
5. Paste Facebook video links into the queue. You can keep adding links while it runs.

The extension opens one Facebook post in a background tab, reads the loaded page with an isolated content script, and asks the browser download manager to save the best available muxed video. It waits for the download to finish before processing the next link. Browser-internal `view-source:` pages are not used because extensions cannot inject into them.

## Permissions and data

- `downloads`: save and monitor videos through the browser download manager.
- `storage`: keep queue state in session-only browser storage while the browser remains open.
- Host access: inspect Facebook post pages and connect to the local app or its GitHub Pages origin.

The extension does not request the `cookies` permission, read or store browser cookies, collect credentials, or send page source or media URLs to an app server. The browser may attach matching cookies already available to its own request. Use the extension only for videos you are allowed to view and save.

Expired CDN links may return 403; the extension reopens the post once to get a fresh URL, then reports a failed item if Facebook still rejects it. Videos with separate audio and video streams are not merged.
