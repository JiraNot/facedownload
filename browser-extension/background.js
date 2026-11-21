// Preserve pending session items when upgrading the earlier local extension.
const QUEUE_KEY = "fgetQueue";
const QUEUE_PAUSED_KEY = "facebookVideoLoaderQueuePaused";
const MAX_QUEUE_SIZE = 50;
const QUALITY_PREFERENCES = new Set(["auto", "1080", "720", "360"]);
const FILENAME_PATTERNS = new Set(["title", "date-title", "title-id"]);
const OFFSCREEN_PATH = "offscreen.html";
let queueRunner = null;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readQueue() {
  return chrome.storage.session.get(QUEUE_KEY).then((value) =>
    Array.isArray(value[QUEUE_KEY]) ? value[QUEUE_KEY] : []
  );
}

async function writeQueue(queue) {
  await chrome.storage.session.set({ [QUEUE_KEY]: queue });
  return queue;
}

async function readPaused() {
  const values = await chrome.storage.session.get(QUEUE_PAUSED_KEY);
  return Boolean(values[QUEUE_PAUSED_KEY]);
}

async function writePaused(paused) {
  await chrome.storage.session.set({ [QUEUE_PAUSED_KEY]: Boolean(paused) });
  return Boolean(paused);
}

function isAppSender(sender) {
  try {
    const url = new URL(sender.url || "");
    return (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)) ||
      (url.protocol === "https:" && url.hostname === "jiranot.github.io" && url.pathname.startsWith("/facedownload/")) ||
      (url.protocol === "https:" && url.hostname === "facedownload.vercel.app");
  } catch {
    return false;
  }
}

function normalizeFacebookUrl(value) {
  try {
    const url = new URL(String(value).trim().replace(/^view-source:/i, ""));
    const host = url.hostname.toLowerCase();
    const allowed = host === "facebook.com" || host.endsWith(".facebook.com") ||
      host === "fb.watch" || host.endsWith(".fb.watch") ||
      host === "fb.gg" || host.endsWith(".fb.gg");
    if (!allowed || !["http:", "https:"].includes(url.protocol) || url.username || url.password || (url.port && url.port !== "443")) return "";
    url.protocol = "https:";
    url.username = "";
    url.password = "";
    return url.toString();
  } catch {
    return "";
  }
}

function safeFilename(value, fallback) {
  const result = String(value || fallback)
    .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/g, "")
    .slice(0, 100);
  return result || fallback;
}

function normalizeCustomFilename(value) {
  const baseName = String(value || "").trim().replace(/\.mp4$/i, "");
  return baseName ? safeFilename(baseName, "") : "";
}

async function replaceQueueItem(id, changes) {
  const queue = await readQueue();
  const updated = queue.map((item) => item.id === id
    ? { ...item, ...changes, updatedAt: Date.now() }
    : item
  );
  await writeQueue(updated);
  return updated;
}

async function setQueueItem(id, changes) {
  return replaceQueueItem(id, changes);
}

function waitForTabComplete(tabId, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      chrome.tabs.onUpdated.removeListener(onUpdated);
      error ? reject(error) : resolve();
    };
    const onUpdated = (changedTabId, changeInfo) => {
      if (changedTabId === tabId && changeInfo.status === "complete") finish();
    };
    const timer = setTimeout(() => finish(new Error("Facebook เปิดหน้าไม่สำเร็จหรือใช้เวลานานเกินไป")), timeoutMs);
    chrome.tabs.onUpdated.addListener(onUpdated);
    chrome.tabs.get(tabId).then((tab) => {
      if (tab.status === "complete") finish();
    }).catch(() => finish(new Error("หาแท็บ Facebook ที่เปิดไว้ไม่พบ")));
  });
}

async function isOffscreenDocumentOpen() {
  const documentUrl = chrome.runtime.getURL(OFFSCREEN_PATH);
  if (typeof chrome.runtime.getContexts === "function") {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [documentUrl],
    });
    return contexts.length > 0;
  }
  if (typeof chrome.offscreen?.hasDocument === "function") return chrome.offscreen.hasDocument();
  return false;
}

