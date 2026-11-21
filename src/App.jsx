import { useEffect, useRef, useState } from "react";
import { AdSenseSlot } from "./components/AdSenseSlot.jsx";

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
        <a className="app-brand" href="#top" aria-label="Facebook Video Loader">
          <span>Facebook Video <strong>Loader</strong></span>
        </a>
        <nav className="header-nav" aria-label="เมนูหลัก">
          <a href="#how-it-works">วิธีใช้งาน</a>
          <a href="#faq">คำถามที่พบบ่อย</a>
          <a className="header-download-link" href={`${import.meta.env.BASE_URL}downloads/facebook-video-loader-extension.zip`} download>
            ดาวน์โหลดส่วนขยาย
          </a>
        </nav>
      </header>

      <main className="app-main" id="top">
        <section className="hero-layout" aria-labelledby="page-title">
          <div className="hero-copy">
            <span className="eyebrow">FACEBOOK VIDEO LOADER</span>
            <h1 id="page-title">โหลดวิดีโอ Facebook<br /><span>เป็นคิว จบทีละรายการ</span></h1>
            <p className="hero-description">ตัวช่วยจัดคิววิดีโอ Facebook ในเบราว์เซอร์ของคุณ วางลิงก์ได้ต่อเนื่อง แล้วให้ระบบเปิดโพสต์ ค้นหาวิดีโอ และดาวน์โหลดตามลำดับ</p>
            <div className="hero-points" aria-label="จุดเด่น">
              <span>ใช้โปรไฟล์ Facebook เดิม</span>
              <span>ประมวลผลครั้งละหนึ่งรายการ</span>
              <span>คิวอยู่ในเบราว์เซอร์</span>
            </div>
          </div>

          <section className="loader-card" id="loader" aria-labelledby="loader-title">
            <div className="loader-card-head">
              <div>
                <span className="card-overline">ตัวจัดการงาน</span>
                <h2 id="loader-title">คิวดาวน์โหลด</h2>
              </div>
              <div className={`connection-pill ${extensionAvailable ? "is-connected" : ""}`} role="status">
                <span className="connection-dot" />
                {extensionAvailable ? "เชื่อมต่อแล้ว" : "รอส่วนขยาย"}
              </div>
            </div>

            <div className={`login-note ${extensionAvailable ? "is-ready" : ""}`} role="status">
              {extensionAvailable
                ? "เชื่อมต่อส่วนขยายแล้ว ใช้ Facebook ในโปรไฟล์เบราว์เซอร์นี้"
                : "เปิดส่วนขยายใน Edge หรือ Chrome โปรไฟล์เดียวกับ Facebook แล้วรีเฟรชหน้านี้"}
            </div>

            <form className="queue-form" onSubmit={addQueueItems}>
              <label htmlFor="queue-urls">วางลิงก์วิดีโอ Facebook</label>
              <textarea
                id="queue-urls"
                className="queue-input"
                value={queueText}
                onChange={(event) => setQueueText(event.target.value)}
                placeholder={"วางหนึ่งลิงก์ต่อบรรทัด\nhttps://www.facebook.com/reel/..."}
                spellCheck={false}
                aria-describedby="queue-help"
              />
              <div className="form-footer">
                <span id="queue-help">เพิ่มลิงก์ชุดใหม่ได้ระหว่างที่คิวกำลังทำงาน</span>
                <button type="submit" className="primary-button" disabled={queueSubmitting}>
                  {queueSubmitting ? "กำลังเพิ่ม…" : "เพิ่มเข้าคิว"}
                </button>
              </div>
            </form>

            {queueFeedback && <div className="queue-feedback" role="status">{queueFeedback}</div>}

            <div className="queue-header">
              <div>
                <h3>รายการในคิว <span className="queue-count">{queueItems.length}</span></h3>
                <p>{activeCount} รอหรือกำลังทำ <span aria-hidden="true">·</span> {finishedCount} จบแล้ว</p>
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

            {queuePaused && activeCount > 0 && <div className="paused-banner">คิวจะพักหลังรายการที่กำลังประมวลผลหรือดาวน์โหลดเสร็จ</div>}
            {queueItems.length === 0 ? (
              <div className="empty-queue">ลิงก์ที่เพิ่มจะแสดงตรงนี้</div>
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

            <p className="privacy-note">ใช้กับวิดีโอที่คุณมีสิทธิ์ดูและบันทึก · ไม่ต้องกรอกรหัสผ่าน Facebook ในเว็บนี้</p>
          </section>
        </section>

        <section className="extension-section" id="install" aria-labelledby="extension-title">
          <div className="extension-intro">
            <span className="eyebrow">เริ่มต้นใช้งาน</span>
            <h2 id="extension-title">ดาวน์โหลดส่วนขยาย</h2>
            <p>ติดตั้งในโปรไฟล์ Edge หรือ Chrome ที่ล็อกอิน Facebook เพื่อเชื่อมคิวกับเบราว์เซอร์</p>
            <a className="extension-download-button" href={`${import.meta.env.BASE_URL}downloads/facebook-video-loader-extension.zip`} download>
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5v9m0 0 3.5-3.5M10 11.5 6.5 8M3.5 13.5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2" /></svg>
              ดาวน์โหลด Extension
            </a>
            <p className="extension-download-note">ไฟล์ ZIP สำหรับติดตั้งแบบ Load unpacked</p>
          </div>
          <ol className="extension-install-steps">
            <li>
              <span className="install-step-number">01</span>
              <div><strong>ดาวน์โหลดและแตกไฟล์</strong><p>แตก ZIP ไว้ในโฟลเดอร์ที่ต้องการเก็บส่วนขยาย</p></div>
            </li>
            <li>
              <span className="install-step-number">02</span>
              <div><strong>เปิดหน้าส่วนขยาย</strong><p>ใช้ <code>chrome://extensions</code> หรือ <code>edge://extensions</code></p></div>
            </li>
            <li>
              <span className="install-step-number">03</span>
              <div><strong>โหลดส่วนขยายเข้าเบราว์เซอร์</strong><p>เปิด Developer mode เลือก Load unpacked แล้วเลือกโฟลเดอร์ที่มี <code>manifest.json</code></p></div>
            </li>
          </ol>
        </section>

        <AdSenseSlot placement="TOOL" label="โฆษณา" />

        <section className="content-section" id="how-it-works" aria-labelledby="how-title">
          <div className="section-heading">
            <span className="eyebrow">วิธีทำงาน</span>
            <h2 id="how-title">จากลิงก์ไปถึงไฟล์ดาวน์โหลด</h2>
            <p>เว็บแอปส่งงานให้ส่วนขยายทำในเบราว์เซอร์ที่คุณใช้ Facebook อยู่</p>
          </div>
          <div className="steps-grid">
            <article className="info-card">
              <span className="step-number">01</span>
              <h3>วางลิงก์โพสต์</h3>
              <p>ใส่ URL วิดีโอ Facebook หนึ่งลิงก์ต่อหนึ่งบรรทัด แล้วเพิ่มเข้าคิวได้เรื่อย ๆ</p>
            </article>
            <article className="info-card">
              <span className="step-number">02</span>
              <h3>เปิดและค้นหาอัตโนมัติ</h3>
              <p>ส่วนขยายเปิดโพสต์ในแท็บเบื้องหลัง ใช้สิทธิ์เข้าถึงจากโปรไฟล์ที่ล็อกอินอยู่</p>
            </article>
            <article className="info-card">
              <span className="step-number">03</span>
              <h3>ดาวน์โหลดตามลำดับ</h3>
              <p>ระบบรอให้รายการปัจจุบันจบก่อนเริ่มรายการถัดไป และให้พักคิวหรือลองรายการที่พลาดใหม่ได้</p>
            </article>
          </div>
        </section>

        <section className="about-section" aria-labelledby="about-title">
          <div className="about-copy">
            <span className="eyebrow">ออกแบบมาสำหรับงานเป็นชุด</span>
            <h2 id="about-title">Facebook Video Loader คืออะไร</h2>
          </div>
          <div className="about-body">
            <p>Facebook Video Loader เป็นเว็บแอปช่วยจัดการลิงก์วิดีโอหลายรายการโดยไม่ต้องเปิดและดาวน์โหลดเองทีละโพสต์ คุณวางลิงก์ต่อเนื่องได้ ส่วนขยายจะค้นหาวิดีโอผ่านหน้า Facebook ที่โหลดในเบราว์เซอร์ของคุณ แล้วส่งไฟล์ให้ตัวจัดการดาวน์โหลดของเบราว์เซอร์</p>
            <p>แนะนำให้ล็อกอิน Facebook ใน Edge หรือ Chrome โปรไฟล์เดียวกับที่ติดตั้งส่วนขยายไว้ คิวเก็บใน session ของเบราว์เซอร์ ไม่ส่งรหัสผ่าน คุกกี้ หรือซอร์สหน้าโพสต์ไปยังเซิร์ฟเวอร์ของเว็บแอป</p>
          </div>
        </section>

        <section className="faq-section" id="faq" aria-labelledby="faq-title">
          <div className="section-heading">
            <span className="eyebrow">คำตอบก่อนเริ่ม</span>
            <h2 id="faq-title">คำถามที่พบบ่อย</h2>
            <p>รายละเอียดการใช้งานและข้อจำกัดของตัวดาวน์โหลด</p>
          </div>
          <div className="faq-list">
            <details className="faq-item">
              <summary>ต้องล็อกอิน Facebook ก่อนใช้งานไหม?</summary>
              <p>ต้องล็อกอินในเบราว์เซอร์โปรไฟล์เดียวกับที่เปิด Facebook Video Loader และติดตั้งส่วนขยายไว้ เว็บแอปไม่มีช่องกรอกรหัสผ่าน Facebook</p>
            </details>
            <details className="faq-item">
              <summary>วางหลายลิงก์แล้วระบบทำพร้อมกันหรือไม่?</summary>
              <p>ระบบทำทีละรายการ เปิดโพสต์หนึ่งรายการ ค้นหาวิดีโอ แล้วรอให้ดาวน์โหลดเสร็จก่อนเริ่มโพสต์ถัดไป คุณเพิ่มลิงก์ใหม่เข้าคิวระหว่างทำงานได้</p>
            </details>
            <details className="faq-item">
              <summary>ดาวน์โหลดวิดีโอในกลุ่มส่วนตัวได้หรือไม่?</summary>
              <p>ระบบค้นหาได้เมื่อบัญชีที่ล็อกอินอยู่มีสิทธิ์เปิดโพสต์นั้น แต่รูปแบบโพสต์และสิทธิ์ของ Facebook อาจทำให้บางวิดีโอไม่สามารถค้นหาหรือดาวน์โหลดได้ ใช้กับวิดีโอที่คุณมีสิทธิ์บันทึกเท่านั้น</p>
            </details>
            <details className="faq-item">
              <summary>ถ้าขึ้น Facebook CDN 403 ต้องทำอย่างไร?</summary>
              <p>ลิงก์วิดีโออาจหมดอายุ ระบบจะเปิดโพสต์อีกครั้งเพื่อหาลิงก์ใหม่หนึ่งครั้ง หากยังถูกปฏิเสธ ให้ตรวจว่าโพสต์ยังเปิดได้ในโปรไฟล์นี้ แล้วกดลองใหม่จากรายการที่ล้มเหลว</p>
            </details>
            <details className="faq-item">
              <summary>ไฟล์ที่ดาวน์โหลดอยู่ที่ไหน และเก็บข้อมูลอะไรไว้บ้าง?</summary>
              <p>ไฟล์ใช้โฟลเดอร์ดาวน์โหลดของเบราว์เซอร์ ส่วนคิวและสถานะอยู่ใน session ของส่วนขยายและถูกล้างเมื่อปิดเบราว์เซอร์ เว็บแอปไม่ขอสิทธิ์ cookies และไม่เก็บรหัสผ่าน Facebook</p>
            </details>
            <details className="faq-item">
              <summary>ทำไมบางวิดีโอถึงดาวน์โหลดไม่ได้?</summary>
              <p>โพสต์อาจต้องใช้สิทธิ์เพิ่มเติม ลิงก์ CDN อาจถูกยกเลิก หรือวิดีโออาจแยกสตรีมภาพกับเสียง ซึ่งตัวดาวน์โหลดรุ่นนี้ยังไม่รวมเป็นไฟล์เดียว</p>
            </details>
          </div>
        </section>

        <AdSenseSlot placement="CONTENT" label="โฆษณา" />

        <section className="recommendation-section" aria-labelledby="recommendation-title">
          <div>
            <span className="eyebrow">คำแนะนำ</span>
            <h2 id="recommendation-title">เตรียมเบราว์เซอร์ก่อนเริ่ม</h2>
          </div>
          <p>ใช้ Microsoft Edge หรือ Google Chrome เวอร์ชันล่าสุด ติดตั้งส่วนขยายนี้ในโปรไฟล์ที่ล็อกอิน Facebook และตรวจโฟลเดอร์ดาวน์โหลดของเบราว์เซอร์ก่อนส่งลิงก์จำนวนมาก</p>
        </section>
      </main>

      <footer className="app-footer">
        <a className="app-brand" href="#top">Facebook Video <strong>Loader</strong></a>
        <p>ใช้กับวิดีโอที่คุณมีสิทธิ์ดูและบันทึก</p>
      </footer>
    </div>
  );
}
