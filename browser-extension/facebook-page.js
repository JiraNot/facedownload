chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "EXTRACT_FACEBOOK_VIDEO") return;
  try {
    const html = document.documentElement?.outerHTML || "";
    const parsed = globalThis.FGetVideoParser.parseVideoSource(html);
    sendResponse({
      ok: true,
      title: parsed.title || document.title || "Facebook video",
      results: parsed.results,
    });
  } catch {
    sendResponse({ ok: false, error: "อ่านข้อมูลวิดีโอจากหน้า Facebook ไม่สำเร็จ" });
  }
});
