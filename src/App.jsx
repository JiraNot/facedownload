import { useEffect, useRef, useState } from "react";

function isFacebookPageUrl(value) {
  try {
    const url = new URL(value.replace(/^view-source:/i, "").trim());
    const host = url.hostname.toLowerCase();
    const facebookHost = host === "facebook.com" || host.endsWith(".facebook.com") ||
      host === "fb.watch" || host.endsWith(".fb.watch") ||
      host === "fb.gg" || host.endsWith(".fb.gg");
    return facebookHost && ["https:", "http:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function postToExtension(type, extra = {}) {
  window.postMessage({
    source: "facebook-video-loader-web",
    type,
    requestId: crypto.randomUUID(),
    ...extra,
  }, window.location.origin);
}

const STATUS_LABELS = {
  queued: "รอคิว",
  opening: "กำลังเปิด Facebook",
  searching: "กำลังค้นหาวิดีโอ",
  downloading: "กำลังดาวน์โหลด",
  complete: "เสร็จแล้ว",
  failed: "ไม่สำเร็จ",
};

export function App() {
  const [queueText, setQueueText] = useState("");
  const [queueItems, setQueueItems] = useState([]);
  const [queuePaused, setQueuePaused] = useState(false);
  const [extensionAvailable, setExtensionAvailable] = useState(false);
  const [queueFeedback, setQueueFeedback] = useState("");
  const [queueSubmitting, setQueueSubmitting] = useState(false);
  const requestRef = useRef("");

  useEffect(() => {
    function receive(event) {
      if (event.source !== window || event.origin !== window.location.origin) return;
      const message = event.data;
      if (message?.source !== "facebook-video-loader-extension") return;

      setExtensionAvailable(Boolean(message.available));
      if (message.type === "PING_RESULT") return;

      if (Array.isArray(message.queue)) setQueueItems(message.queue);
      if (typeof message.paused === "boolean") setQueuePaused(message.paused);

      if (message.type === "QUEUE_ADD_RESULT" && message.requestId === requestRef.current) {
        requestRef.current = "";
        setQueueSubmitting(false);
        if (!message.error) setQueueText("");
        const notes = [
          message.error,
          !message.error ? `เพิ่ม ${message.addedCount} รายการเข้าคิวแล้ว` : "",
          message.duplicateCount ? `ข้ามลิงก์ซ้ำ ${message.duplicateCount} รายการ` : "",
          message.invalidCount ? `ข้ามลิงก์ที่ไม่ใช่ Facebook ${message.invalidCount} รายการ` : "",
        ].filter(Boolean);
        setQueueFeedback(notes.join(" • "));
        return;
      }

      if (message.type.endsWith("_RESULT") && message.type !== "QUEUE_GET_RESULT") {
        setQueueFeedback(message.error || message.notice || "อัปเดตคิวแล้ว");
      }
    }

    window.addEventListener("message", receive);
    postToExtension("PING");
    postToExtension("QUEUE_GET");
    const pingTimer = window.setInterval(() => postToExtension("PING"), 5000);
    const queueTimer = window.setInterval(() => postToExtension("QUEUE_GET"), 2000);
    return () => {
      window.removeEventListener("message", receive);
      window.clearInterval(pingTimer);
      window.clearInterval(queueTimer);
    };
  }, []);

  function addQueueItems(event) {
    event.preventDefault();
    const urls = [...new Set(queueText.split(/[\s,;]+/).map((value) => value.trim()).filter(Boolean))];
    if (!urls.length) {
      setQueueFeedback("วางลิงก์ Facebook อย่างน้อยหนึ่งรายการก่อนเพิ่มเข้าคิว");
      return;
    }

    const invalidCount = urls.filter((url) => !isFacebookPageUrl(url)).length;
    const validUrls = urls.filter(isFacebookPageUrl);
    if (!validUrls.length) {
      setQueueFeedback("ไม่พบลิงก์ Facebook ที่ถูกต้องในรายการ");
      return;
    }
    if (!extensionAvailable) {
      setQueueFeedback("เปิดส่วนขยายในเบราว์เซอร์เดียวกับ Facebook ก่อน แล้วรีเฟรชหน้านี้");
      return;
    }

    const requestId = crypto.randomUUID();
    requestRef.current = requestId;
    setQueueSubmitting(true);
    setQueueFeedback("กำลังเพิ่มรายการเข้าคิว…");
    postToExtension("QUEUE_ADD", { requestId, urls: validUrls, invalidCount });
    window.setTimeout(() => {
      if (requestRef.current === requestId) {
        requestRef.current = "";
        setQueueSubmitting(false);
        setQueueFeedback("ส่วนขยายไม่ตอบกลับ ลองรีเฟรชเว็บแอปหลังเปิดส่วนขยาย");
      }
    }, 10000);
  }

  const activeCount = queueItems.filter((item) => ["queued", "opening", "searching", "downloading"].includes(item.status)).length;
  const finishedCount = queueItems.filter((item) => ["complete", "failed"].includes(item.status)).length;

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="app-brand" href="#main" aria-label="Facebook Video Loader">
          <span className="brand-mark" aria-hidden="true">f</span>
          <span>Facebook Video Loader</span>
        </a>
        <div className={`connection-pill ${extensionAvailable ? "is-connected" : ""}`}>
          <span className="connection-dot" />
          {extensionAvailable ? "เชื่อมต่อแล้ว" : "รอส่วนขยาย"}
        </div>
      </header>

      <main className="app-main" id="main">
        <section className="loader-card" aria-labelledby="page-title">
          <div className="loader-heading">
            <span className="eyebrow">FACEBOOK VIDEO LOADER</span>
            <h1 id="page-title">ดาวน์โหลดวิดีโอ Facebook</h1>
            <p>วางลิงก์ได้ต่อเนื่อง ระบบจะเปิดค้นหาและดาวน์โหลดทีละรายการในเบราว์เซอร์ที่คุณเข้าสู่ระบบไว้</p>
          </div>

          <div className={`login-note ${extensionAvailable ? "is-ready" : ""}`} role="status">
            <span className="note-icon" aria-hidden="true">{extensionAvailable ? "✓" : "i"}</span>
            <span>{extensionAvailable
              ? "ใช้โปรไฟล์เบราว์เซอร์นี้กับ Facebook ที่เข้าสู่ระบบแล้ว"
              : "เปิดส่วนขยายในเบราว์เซอร์เดียวกับ Facebook แล้วรีเฟรชหน้านี้เพื่อเริ่มใช้งาน"}</span>
          </div>

          <form className="queue-form" onSubmit={addQueueItems}>
            <label htmlFor="queue-urls">ลิงก์วิดีโอ Facebook</label>
            <textarea
              id="queue-urls"
              className="queue-input"
              value={queueText}
              onChange={(event) => setQueueText(event.target.value)}
              placeholder={"วางลิงก์หนึ่งรายการต่อบรรทัด\nhttps://www.facebook.com/reel/..."}
              spellCheck={false}
            />
            <div className="form-footer">
              <span>วางลิงก์ใหม่ได้ทุกเมื่อ • ทำงานทีละรายการ</span>
              <button type="submit" className="primary-button" disabled={queueSubmitting}>
                {queueSubmitting ? "กำลังเพิ่ม…" : "เพิ่มเข้าคิว"}
              </button>
            </div>
          </form>

          {queueFeedback && <div className="queue-feedback" role="status">{queueFeedback}</div>}

          <section className="queue-section" aria-labelledby="queue-title">
            <div className="queue-header">
              <div>
                <h2 id="queue-title">คิวดาวน์โหลด</h2>
                <p>{activeCount} กำลังทำหรือรอคิว <span aria-hidden="true">·</span> {finishedCount} เสร็จ/ล้มเหลว</p>
              </div>
              {queueItems.length > 0 && (
                <div className="queue-controls">
                  {activeCount > 0 && (
                    <button type="button" className="quiet-button" onClick={() => postToExtension(queuePaused ? "QUEUE_RESUME" : "QUEUE_PAUSE")}>
                      {queuePaused ? "ทำงานต่อ" : "พักคิว"}
                    </button>
                  )}
                  {finishedCount > 0 && (
                    <button type="button" className="quiet-button" onClick={() => postToExtension("QUEUE_CLEAR_COMPLETED")}>
                      ล้างรายการจบแล้ว
                    </button>
                  )}
                </div>
              )}
            </div>

            {queuePaused && activeCount > 0 && <div className="paused-banner">พักคิวหลังรายการที่กำลังประมวลผลหรือดาวน์โหลดเสร็จ</div>}
            {queueItems.length === 0 ? (
              <div className="empty-queue">รายการที่เพิ่มจะปรากฏที่นี่</div>
            ) : (
              <ol className="queue-list">
                {queueItems.map((item, index) => {
                  const canRetry = item.status === "failed";
                  const canRemove = ["queued", "complete", "failed"].includes(item.status);
                  return (
                    <li key={item.id} className={`queue-item status-${item.status}`}>
                      <span className="queue-number">{String(index + 1).padStart(2, "0")}</span>
                      <div className="queue-item-main">
                        <span className="queue-item-label" title={item.url}>{item.title || item.url}</span>
                        <span className="queue-item-state"><i />{item.detail || STATUS_LABELS[item.status] || item.status}</span>
                      </div>
                      <div className="queue-item-actions">
                        {canRetry && <button type="button" className="item-action" onClick={() => postToExtension("QUEUE_RETRY", { id: item.id })}>ลองใหม่</button>}
                        {canRemove && <button type="button" className="item-action remove-action" onClick={() => postToExtension("QUEUE_REMOVE", { id: item.id })} aria-label="นำรายการออก">ลบ</button>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <p className="privacy-note">ใช้กับวิดีโอที่คุณมีสิทธิ์ดูและบันทึก คิวอยู่ในเบราว์เซอร์นี้เท่านั้น</p>
        </section>
      </main>
    </div>
  );
}
