import test from "node:test";
import assert from "node:assert/strict";
import "../browser-extension/video-parser.js";

const parse = globalThis.FacebookVideoParser.parseVideoSource;

test("extracts muxed qualities and decodes escaped Facebook CDN URLs", () => {
  const html = String.raw`<title>Example video</title><script>{"browser_native_hd_url":"https:\/\/video.xx.fbcdn.net\/v\/high.mp4?token=one\u0026part=two","browser_native_sd_url":"https:\/\/scontent.xx.fbcdn.net\/v\/low.mp4?token=three"}</script>`;
  const parsed = parse(html);

  assert.equal(parsed.title, "Example video");
  assert.deepEqual(parsed.results.map((item) => item.quality), ["720p (HD)", "360p (SD)"]);
  assert.equal(parsed.results[0].videoUrl, "https://video.xx.fbcdn.net/v/high.mp4?token=one&part=two");
  assert.equal(parsed.results[1].videoUrl, "https://scontent.xx.fbcdn.net/v/low.mp4?token=three");
});

test("cuts HTML suffixes from escaped media URLs", () => {
  const html = String.raw`"playable_url_quality_hd":"https:\/\/video.xx.fbcdn.net\/v\/clip.mp4?token=abc<\/script>`;
  const parsed = parse(html);
  assert.equal(parsed.results[0]?.videoUrl, "https://video.xx.fbcdn.net/v/clip.mp4?token=abc");
});

test("rejects insecure and non-Facebook CDN hosts", () => {
  const html = String.raw`{"browser_native_hd_url":"https:\/\/scontent.notfbcdn.net\/v\/bad.mp4","playable_url":"http:\/\/video.xx.fbcdn.net\/v\/insecure.mp4"}`;
  assert.deepEqual(parse(html).results, []);
});

test("returns an empty result when a page has no recognized video URL", () => {
  assert.deepEqual(parse("<title>Text only post</title><p>Nothing to download</p>").results, []);
});
