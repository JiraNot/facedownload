# FGet Queue Downloader extension

The extension connects the local FGet web app to the current browser profile so it can process links serially.

## Load in Microsoft Edge

1. Open `edge://extensions` in the Edge profile that is signed in to Facebook.
2. Turn on **Developer mode**.
3. Choose **Load unpacked** and select this `browser-extension` folder.
4. Refresh `http://127.0.0.1:4173/`.
5. Paste one or more Facebook video links into the queue and choose **เพิ่มเข้าคิว**. New links can be added while the queue is running.

The extension opens one Facebook post in a background tab, reads the rendered page source with an isolated content script, and asks the browser download manager to download its best available muxed video URL. It waits for that download to finish before moving to the next item. It does not open browser-internal `view-source:` pages because extensions cannot inject code into those pages.

## Permissions and data

- `downloads`: save each video through the browser download manager.
- `storage`: keep the queue in session-only browser storage while Edge remains open.
- Host access: read Facebook video pages and connect to the local FGet app. The extension uses the basic tabs API to open and close its processing tab; it does not request the separate `tabs` permission for access to unrelated tab URLs/titles.

The extension does not request the `cookies` permission, read or store browser cookies, collect credentials, or send page source to an app server. The browser download manager may attach cookies that already match a CDN host when it requests a media file. Queue URLs and statuses remain in the current browser session. Use it only for videos you are allowed to view and save.

Facebook may return an expired or forbidden CDN link. The queue marks that item as failed and then continues with the next one. Videos with separate audio and video streams are marked unsupported because this browser build does not merge streams.
