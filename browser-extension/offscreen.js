import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
} from "mediabunny";

const MAX_STREAM_BYTES = 512 * 1024 * 1024;
const jobs = new Map();
const objectUrls = new Set();

function validateMediaUrl(value) {
  try {
    const url = new URL(String(value || ""));
    const host = url.hostname.toLowerCase();
    const allowed = host === "fbcdn.net" || host.endsWith(".fbcdn.net") ||
      host === "fbsbx.com" || host.endsWith(".fbsbx.com");
    if (!allowed || url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) return "";
    return url.toString();
  } catch {
    return "";
  }
}

async function fetchMedia(url, label) {
  const response = await fetch(url, {
    credentials: "include",
    cache: "no-store",
    redirect: "follow",
  });
  if (!response.ok) {
    const error = new Error(`${label}: Facebook CDN ตอบกลับ HTTP ${response.status}`);
    if (response.status === 403) error.code = "SERVER_FORBIDDEN";
    throw error;
  }

  const declaredLength = Number(response.headers.get("content-length")) || 0;
  if (declaredLength > MAX_STREAM_BYTES) throw new Error(`${label}: ไฟล์ใหญ่เกินขนาดที่รวมในเบราว์เซอร์ได้`);
  if (!response.body) {
    const blob = await response.blob();
    if (blob.size > MAX_STREAM_BYTES) throw new Error(`${label}: ไฟล์ใหญ่เกินขนาดที่รวมในเบราว์เซอร์ได้`);
    return blob;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_STREAM_BYTES) {
        await reader.cancel();
        throw new Error(`${label}: ไฟล์ใหญ่เกินขนาดที่รวมในเบราว์เซอร์ได้`);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return new Blob(chunks, { type: response.headers.get("content-type") || "video/mp4" });
}

function assertTrackCopied(conversion, track, kind) {
  if (!conversion.isValid || !conversion.utilizedTracks.includes(track)) {
    throw new Error(`เบราว์เซอร์ไม่รองรับรูปแบบสตรีม${kind}นี้สำหรับการรวมแบบไม่แปลงคุณภาพ`);
  }
}

async function mergeSeparateStreams(videoUrlValue, audioUrlValue) {
  const videoUrl = validateMediaUrl(videoUrlValue);
  const audioUrl = validateMediaUrl(audioUrlValue);
  if (!videoUrl || !audioUrl) throw new Error("ลิงก์สตรีมวิดีโอหรือเสียงไม่ถูกต้อง");

  const [videoBlob, audioBlob] = await Promise.all([
    fetchMedia(videoUrl, "วิดีโอ"),
    fetchMedia(audioUrl, "เสียง"),
  ]);
  const videoInput = new Input({ formats: ALL_FORMATS, source: new BlobSource(videoBlob) });
  const audioInput = new Input({ formats: ALL_FORMATS, source: new BlobSource(audioBlob) });
  const videoTrack = await videoInput.getPrimaryVideoTrack();
  const audioTrack = await audioInput.getPrimaryAudioTrack();
  if (!videoTrack) throw new Error("ไม่พบแทร็กภาพในสตรีมวิดีโอ");
  if (!audioTrack) throw new Error("ไม่พบแทร็กเสียงในสตรีมเสียง");

  const output = new Output({
    format: new Mp4OutputFormat(),
    target: new BufferTarget(),
  });
  const videoConversion = await Conversion.init({
    input: videoInput,
    output,
    tracks: "primary",
    audio: { discard: true },
    copy: { mode: "forced" },
    composable: true,
  });
  const audioConversion = await Conversion.init({
    input: audioInput,
    output,
    tracks: "primary",
    video: { discard: true },
    copy: { mode: "forced" },
    composable: true,
  });
  assertTrackCopied(videoConversion, videoTrack, "ภาพ");
  assertTrackCopied(audioConversion, audioTrack, "เสียง");

  try {
    await output.start();
    await Promise.all([videoConversion.execute(), audioConversion.execute()]);
    await output.finalize();
  } catch (error) {
    await output.cancel().catch(() => {});
    throw error;
  }

  const buffer = output.target.buffer;
  if (!buffer?.byteLength) throw new Error("สร้างไฟล์วิดีโอที่มีเสียงไม่สำเร็จ");
  const objectUrl = URL.createObjectURL(new Blob([buffer], { type: "video/mp4" }));
  objectUrls.add(objectUrl);
  return objectUrl;
}

function report(type, jobId, data = {}) {
  void chrome.runtime.sendMessage({ type, jobId, ...data }).catch(() => {});
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.target !== "offscreen") return;

  if (message.type === "MEDIA_MERGE_START") {
    const { jobId, itemId, videoUrl, audioUrl } = message;
    if (typeof jobId !== "string" || typeof itemId !== "string") {
      sendResponse({ ok: false, error: "ข้อมูลการรวมสตรีมไม่ครบ" });
      return;
    }
    const existing = jobs.get(jobId);
    if (existing) {
      sendResponse({ ok: true });
      return;
    }

    const job = { itemId, state: "running" };
    jobs.set(jobId, job);
    void mergeSeparateStreams(videoUrl, audioUrl).then((objectUrl) => {
      job.state = "complete";
      job.objectUrl = objectUrl;
      report("MEDIA_MERGE_COMPLETE", jobId, { itemId, objectUrl });
    }).catch((error) => {
      job.state = "failed";
      job.error = String(error?.message || "รวมสตรีมวิดีโอไม่สำเร็จ").slice(0, 180);
      job.errorCode = error?.code === "SERVER_FORBIDDEN" ? "SERVER_FORBIDDEN" : "";
      report("MEDIA_MERGE_FAILED", jobId, { itemId, error: job.error, errorCode: job.errorCode });
    });
    sendResponse({ ok: true });
    return;
  }

  if (message.type === "MEDIA_MERGE_CHECK") {
    const states = {};
    for (const jobId of Array.isArray(message.jobIds) ? message.jobIds : []) {
      const job = jobs.get(jobId);
      if (job) states[jobId] = { ...job };
    }
    sendResponse({ ok: true, states });
    return;
  }

  if (message.type === "MEDIA_REVOKE_URL") {
    const objectUrl = String(message.objectUrl || "");
    if (objectUrls.delete(objectUrl)) URL.revokeObjectURL(objectUrl);
    for (const [jobId, job] of jobs) {
      if (job.objectUrl === objectUrl) jobs.delete(jobId);
    }
    sendResponse({ ok: true });
  }
});
