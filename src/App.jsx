import { useEffect, useRef, useState } from "react";
import { AdSenseSlot } from "./components/AdSenseSlot.jsx";
import { COPY, localizeFeedback, localizeQueueDetail } from "./i18n.js";

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

export function App({ initialLanguage = "th" }) {
  const [language, setLanguage] = useState(initialLanguage);
  const [queueText, setQueueText] = useState("");
  const [queueItems, setQueueItems] = useState([]);
  const [queuePaused, setQueuePaused] = useState(false);
  const [extensionAvailable, setExtensionAvailable] = useState(false);
  const [queueFeedback, setQueueFeedback] = useState("");
  const [queueSubmitting, setQueueSubmitting] = useState(false);
  const requestRef = useRef("");
  const copy = COPY[language];

  useEffect(() => {
    try {
      const savedLanguage = window.localStorage.getItem("facebook-video-loader-language");
      const englishPath = window.location.pathname.replace(/\/+$/, "").endsWith("/en");
      const preferredLanguage = englishPath ? "en" : savedLanguage;
      if (preferredLanguage === "en") {
        setLanguage("en");
        if (!englishPath) {
          const targetPath = `${import.meta.env.BASE_URL}en/`;
          window.history.replaceState(window.history.state, "", `${targetPath}${window.location.hash}`);
        }
      }
    } catch {
      // Keep Thai as the default if browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy.pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", copy.pageDescription);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", copy.ogTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", copy.ogDescription);
    document.querySelector('meta[property="og:locale"]')?.setAttribute("content", language === "th" ? "th_TH" : "en_US");
  }, [language, copy]);

  function chooseLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    try {
      window.localStorage.setItem("facebook-video-loader-language", nextLanguage);
      const targetPath = nextLanguage === "en" ? `${import.meta.env.BASE_URL}en/` : import.meta.env.BASE_URL;
      window.history.replaceState(window.history.state, "", `${targetPath}${window.location.hash}`);
    } catch {
      // Language still changes for this visit when history or storage is restricted.
    }
  }

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
        const notes = [message.error];
        if (!message.error && message.addedCount) notes.push(`เพิ่ม ${message.addedCount} รายการเข้าคิวแล้ว`);
        if (message.duplicateCount) notes.push(`ข้ามลิงก์ซ้ำ ${message.duplicateCount} รายการ`);
        if (message.invalidCount) notes.push(`ข้ามลิงก์ที่ไม่ใช่ Facebook ${message.invalidCount} รายการ`);
        setQueueFeedback(notes.filter(Boolean).join(" • "));
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
  const extensionDownloadUrl = `${import.meta.env.BASE_URL}downloads/facebook-video-loader-extension.zip`;

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="app-brand" href="#top" aria-label="Facebook Video Loader">
          <span>Facebook Video <strong>Loader</strong></span>
        </a>
        <nav className="header-nav" aria-label={copy.mainMenu}>
          <a href="#how-it-works">{copy.navHow}</a>
          <a href="#faq">{copy.navFaq}</a>
          <a className="header-download-link" href={extensionDownloadUrl} download>
            {copy.navDownload}
          </a>
          <div className="language-switcher" role="group" aria-label={copy.languageLabel}>
            <button type="button" className={language === "th" ? "is-active" : ""} onClick={() => chooseLanguage("th")} aria-label={copy.languageThai} title={copy.languageThai} aria-pressed={language === "th"}>TH</button>
            <button type="button" className={language === "en" ? "is-active" : ""} onClick={() => chooseLanguage("en")} aria-label={copy.languageEnglish} title={copy.languageEnglish} aria-pressed={language === "en"}>EN</button>
          </div>
        </nav>
      </header>

      <main className="app-main" id="top">
        <section className="hero-layout" aria-labelledby="page-title">
          <div className="hero-copy">
            <span className="eyebrow">{copy.hero.eyebrow}</span>
            <h1 id="page-title">{copy.hero.title}<br /><span>{copy.hero.accent}</span></h1>
            <p className="hero-description">{copy.hero.description}</p>
            <div className="hero-points" aria-label={copy.hero.pointsLabel}>
              {copy.hero.points.map((point) => <span key={point}>{point}</span>)}
            </div>
          </div>

          <section className="loader-card" id="loader" aria-labelledby="loader-title">
            <div className="loader-card-head">
              <div>
                <span className="card-overline">{copy.queue.overline}</span>
                <h2 id="loader-title">{copy.queue.title}</h2>
              </div>
              <div className={`connection-pill ${extensionAvailable ? "is-connected" : ""}`} role="status">
                <span className="connection-dot" />
                {extensionAvailable ? copy.queue.connected : copy.queue.waiting}
              </div>
            </div>

            <div className={`login-note ${extensionAvailable ? "is-ready" : ""}`} role="status">
              {extensionAvailable
                ? copy.queue.readyNote
                : copy.queue.missingNote}
            </div>

            <form className="queue-form" onSubmit={addQueueItems}>
              <label htmlFor="queue-urls">{copy.queue.inputLabel}</label>
              <textarea
                id="queue-urls"
                className="queue-input"
                value={queueText}
                onChange={(event) => setQueueText(event.target.value)}
                placeholder={copy.queue.placeholder}
                spellCheck={false}
                aria-describedby="queue-help"
              />
              <div className="form-footer">
                <span id="queue-help">{copy.queue.inputHelp}</span>
                <button type="submit" className="primary-button" disabled={queueSubmitting}>
                  {queueSubmitting ? copy.queue.adding : copy.queue.add}
                </button>
              </div>
            </form>

            {queueFeedback && <div className="queue-feedback" role="status">{localizeFeedback(queueFeedback, language)}</div>}

            <div className="queue-header">
              <div>
                <h3>{copy.queue.items} <span className="queue-count">{queueItems.length}</span></h3>
                <p>{copy.queue.summary(activeCount, finishedCount)}</p>
              </div>
              {queueItems.length > 0 && (
                <div className="queue-controls">
                  {activeCount > 0 && (
                    <button type="button" className="quiet-button" onClick={() => postToExtension(queuePaused ? "QUEUE_RESUME" : "QUEUE_PAUSE")}>
                      {queuePaused ? copy.queue.resume : copy.queue.pause}
                    </button>
                  )}
                  {finishedCount > 0 && (
                    <button type="button" className="quiet-button" onClick={() => postToExtension("QUEUE_CLEAR_COMPLETED")}>
                      {copy.queue.clear}
                    </button>
                  )}
                </div>
              )}
            </div>

            {queuePaused && activeCount > 0 && <div className="paused-banner">{copy.queue.paused}</div>}
            {queueItems.length === 0 ? (
              <div className="empty-queue">{copy.queue.empty}</div>
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
                        <span className="queue-item-state"><i />{localizeQueueDetail(item.detail, item.status, language)}</span>
                      </div>
                      <div className="queue-item-actions">
                        {canRetry && <button type="button" className="item-action" onClick={() => postToExtension("QUEUE_RETRY", { id: item.id })}>{copy.queue.retry}</button>}
                        {canRemove && <button type="button" className="item-action remove-action" onClick={() => postToExtension("QUEUE_REMOVE", { id: item.id })} aria-label={copy.queue.removeLabel}>{copy.queue.remove}</button>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <p className="privacy-note">{copy.queue.privacy}</p>
          </section>
        </section>

        <section className="extension-section" id="install" aria-labelledby="extension-title">
          <div className="extension-intro">
            <span className="eyebrow">{copy.install.eyebrow}</span>
            <h2 id="extension-title">{copy.install.title}</h2>
            <p>{copy.install.description}</p>
            <a className="extension-download-button" href={extensionDownloadUrl} download>
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5v9m0 0 3.5-3.5M10 11.5 6.5 8M3.5 13.5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2" /></svg>
              {copy.install.download}
            </a>
            <p className="extension-download-note">{copy.install.fileNote}</p>
          </div>
          <ol className="extension-install-steps">
            {copy.install.steps.map(([title, description], index) => (
              <li key={title}>
                <span className="install-step-number">{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{title}</strong><p>{description}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <AdSenseSlot placement="TOOL" label={copy.adLabel} />

        <section className="content-section" id="how-it-works" aria-labelledby="how-title">
          <div className="section-heading">
            <span className="eyebrow">{copy.how.eyebrow}</span>
            <h2 id="how-title">{copy.how.title}</h2>
            <p>{copy.how.description}</p>
          </div>
          <div className="steps-grid">
            {copy.how.steps.map(([title, description], index) => (
              <article className="info-card" key={title}>
                <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" aria-labelledby="about-title">
          <div className="about-copy">
            <span className="eyebrow">{copy.about.eyebrow}</span>
            <h2 id="about-title">{copy.about.title}</h2>
          </div>
          <div className="about-body">
            {copy.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>

        <section className="faq-section" id="faq" aria-labelledby="faq-title">
          <div className="section-heading">
            <span className="eyebrow">{copy.faq.eyebrow}</span>
            <h2 id="faq-title">{copy.faq.title}</h2>
            <p>{copy.faq.description}</p>
          </div>
          <div className="faq-list">
            {copy.faq.items.map(([question, answer]) => (
              <details className="faq-item" key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <AdSenseSlot placement="CONTENT" label={copy.adLabel} />

        <section className="recommendation-section" aria-labelledby="recommendation-title">
          <div>
            <span className="eyebrow">{copy.recommendation.eyebrow}</span>
            <h2 id="recommendation-title">{copy.recommendation.title}</h2>
          </div>
          <p>{copy.recommendation.text}</p>
        </section>
      </main>

      <footer className="app-footer">
        <a className="app-brand" href="#top">Facebook Video <strong>Loader</strong></a>
        <p>{copy.footer}</p>
      </footer>
    </div>
  );
}
