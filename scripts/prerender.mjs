import { mkdir, readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { COPY } from "../src/i18n.js";

const outputDir = path.resolve("dist/client");
const entryPath = path.resolve("dist/ssr/entry-server.js");
const htmlPath = path.join(outputDir, "index.html");
const templateHtml = await readFile(htmlPath, "utf8");
const { render } = await import(pathToFileURL(entryPath).href);
const outlet = "<!--ssr-outlet-->";
if (!templateHtml.includes(outlet)) throw new Error("Missing SSR outlet in built index.html");

const vercelProductionHost = process.env.VITE_VERCEL_PROJECT_PRODUCTION_URL || "";
const requestedSiteUrl = vercelProductionHost
  ? `https://${vercelProductionHost}`
  : process.env.VITE_SITE_URL || "https://jiranot.github.io/facedownload/";
const parsedSiteUrl = new URL(requestedSiteUrl);
if (parsedSiteUrl.protocol !== "https:") throw new Error("Site URL must use HTTPS");
const siteUrl = parsedSiteUrl.href.endsWith("/") ? parsedSiteUrl.href : `${parsedSiteUrl.href}/`;
const englishUrl = new URL("en/", siteUrl).href;

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

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function renderPage(language, canonicalUrl) {
  const copy = COPY[language];
  const alternatives = [
    `<link rel="alternate" hreflang="th" href="${escapeHtml(siteUrl)}" />`,
    `<link rel="alternate" hreflang="en" href="${escapeHtml(englishUrl)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(siteUrl)}" />`,
  ].join("\n    ");
  const appHtml = render(language);

  return templateHtml
    .replace(`<div id="root">${outlet}</div>`, `<div id="root" data-prerendered="true">${appHtml}</div>`)
    .replaceAll("__LANG__", language)
    .replaceAll("__SITE_URL__", escapeHtml(canonicalUrl))
    .replaceAll("__PAGE_TITLE__", escapeHtml(copy.pageTitle))
    .replaceAll("__PAGE_DESCRIPTION__", escapeHtml(copy.pageDescription))
    .replaceAll("__OG_TITLE__", escapeHtml(copy.ogTitle))
    .replaceAll("__OG_DESCRIPTION__", escapeHtml(copy.ogDescription))
    .replaceAll("__OG_LOCALE__", language === "th" ? "th_TH" : "en_US")
    .replaceAll("__JSON_DESCRIPTION__", JSON.stringify(copy.pageDescription))
    .replace("__ALTERNATE_LANGUAGES__", alternatives)
    .replace("<!--adsense-script-->", adsenseScript);
}

await writeFile(htmlPath, renderPage("th", siteUrl));
await mkdir(path.join(outputDir, "en"), { recursive: true });
await writeFile(path.join(outputDir, "en", "index.html"), renderPage("en", englishUrl));
await writeFile(
  path.join(outputDir, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${new URL("sitemap.xml", siteUrl).href}\n`,
);
await writeFile(
  path.join(outputDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}</loc>\n  </url>\n  <url>\n    <loc>${englishUrl}</loc>\n  </url>\n</urlset>\n`,
);
console.log("Pre-rendered Thai and English pages to dist/client");