async function ensureOffscreenDocument() {
  if (await isOffscreenDocumentOpen()) return;
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_PATH,
    reasons: ["BLOBS"],
    justification: "Combine a Facebook video and its matching audio stream locally in the browser.",
  }).catch(async (error) => {
    if (await isOffscreenDocumentOpen()) return;
    throw error;
  });
}

async function askOffscreen(message) {
  await ensureOffscreenDocument();
  return chrome.runtime.sendMessage({ target: "offscreen", ...message });
}

function revokeMergedObjectUrl(objectUrl) {
  if (!objectUrl) return;
  void chrome.runtime.sendMessage({
    target: "offscreen",
    type: "MEDIA_REVOKE_URL",
    objectUrl,
  }).catch(() => {});
}

async function extractVideoFromTab(tabId) {
  await delay(1000);
  let lastError;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, { type: "EXTRACT_FACEBOOK_VIDEO" });
      if (response?.ok && response.results?.length) return response;
      if (response?.error) lastError = new Error(response.error);
    } catch (error) {
      lastError = error;
    }
    await delay(1200);
  }
  throw lastError || new Error("ไม่พบวิดีโอในหน้าที่เปิด กรุณาตรวจการเข้าสู่ระบบและสิทธิ์เข้าถึง");
}

function waitForDownloadUpdate(downloadId) {
  return new Promise((resolve) => {
    const onChanged = (delta) => {
      if (delta.id !== downloadId || !delta.state) return;
      if (delta.state.current !== "complete" && delta.state.current !== "interrupted") return;
      chrome.downloads.onChanged.removeListener(onChanged);
      resolve(delta.state.current);
    };
    chrome.downloads.onChanged.addListener(onChanged);
    chrome.downloads.search({ id: downloadId }).then((items) => {
      const state = items[0]?.state;
      if (state === "complete" || state === "interrupted") {
        chrome.downloads.onChanged.removeListener(onChanged);
        resolve(state);
      }
    }).catch(() => {});
  });
}

async function finishDownload(downloadId, state, errorCode = "") {
  const queue = await readQueue();
  const item = queue.find((entry) => entry.downloadId === downloadId && entry.status === "downloading");
  if (!item) return;

  if (state === "interrupted" && errorCode === "SERVER_FORBIDDEN" && (item.freshUrlRetry || 0) < 1) {
    revokeMergedObjectUrl(item.objectUrl);
    await setQueueItem(item.id, {
      status: "queued",
      detail: "ลิงก์ CDN หมดอายุ (403) กำลังเปิดโพสต์เพื่อหาลิงก์ใหม่",
      downloadId: null,
      objectUrl: null,
      mergeJobId: null,
      freshUrlRetry: 1,
    });
    startQueueRunner();
    return;
  }

  revokeMergedObjectUrl(item.objectUrl);

  const detail = state === "complete"
    ? "เสร็จแล้ว"
    : errorCode === "SERVER_FORBIDDEN"
      ? "Facebook CDN ปฏิเสธลิงก์หลังลองใหม่ (403) — ตรวจสิทธิ์โพสต์แล้วลองอีกครั้ง"
      : errorCode === "USER_CANCELED"
        ? "ยกเลิกการดาวน์โหลด"
        : "ดาวน์โหลดไม่สำเร็จ — ตรวจลิงก์หรือการเข้าสู่ระบบ";
  await setQueueItem(item.id, {
    status: state === "complete" ? "complete" : "failed",
    detail,
    downloadId: null,
    objectUrl: null,
    mergeJobId: null,
  });
  startQueueRunner();
}

chrome.downloads.onChanged.addListener((delta) => {
  if (delta.state?.current === "complete") void finishDownload(delta.id, "complete");
  if (delta.state?.current === "interrupted") void finishDownload(delta.id, "interrupted", delta.error?.current || "");
});

