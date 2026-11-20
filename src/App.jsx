import { useEffect, useRef, useState } from "react";

function isFacebookHost(host) {
  const value = (host || "").toLowerCase();
  return (
    value === "facebook.com" ||
    value.endsWith(".facebook.com") ||
    value === "fb.watch" ||
    value.endsWith(".fb.watch") ||
    value === "fb.gg" ||
    value.endsWith(".fb.gg")
  );
}

function isFacebookPageUrl(value) {
  try {
    const url = new URL(value.replace(/^view-source:/i, "").trim());
    return (url.protocol === "https:" || url.protocol === "http:") && isFacebookHost(url.hostname);
  } catch {
    return false;
  }
}

function isFacebookMediaUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const facebookMediaHost =
      host === "fbcdn.net" ||
      host.endsWith(".fbcdn.net") ||
      host === "fbsbx.com" ||
      host.endsWith(".fbsbx.com");
    return url.protocol === "https:" && facebookMediaHost;
  } catch {
    return false;
  }
}

function decodeCandidate(value) {
  if (!value) return "";
  const cleaned = value
    .replace(/&amp;/gi, "&")
    .replace(/\\u0026/gi, "&")
    .replace(/\\u003d/gi, "=")
    .replace(/\\u002f/gi, "/");
  let decoded;
  try {
    decoded = JSON.parse('"' + cleaned.replace(/"/g, '\\"') + '"');
  } catch {
    decoded = cleaned.replace(/\\\//g, "/").replace(/\\\\/g, "\\");
  }
  const markupStart = decoded.search(/(?:<|%3c)\//i);
  return (markupStart >= 0 ? decoded.slice(0, markupStart) : decoded)
    .replace(/[<>\s"'`]+$/g, "")
    .trim();
}

function firstMatch(source, patterns) {
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match && match[1]) {
      const value = decodeCandidate(match[1]);
      if (value) return value;
    }
  }
  return "";
}

function parseVideoSource(source) {
  const definitions = [
    {
      quality: "1080p (HD)",
      patterns: [
        /FBQualityClass=..hd.. FBQualityLabel=..1080p[\s\S]+?BaseURL>(https[\s\S]+?)BaseURL/i,
      ],
    },
    {
      quality: "720p (HD)",
      patterns: [
        /FBQualityClass=..hd.. FBQualityLabel=..720p[\s\S]+?BaseURL>(https[\s\S]+?)BaseURL/i,
        /(?:browser_native_hd_url|playable_url_quality_hd|hd_src_no_ratelimit|hd_src)(?:\\)?\"?\s*:\s*(?:\\)?\"([^\"]+)/i,
      ],
    },
    {
      quality: "360p (SD)",
      patterns: [
        /(?:browser_native_sd_url|playable_url|sd_src_no_ratelimit|sd_src)(?:\\)?\"?\s*:\s*(?:\\)?\"([^\"]+)/i,
        /property=[\"']og:video:url[\"'][^>]*content=[\"']([^\"']+)/i,
        /contentUrl[\"']?\s*:\s*[\"']([^\"']+)/i,
        /<video[^>]*src=[\"']([^\"']+)/i,
      ],
    },
  ];

  const audioUrl = firstMatch(source, [
    /\"mime_type\"\s*:\s*\"audio(?:\\\/|\/)mp4\"[^}]*?\"base_url\"\s*:\s*\"([^\"]+)/i,
    /(?:audio_url|audio_src)(?:\\)?\"?\s*:\s*(?:\\)?\"([^\"]+)/i,
  ]);

  const results = [];
  const seen = new Set();
  for (const definition of definitions) {
    const candidate = firstMatch(source, definition.patterns);
    if (candidate && isFacebookMediaUrl(candidate) && !seen.has(candidate)) {
      results.push({
        quality: definition.quality,
        videoUrl: candidate,
        audioUrl: isFacebookMediaUrl(audioUrl) ? audioUrl : "",
      });
      seen.add(candidate);
    }
  }

  if (results.length === 0) {
    const fallback = firstMatch(source, [
      /(?:video[\"']?\s*,\s*[\"']src[\"']|video_url|video_src)(?:\\)?\"?\s*:\s*(?:\\)?\"([^\"]+)/i,
      /<source[^>]*src=[\"']([^\"']+\.mp4[^\"']*)/i,
    ]);
    if (fallback && isFacebookMediaUrl(fallback)) {
      results.push({
        quality: "วิดีโอ",
        videoUrl: fallback,
        audioUrl: isFacebookMediaUrl(audioUrl) ? audioUrl : "",
      });
    }
  }

  const title = firstMatch(source, [
    /<h2 class="uiHeaderTitle"?[^>]*>([\s\S]+?)<\/h2>/i,
    /<title[^>]*>([\s\S]+?)<\/title>/i,
    /<title id="pageTitle">([\s\S]+?)<\/title>/i,
  ])
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return { title, results };
}

export function App() {
  const [videoUrl, setVideoUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceHtml, setSourceHtml] = useState("");
  const [results, setResults] = useState([]);
  const [videoTitle, setVideoTitle] = useState("");
  const [error, setError] = useState("");
  const [downloadMessage, setDownloadMessage] = useState("");
  const [copyDone, setCopyDone] = useState(false);
  const [queueText, setQueueText] = useState("");
  const [queueItems, setQueueItems] = useState([]);
  const [queueFeedback, setQueueFeedback] = useState("");
  const [queueSubmitting, setQueueSubmitting] = useState(false);
  const [extensionAvailable, setExtensionAvailable] = useState(false);
  const queueRequestRef = useRef("");
  const extensionAvailableRef = useRef(false);

  useEffect(() => {
    function send(type, extra = {}) {
      window.postMessage({ source: "fget-web", type, requestId: crypto.randomUUID(), ...extra }, window.location.origin);
    }

    function receive(event) {
      if (event.source !== window || event.origin !== window.location.origin) return;
      const message = event.data;
      if (message?.source !== "fget-extension") return;

      extensionAvailableRef.current = Boolean(message.available ?? true);
      setExtensionAvailable(extensionAvailableRef.current);

      if (message.type === "PING_RESULT") return;
      if (message.type === "QUEUE_GET_RESULT") {
        setQueueItems(Array.isArray(message.queue) ? message.queue : []);
        return;
      }
      if (message.type === "QUEUE_ADD_RESULT") {
        if (message.requestId === queueRequestRef.current) {
          setQueueSubmitting(false);
          if (!message.error) setQueueText("");
          const notices = [
            `เพิ่ม ${message.addedCount} รายการเข้าคิวแล้ว ระบบจะทำทีละรายการ`,
            message.duplicateCount ? `ข้ามลิงก์ซ้ำ ${message.duplicateCount} รายการ` : "",
            message.invalidCount ? `ข้ามลิงก์ที่ไม่ใช่ Facebook ${message.invalidCount} รายการ` : "",
          ].filter(Boolean);
          setQueueFeedback(message.error || notices.join(" • "));
        }
        setQueueItems(Array.isArray(message.queue) ? message.queue : []);
        return;
      }
      if (message.type === "QUEUE_CLEAR_COMPLETED_RESULT") {
        setQueueItems(Array.isArray(message.queue) ? message.queue : []);
        setQueueFeedback("ล้างรายการเสร็จแล้วออกจากคิว");
      }
    }

    window.addEventListener("message", receive);
    send("PING");
    send("QUEUE_GET");
    const pingTimer = window.setInterval(() => {
      if (!extensionAvailableRef.current) send("PING");
    }, 2500);
    const queueTimer = window.setInterval(() => {
      if (extensionAvailableRef.current) send("QUEUE_GET");
    }, 2000);

    return () => {
      window.removeEventListener("message", receive);
      window.clearInterval(pingTimer);
      window.clearInterval(queueTimer);
    };
  }, []);

  function updateVideoUrl(value) {
    const trimmed = value.trim();
    setVideoUrl(value);
    setResults([]);
    setVideoTitle("");
    setError("");
    setDownloadMessage("");
    setCopyDone(false);

    if (!isFacebookPageUrl(trimmed)) {
      setSourceUrl("");
      return;
    }

    let target = trimmed.replace(/^view-source:/i, "");
    if (target.includes("/reel")) {
      const reelMatch = target.match(/reel\/?(\d+)/i);
      if (reelMatch) target = "https://facebook.com/videos/?v=" + reelMatch[1];
    }
    setSourceUrl("view-source:" + target);
  }

  async function pasteVideoUrl() {
    try {
      const value = await navigator.clipboard.readText();
      if (value) updateVideoUrl(value);
    } catch {
      setError("วาง URL ไม่สำเร็จ กรุณาวางในช่องด้วยตนเอง");
    }
  }

  async function copySourceUrl() {
    try {
      await navigator.clipboard.writeText(sourceUrl);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setError("คัดลอกลิงก์ไม่สำเร็จ กรุณาเลือกข้อความแล้วคัดลอกด้วยตนเอง");
    }
  }

  function submitSource(event) {
    event.preventDefault();
    setError("");
    setDownloadMessage("");
    const parsed = parseVideoSource(sourceHtml);
    if (!parsed.results.length) {
      setResults([]);
      setVideoTitle("");
      setError("ซอร์สโค้ดไม่ถูกต้อง กรุณาคัดลอกใหม่จากหน้า Facebook");
      return;
    }
    setResults(parsed.results);
    setVideoTitle(parsed.title);
  }

  function addQueueItems(event) {
    event.preventDefault();
    const urls = [...new Set(queueText
      .split(/[\s,;]+/)
      .map((value) => value.trim().replace(/^view-source:/i, ""))
      .filter(Boolean))];

    if (!urls.length) {
      setQueueFeedback("วาง URL Facebook อย่างน้อยหนึ่งรายการก่อนเพิ่มเข้าคิว");
      return;
    }
    const invalidCount = urls.filter((url) => !isFacebookPageUrl(url)).length;
    const validUrls = urls.filter(isFacebookPageUrl);
    if (!validUrls.length) {
      setQueueFeedback("ไม่พบ URL Facebook ที่ถูกต้องในรายการ");
      return;
    }
    if (!extensionAvailable) {
      setQueueFeedback("ต้องเปิดส่วนขยาย FGet ในเบราว์เซอร์นี้ก่อน จึงจะอ่านหน้าที่ล็อกอินและจัดคิวดาวน์โหลดได้");
      return;
    }

    const requestId = crypto.randomUUID();
    queueRequestRef.current = requestId;
    setQueueSubmitting(true);
    setQueueFeedback("กำลังเพิ่มรายการเข้าคิว…");
    window.postMessage({
      source: "fget-web",
      type: "QUEUE_ADD",
      requestId,
      urls: validUrls,
      invalidCount,
    }, window.location.origin);
    window.setTimeout(() => {
      if (queueRequestRef.current === requestId) {
        setQueueSubmitting(false);
        setQueueFeedback((current) => current === "กำลังเพิ่มรายการเข้าคิว…" ? "ส่วนขยายไม่ตอบกลับ ลองรีเฟรชเว็บแอปหลังเปิดส่วนขยาย" : current);
      }
    }, 10000);
  }

  function clearCompletedQueue() {
    window.postMessage({ source: "fget-web", type: "QUEUE_CLEAR_COMPLETED", requestId: crypto.randomUUID() }, window.location.origin);
  }

  function openVideo(result) {
    if (result.audioUrl && result.audioUrl !== result.videoUrl) {
      setError("Facebook แยกภาพกับเสียง เว็บแอปเปิดวิดีโอได้แต่รวมเสียงไม่ได้ กรุณาเลือกคุณภาพที่มีเสียงครบ");
      return;
    }

    setError("");
    setDownloadMessage("เปิดลิงก์ในแท็บใหม่แล้ว หากเบราว์เซอร์เล่นวิดีโอแทนการบันทึก ให้คลิกขวาที่วิดีโอแล้วเลือกบันทึกวิดีโอเป็น");
  }

  function resetForm() {
    setVideoUrl("");
    setSourceUrl("");
    setSourceHtml("");
    setResults([]);
    setVideoTitle("");
    setError("");
    setDownloadMessage("");
    setCopyDone(false);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-brand" aria-label="FGet.io">
            <span className="logo-gradient">FGet</span>
            <small>.io</small>
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="form-section" aria-labelledby="page-title">
          <div className="app-content">
            <div className="app-heading">
              <h1 id="page-title">ดาวน์โหลดวิดีโอส่วนตัว Facebook</h1>
              <p>เปิด Facebook ในเบราว์เซอร์เดียวกันและเข้าสู่ระบบก่อนคัดลอกซอร์ส • ใช้กับวิดีโอที่คุณมีสิทธิ์ดู</p>
            </div>

            <form id="private-form" className="private-form-form" onSubmit={submitSource}>
              <label className="field-label" htmlFor="url">
                <img src="/images/private-facebook.webp" alt="" width="24" height="24" />
                <span>ป้อน URL วิดีโอ Facebook</span>
              </label>
              <div className="input-row">
                <input
                  type="text"
                  className="private-input"
                  name="url"
                  id="url"
                  value={videoUrl}
                  onChange={(event) => updateVideoUrl(event.target.value)}
                  aria-label="URL วิดีโอ Facebook"
                  autoComplete="off"
                  placeholder="https://www.facebook.com/watch/?v=..."
                />
                {videoUrl ? (
                  <button id="clear" type="button" onClick={resetForm} aria-label="ล้างฟอร์ม">
                    <img src="/images/close.svg" alt="" width="16" height="16" />
                    <span>ล้าง</span>
                  </button>
                ) : (
                  <button id="paste" type="button" onClick={pasteVideoUrl} aria-label="วาง URL">
                    <img src="/images/copy.webp" alt="" width="16" height="16" />
                    <span>วาง</span>
                  </button>
                )}
              </div>

              <label className="field-label" htmlFor="source_url">
                <img src="/images/link.webp" alt="" width="20" height="20" />
                <span>เปิดในเบราว์เซอร์ที่เข้าสู่ระบบ Facebook แล้วคัดลอกซอร์สของหน้า</span>
              </label>
              <div className="input-row">
                <input
                  type="text"
                  className="private-input"
                  name="source_url"
                  id="source_url"
                  value={sourceUrl}
                  readOnly
                  aria-label="ลิงก์ดูซอร์ส"
                />
                {sourceUrl && (
                  <button id="copy" type="button" onClick={copySourceUrl} aria-label="คัดลอกลิงก์">
                    <img src="/images/clipboard.svg" alt="" width="16" height="18" />
                    <span>{copyDone ? "คัดลอกแล้ว" : "คัดลอก"}</span>
                  </button>
                )}
              </div>

              <label className="field-label" htmlFor="textarea">
                <img src="/images/code-circle.webp" alt="" width="24" height="24" />
                <span>วางซอร์สโค้ดเพื่อค้นหาวิดีโอ</span>
              </label>
              <div className="textarea-row">
                <textarea
                  className="private-input"
                  id="textarea"
                  value={sourceHtml}
                  onChange={(event) => {
                    setSourceHtml(event.target.value);
                    setError("");
                    setDownloadMessage("");
                  }}
                  aria-label="ซอร์สของหน้าวิดีโอ Facebook"
                  placeholder="วางซอร์สของหน้า Facebook ที่คัดลอกจากเบราว์เซอร์"
                  spellCheck={false}
                />
                {sourceHtml.length > 0 && (
                  <button type="submit" id="submit" className="main-submit">
                    <img src="/images/download-circle.webp" alt="" width="22" height="22" />
                    <span>ค้นหาวิดีโอ</span>
                  </button>
                )}
              </div>
            </form>

            <section className="batch-panel" aria-labelledby="batch-title">
              <div className="batch-heading">
                <h2 id="batch-title">คิวค้นหาและดาวน์โหลดอัตโนมัติ</h2>
                <p>วางลิงก์ต่อได้เรื่อย ๆ ระบบจะเปิดและประมวลผลทีละรายการตามลำดับ</p>
              </div>
              <form className="batch-form" onSubmit={addQueueItems}>
                <label className="sr-only" htmlFor="queue-urls">ลิงก์ Facebook หลายรายการ</label>
                <textarea
                  id="queue-urls"
                  className="private-input batch-input"
                  value={queueText}
                  onChange={(event) => setQueueText(event.target.value)}
                  placeholder="วางลิงก์ Facebook หนึ่งรายการต่อบรรทัด"
                  spellCheck={false}
                />
                <button type="submit" className="main-submit batch-submit" disabled={queueSubmitting}>
                  {queueSubmitting ? "กำลังเพิ่ม…" : "เพิ่มเข้าคิว"}
                </button>
              </form>
              <p className={extensionAvailable ? "extension-status is-ready" : "extension-status"}>
                {extensionAvailable
                  ? "ส่วนขยายเชื่อมต่อแล้ว • ลิงก์ใหม่จะเริ่มทำงานต่อจากรายการปัจจุบัน"
                  : "ต้องเปิดส่วนขยาย FGet ในเบราว์เซอร์นี้เพื่ออ่านหน้า Facebook และดาวน์โหลดอัตโนมัติ"}
              </p>
              {queueFeedback && <div className="batch-feedback" role="status">{queueFeedback}</div>}
              {queueItems.length > 0 && (
                <div className="batch-queue">
                  <div className="batch-queue-header">
                    <h3>รายการในคิว ({queueItems.length})</h3>
                    {queueItems.some((item) => item.status === "complete" || item.status === "failed") && (
                      <button type="button" className="queue-clear" onClick={clearCompletedQueue}>ล้างรายการเสร็จแล้ว</button>
                    )}
                  </div>
                  <ol>
                    {queueItems.map((item) => (
                      <li key={item.id} className={`queue-item status-${item.status}`}>
                        <span className="queue-item-label" title={item.url}>{item.title || item.url}</span>
                        <span className="queue-item-state">{item.detail || {
                          queued: "รอคิว",
                          opening: "เปิดหน้า",
                          searching: "ค้นหาวิดีโอ",
                          downloading: "กำลังดาวน์โหลด",
                          complete: "เสร็จแล้ว",
                          failed: "ไม่สำเร็จ",
                        }[item.status] || item.status}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </section>

            {error && <div id="error-container" className="error-container" role="alert">{error}</div>}

            {downloadMessage && (
              <div className="download-notice" role="status">{downloadMessage}</div>
            )}

            {results.length > 0 && (
              <div className="download-results" id="result-container" role="status">
                {videoTitle && <h2>{videoTitle}</h2>}
                <ul>
                  {results.map((result, index) => (
                    <li key={result.videoUrl}>
                      <span>{result.quality}</span>
                      <a
                        className="download-result"
                        href={result.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => {
                          if (result.audioUrl && result.audioUrl !== result.videoUrl) {
                            event.preventDefault();
                          }
                          openVideo(result);
                        }}
                      >
                        เปิด / ดาวน์โหลด
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="privacy-note">
              เปิดลิงก์วิดีโอในเบราว์เซอร์เดียวกัน • ไม่รับหรือเก็บรหัสผ่าน Facebook
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
