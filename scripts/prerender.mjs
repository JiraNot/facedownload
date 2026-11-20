import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

const outputDir = path.resolve("dist/client");
const entryPath = path.resolve("dist/ssr/entry-server.js");
const htmlPath = path.join(outputDir, "index.html");
const { render } = await import(pathToFileURL(entryPath).href);
let html = await readFile(htmlPath, "utf8");
const outlet = "<!--ssr-outlet-->";
if (!html.includes(outlet)) throw new Error("Missing SSR outlet in built index.html");

const vercelProductionHost = process.env.VITE_VERCEL_PROJECT_PRODUCTION_URL || "";
const requestedSiteUrl = vercelProductionHost
  ? `https://${vercelProductionHost}`
  : process.env.VITE_SITE_URL || "https://jiranot.github.io/facedownload/";
const parsedSiteUrl = new URL(requestedSiteUrl);
if (parsedSiteUrl.protocol !== "https:") throw new Error("Site URL must use HTTPS");
const siteUrl = parsedSiteUrl.href.endsWith("/") ? parsedSiteUrl.href : `${parsedSiteUrl.href}/`;

const appHtml = render();
html = html.replace(
  `<div id="root">${outlet}</div>`,
  `<div id="root" data-prerendered="true">${appHtml}</div>`,
);

const publisherId = process.env.VITE_ADSENSE_CLIENT || "";
if (/^ca-pub-\d+$/.test(publisherId)) {
  const adsTxtPublisherId = publisherId.replace(/^ca-/, "");
  await writeFile(
    path.join(outputDir, "ads.txt"),
    `google.com, ${adsTxtPublisherId}, DIRECT, f08c47fec0942fa0\n`,
  );
}
const hasAdUnit = /^\d+$/.test(process.env.VITE_ADSENSE_SLOT_TOOL || "") ||
  /^\d+$/.test(process.env.VITE_ADSENSE_SLOT_CONTENT || "");
const adsenseScript = /^ca-pub-\d+$/.test(publisherId) && hasAdUnit
  ? `<script async crossorigin="anonymous" data-facebook-video-loader-adsense src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}"></script>`
  : "";
html = html.replace("<!--adsense-script-->", adsenseScript);
html = html.replaceAll("__SITE_URL__", siteUrl);

await writeFile(htmlPath, html);
await writeFile(
  path.join(outputDir, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${new URL("sitemap.xml", siteUrl).href}\n`,
);
await writeFile(
  path.join(outputDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}</loc>\n  </url>\n</urlset>\n`,
);
console.log("Pre-rendered SEO content to dist/client/index.html");