function chooseMedia(results, preference) {
  const muxed = results.filter((result) => result.videoUrl && (!result.audioUrl || result.audioUrl === result.videoUrl));
  const separate = results.filter((result) => result.videoUrl && result.audioUrl && result.audioUrl !== result.videoUrl);
  const available = [...muxed, ...separate];
  if (!available.length) return { media: null, preferenceUnavailable: false };
  if (!preference || preference === "auto") {
    const media = muxed[0] || separate[0];
    return { media, preferenceUnavailable: false, requiresMerge: Boolean(media.audioUrl && media.audioUrl !== media.videoUrl) };
  }

  const wanted = available.find((result) => new RegExp(`(?:^|\\D)${preference}p`, "i").test(result.quality));
  const media = wanted || muxed[0] || separate[0];
  return {
    media,
    preferenceUnavailable: !wanted,
    requiresMerge: Boolean(media.audioUrl && media.audioUrl !== media.videoUrl),
  };
}

function buildDownloadBaseName(title, item) {
  const safeTitle = safeFilename(title, `facebook-video-${item.id.slice(0, 8)}`);
  if (item.customFilename) return safeFilename(item.customFilename, safeTitle);
  if (item.filenamePattern === "date-title") {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return safeFilename(`${localDate}_${safeTitle}`, safeTitle);
  }
  if (item.filenamePattern === "title-id") {
    return safeFilename(`${safeTitle}_${item.id.slice(0, 8)}`, safeTitle);
  }
  return safeTitle;
}

async function processOne(item) {
  let tabId;
  try {
    await setQueueItem(item.id, { status: "opening", detail: "กำลังเปิดหน้า Facebook", title: "" });
    const tab = await chrome.tabs.create({ url: item.url, active: false });
    tabId = tab.id;
    if (typeof tabId !== "number") throw new Error("เปิดแท็บ Facebook ไม่สำเร็จ");
    await waitForTabComplete(tabId);
    await setQueueItem(item.id, { status: "searching", detail: "กำลังค้นหาลิงก์วิดีโอ" });

    const page = await extractVideoFromTab(tabId);
    const preference = QUALITY_PREFERENCES.has(item.qualityPreference) ? item.qualityPreference : "auto";
    const { media, preferenceUnavailable, requiresMerge } = chooseMedia(page.results, preference);
    if (!media) {
      throw new Error("ไม่พบลิงก์วิดีโอในหน้า Facebook กรุณาตรวจว่าเข้าสู่ระบบและเปิดวิดีโอได้");
    }

    const title = safeFilename(page.title, `facebook-video-${item.id.slice(0, 8)}`);
    const filename = buildDownloadBaseName(title, item);
    if (requiresMerge) {
      const mergeJobId = crypto.randomUUID();
      await setQueueItem(item.id, {
        status: "merging",
        detail: "กำลังรวมภาพและเสียง",
        title: page.title || title,
        quality: media.quality,
        filename,
        downloadId: null,
        objectUrl: null,
        mergeJobId,
      });
      const started = await askOffscreen({
        type: "MEDIA_MERGE_START",
        jobId: mergeJobId,
        itemId: item.id,
        videoUrl: media.videoUrl,
        audioUrl: media.audioUrl,
      });
      if (!started?.ok) throw new Error(started?.error || "เริ่มรวมเสียงกับวิดีโอไม่สำเร็จ");
      await chrome.tabs.remove(tabId).catch(() => {});
      tabId = undefined;
      return;
    }

    await chrome.tabs.remove(tabId).catch(() => {});
    tabId = undefined;

    const downloadId = await chrome.downloads.download({
      url: media.videoUrl,
      filename: `Facebook Video Loader/${filename}.mp4`,
      conflictAction: "uniquify",
      saveAs: false,
    });
    await setQueueItem(item.id, {
      status: "downloading",
      detail: preferenceUnavailable
        ? `ไม่พบ ${preference}p ใช้ ${media.quality} แทน`
        : `กำลังดาวน์โหลด ${media.quality}`,
      title: page.title || title,
      quality: media.quality,
      downloadId,
      objectUrl: null,
      mergeJobId: null,
    });
    const [download] = await chrome.downloads.search({ id: downloadId });
    if (download?.state === "complete" || download?.state === "interrupted") {
      await finishDownload(downloadId, download.state, download.error || "");
    }
  } catch (error) {
    await setQueueItem(item.id, {
      status: "failed",
      detail: String(error?.message || "ประมวลผลรายการนี้ไม่สำเร็จ").slice(0, 180),
      downloadId: null,
      objectUrl: null,
      mergeJobId: null,
    });
  } finally {
    if (typeof tabId === "number") await chrome.tabs.remove(tabId).catch(() => {});
  }
}

