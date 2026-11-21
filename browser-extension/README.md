# Facebook Video Loader extension

The extension connects the Facebook Video Loader web app to the current Edge or Chrome profile so it can process links sequentially.

## Load the extension

1. Download the extension ZIP from the web app and extract it to a folder you can keep.
2. Open `edge://extensions` or `chrome://extensions` in the browser profile signed in to Facebook.
3. Turn on **Developer mode** and choose **Load unpacked**.
4. Select the extracted folder containing `manifest.json`, then open or refresh `https://facedownload.vercel.app/` in the same profile. The legacy Pages URL is `https://jiranot.github.io/facedownload/`.
5. Paste Facebook video links into the queue. You can keep adding links while it runs.

The extension opens one Facebook post in a background tab, reads the loaded page with an isolated content script, and asks the browser download manager to save the best available muxed video. It waits for the download to finish before processing the next link. Browser-internal `view-source:` pages are not used because extensions cannot inject into them.

## Permissions and data

- `downloads`: save and monitor videos through the browser download manager.
- `storage`: keep queue state in session-only browser storage while the browser remains open.
- Host access: inspect Facebook post pages and connect to the local app or the configured production web app origin.

The extension does not request the `cookies` permission, read or store browser cookies, collect credentials, or send page source or media URLs to an app server. The browser may attach matching cookies already available to its own request. Use the extension only for videos you are allowed to view and save.

Version 1.3.0 supports selecting an available video quality and download filename pattern for newly queued links. If the web app reports that the extension is out of date, download the current ZIP and reload the extracted folder from the extensions page.

Expired CDN links may return 403; the extension reopens the post once to get a fresh URL, then reports a failed item if Facebook still rejects it. Videos with separate audio and video streams are not merged.