async function recoverInterruptedWork() {
  const queue = await readQueue();
  let changed = false;
  const recovered = queue.map((item) => {
    if (item.status === "opening" || item.status === "searching" || (item.status === "merging" && !item.mergeJobId)) {
      changed = true;
      return { ...item, status: "queued", detail: "รอคิวหลังกลับมาเชื่อมต่อ", mergeJobId: null, updatedAt: Date.now() };
    }
    return item;
  });
  if (changed) await writeQueue(recovered);

  const mergingItems = recovered.filter((item) => item.status === "merging" && item.mergeJobId);
  if (!mergingItems.length) return;

  let states = {};
  if (await isOffscreenDocumentOpen()) {
    const status = await chrome.runtime.sendMessage({
      target: "offscreen",
      type: "MEDIA_MERGE_CHECK",
      jobIds: mergingItems.map((item) => item.mergeJobId),
    }).catch(() => null);
    states = status?.states || {};
  }

  const restartIds = [];
  for (const item of mergingItems) {
    const state = states[item.mergeJobId];
    if (state?.state === "running") continue;
    if (state?.state === "complete" && state.objectUrl) {
      await startMergedDownload(item.id, item.mergeJobId, state.objectUrl);
      continue;
    }
    if (state?.state === "failed") {
      await handleMergeFailure(item.id, item.mergeJobId, state.error, state.errorCode);
      continue;
    }
    restartIds.push(item.id);
  }

  if (restartIds.length) {
    const currentQueue = await readQueue();
    const retryQueue = currentQueue.map((item) => restartIds.includes(item.id)
      ? { ...item, status: "queued", detail: "รอคิวหลังเริ่มการรวมใหม่", mergeJobId: null, updatedAt: Date.now() }
      : item
    );
    await writeQueue(retryQueue);
  }
}

async function startMergedDownload(itemId, jobId, objectUrl) {
  const queue = await readQueue();
  const item = queue.find((entry) => entry.id === itemId && entry.status === "merging" && entry.mergeJobId === jobId);
  if (!item) {
    revokeMergedObjectUrl(objectUrl);
    return;
  }

  try {
    const filename = safeFilename(item.filename, `facebook-video-${item.id.slice(0, 8)}`);
    const downloadId = await chrome.downloads.download({
      url: objectUrl,
      filename: `Facebook Video Loader/${filename}.mp4`,
      conflictAction: "uniquify",
      saveAs: false,
    });
    await setQueueItem(item.id, {
      status: "downloading",
      detail: `กำลังดาวน์โหลด ${item.quality || "วิดีโอ"}`,
      downloadId,
      objectUrl,
      mergeJobId: null,
    });
    const [download] = await chrome.downloads.search({ id: downloadId });
    if (download?.state === "complete" || download?.state === "interrupted") {
      await finishDownload(downloadId, download.state, download.error || "");
    }
  } catch (error) {
    revokeMergedObjectUrl(objectUrl);
    await setQueueItem(item.id, {
      status: "failed",
      detail: String(error?.message || "เริ่มดาวน์โหลดไฟล์ที่รวมแล้วไม่สำเร็จ").slice(0, 180),
      downloadId: null,
      objectUrl: null,
      mergeJobId: null,
    });
    startQueueRunner();
  }
}

async function handleMergeFailure(itemId, jobId, detail, errorCode = "") {
  const queue = await readQueue();
  const item = queue.find((entry) => entry.id === itemId && entry.status === "merging" && entry.mergeJobId === jobId);
  if (!item) return;

  if (errorCode === "SERVER_FORBIDDEN" && (item.freshUrlRetry || 0) < 1) {
    await setQueueItem(item.id, {
      status: "queued",
      detail: "ลิงก์ CDN หมดอายุ (403) กำลังเปิดโพสต์เพื่อหาลิงก์ใหม่",
      mergeJobId: null,
      freshUrlRetry: 1,
    });
  } else {
    await setQueueItem(item.id, {
      status: "failed",
      detail: String(detail || "รวมสตรีมวิดีโอไม่สำเร็จ").slice(0, 180),
      mergeJobId: null,
    });
  }
  startQueueRunner();
}

function isOffscreenSender(sender) {
  return sender.url === chrome.runtime.getURL(OFFSCREEN_PATH);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!isOffscreenSender(sender)) return;
  if (message?.type === "MEDIA_MERGE_COMPLETE") {
    void startMergedDownload(message.itemId, message.jobId, message.objectUrl).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (message?.type === "MEDIA_MERGE_FAILED") {
    void handleMergeFailure(message.itemId, message.jobId, message.error, message.errorCode)
      .then(() => sendResponse({ ok: true }));
    return true;
  }
});

async function drainQueue() {
  await recoverInterruptedWork();
  while (true) {
    if (await readPaused()) return;
    const queue = await readQueue();
    if (queue.some((item) => ["downloading", "merging"].includes(item.status))) return;
    const next = queue.find((item) => item.status === "queued");
    if (!next) return;
    await processOne(next);
  }
}

function startQueueRunner() {
  if (queueRunner) return queueRunner;
  queueRunner = drainQueue().catch(() => {}).finally(() => {
    queueRunner = null;
    void readQueue().then((queue) => {
      const hasActiveWork = queue.some((item) => ["downloading", "merging"].includes(item.status));
      if (!hasActiveWork && queue.some((item) => item.status === "queued")) {
        void readPaused().then((paused) => { if (!paused) startQueueRunner(); }).catch(() => {});
      }
    }).catch(() => {});
  });
  return queueRunner;
}

async function addToQueue(urlValues, options = {}) {
  const qualityPreference = QUALITY_PREFERENCES.has(options.qualityPreference) ? options.qualityPreference : "auto";
  const filenamePattern = FILENAME_PATTERNS.has(options.filenamePattern) ? options.filenamePattern : "title";
  const seenUrls = new Set();
  const normalized = [];
  for (const entry of Array.isArray(urlValues) ? urlValues : []) {
    const isObject = entry && typeof entry === "object";
    const url = normalizeFacebookUrl(isObject ? entry.url : entry);
    if (!url || seenUrls.has(url)) continue;
    seenUrls.add(url);
    normalized.push({
      url,
      customFilename: normalizeCustomFilename(entry?.customFilename),
      qualityPreference: QUALITY_PREFERENCES.has(entry?.qualityPreference) ? entry.qualityPreference : qualityPreference,
      filenamePattern: FILENAME_PATTERNS.has(entry?.filenamePattern) ? entry.filenamePattern : filenamePattern,
    });
  }
  if (!normalized.length) throw new Error("ไม่พบ URL Facebook ที่ถูกต้อง");

  const queue = await readQueue();
  const activeUrls = new Set(queue
    .filter((item) => ["queued", "opening", "searching", "merging", "downloading"].includes(item.status))
    .map((item) => item.url));
  const newUrls = normalized.filter((entry) => !activeUrls.has(entry.url));
  if (queue.filter((item) => ["queued", "opening", "searching", "merging", "downloading"].includes(item.status)).length + newUrls.length > MAX_QUEUE_SIZE) {
    throw new Error(`คิวรองรับรายการที่ยังไม่เสร็จได้สูงสุด ${MAX_QUEUE_SIZE} รายการ`);
  }

  const added = newUrls.map((entry) => ({
    id: crypto.randomUUID(),
    url: entry.url,
    status: "queued",
    title: "",
    detail: "รอคิว",
    qualityPreference: entry.qualityPreference,
    filenamePattern: entry.filenamePattern,
    customFilename: entry.customFilename,
    downloadId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));
  const updatedQueue = await writeQueue([...queue, ...added]);
  void startQueueRunner();
  return {
    queue: updatedQueue,
    addedCount: added.length,
    duplicateCount: normalized.length - added.length,
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!isAppSender(sender)) return;

  if (message?.type === "PING") {
    sendResponse({ available: true, version: chrome.runtime.getManifest().version });
    return;
  }

  if (message?.type === "QUEUE_GET") {
    (async () => {
      const queue = await readQueue();
      const paused = await readPaused();
      if (!paused && !queueRunner && queue.some((item) => ["queued", "opening", "searching", "merging"].includes(item.status))) {
        void startQueueRunner();
      }
      sendResponse({ available: true, queue, paused });
    })();
    return true;
  }

  if (message?.type === "QUEUE_ADD") {
    (async () => {
      try {
        const result = await addToQueue(message.urls, {
          qualityPreference: message.qualityPreference,
          filenamePattern: message.filenamePattern,
        });
        sendResponse({ available: true, paused: await readPaused(), invalidCount: Number(message.invalidCount) || 0, ...result });
      } catch (error) {
        sendResponse({ available: true, paused: await readPaused(), error: String(error?.message || "เพิ่มคิวไม่สำเร็จ"), queue: await readQueue() });
      }
    })();
    return true;
  }

  if (message?.type === "QUEUE_CLEAR_COMPLETED") {
    (async () => {
      const queue = await readQueue();
      const remaining = queue.filter((item) => !["complete", "failed"].includes(item.status));
      sendResponse({ available: true, queue: await writeQueue(remaining), paused: await readPaused(), notice: "ล้างรายการที่จบแล้วออกจากคิว" });
    })();
    return true;
  }

  if (message?.type === "QUEUE_PAUSE" || message?.type === "QUEUE_RESUME") {
    (async () => {
      const paused = await writePaused(message.type === "QUEUE_PAUSE");
      if (!paused) void startQueueRunner();
      sendResponse({ available: true, queue: await readQueue(), paused, notice: paused ? "พักคิวแล้ว" : "ทำคิวต่อแล้ว" });
    })();
    return true;
  }

  if (message?.type === "QUEUE_RETRY") {
    (async () => {
      const queue = await readQueue();
      const item = queue.find((entry) => entry.id === message.id);
      if (!item || item.status !== "failed") {
        sendResponse({ available: true, queue, paused: await readPaused(), error: "ลองใหม่ได้เฉพาะรายการที่ไม่สำเร็จ" });
        return;
      }
      await replaceQueueItem(item.id, { status: "queued", detail: "รอคิวอีกครั้ง", downloadId: null, freshUrlRetry: 0 });
      if (!await readPaused()) void startQueueRunner();
      sendResponse({ available: true, queue: await readQueue(), paused: await readPaused(), notice: "เพิ่มรายการให้ลองใหม่แล้ว" });
    })();
    return true;
  }

  if (message?.type === "QUEUE_REMOVE") {
    (async () => {
      const queue = await readQueue();
      const item = queue.find((entry) => entry.id === message.id);
      if (!item || !["queued", "complete", "failed"].includes(item.status)) {
        sendResponse({ available: true, queue, paused: await readPaused(), error: "นำออกได้เฉพาะรายการที่ยังไม่เริ่มหรือจบแล้ว" });
        return;
      }
      const updated = await writeQueue(queue.filter((entry) => entry.id !== item.id));
      sendResponse({ available: true, queue: updated, paused: await readPaused(), notice: "นำรายการออกจากคิวแล้ว" });
    })();
    return true;
  }
});
