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

function parseQueueText(text) {
  return text.split(/\r?\n/).flatMap((line) => {
    const trimmed = line.trim();
    if (!trimmed) return [];

    const separators = [trimmed.indexOf("|"), trimmed.indexOf("\t")].filter((index) => index >= 0);
    if (separators.length) {
      const separatorIndex = Math.min(...separators);
      const urls = trimmed.slice(0, separatorIndex).trim().split(/[\s,;]+/).filter(Boolean);
      const customFilename = trimmed.slice(separatorIndex + 1).trim();
      return urls.map((url) => ({ url, customFilename }));
    }

    return trimmed.split(/[\s,;]+/).filter(Boolean).map((url) => ({ url }));
  });
}

function compareVersions(first, second) {
  const a = String(first).split(".").map(Number);
  const b = String(second).split(".").map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const difference = (a[index] || 0) - (b[index] || 0);
    if (difference !== 0) return Math.sign(difference);
  }
  return 0;
}

function postToExtension(type, extra = {}) {
  window.postMessage({
    source: "facebook-video-loader-web",
    type,
    requestId: crypto.randomUUID(),
    ...extra,
  }, window.location.origin);
}

const GUIDE_ICON_CONTENT = {
  download: <><path d="M12 3v11m0 0 4-4m-4 4-4-4" /><path d="M4 17v3h16v-3" /></>,
  browser: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M3.5 9h17M7 6.8h.01M10 6.8h.01" /></>,
  folder: <><path d="M3 7.5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M3.5 10h17" /></>,
  access: <><path d="m12 3 7 3v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6z" /><path d="m9 11 2 2 4-4" /></>,
  refresh: <><path d="M20 7v5h-5" /><path d="M19 12a7 7 0 0 0-12-4L5 10m-1 7v-5h5" /><path d="M5 12a7 7 0 0 0 12 4l2-2" /></>,
  warning: <><path d="M10.3 4.6 2.9 17.4A1.8 1.8 0 0 0 4.5 20h15a1.8 1.8 0 0 0 1.6-2.6L13.7 4.6a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4m0 3h.01" /></>,
};

function GuideIcon({ name }) {
  return <svg className="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{GUIDE_ICON_CONTENT[name]}</svg>;
}

export function App({ initialLanguage = "th" }) {
  const [language, setLanguage] = useState(initialLanguage);
  const [queueText, setQueueText] = useState("");
  const [queueItems, setQueueItems] = useState([]);
  const [queuePaused, setQueuePaused] = useState(false);
  const [extensionAvailable, setExtensionAvailable] = useState(false);
  const [extensionVersion, setExtensionVersion] = useState("");
  const [queueFeedback, setQueueFeedback] = useState("");
  const [queueSubmitting, setQueueSubmitting] = useState(false);
  const [qualityPreference, setQualityPreference] = useState("auto");
  const [filenamePattern, setFilenamePattern] = useState("title");
  const requestRef = useRef("");
  const importInputRef = useRef(null);
  const clearQueueTextAfterAddRef = useRef(false);
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

  const extensionNeedsUpdate = extensionAvailable && (!extensionVersion || compareVersions(extensionVersion, "1.5.0") < 0);

  useEffect(() => {
    function receive(event) {
      if (event.source !== window || event.origin !== window.location.origin) return;
      const message = event.data;
      if (message?.source !== "facebook-video-loader-extension") return;

      setExtensionAvailable(Boolean(message.available));
      if (typeof message.version === "string") setExtensionVersion(message.version);
      if (message.type === "PING_RESULT") return;

      if (Array.isArray(message.queue)) setQueueItems(message.queue);
      if (typeof message.paused === "boolean") setQueuePaused(message.paused);

      if (message.type === "QUEUE_ADD_RESULT" && message.requestId === requestRef.current) {
        requestRef.current = "";
        setQueueSubmitting(false);
        if (!message.error && clearQueueTextAfterAddRef.current) setQueueText("");
        clearQueueTextAfterAddRef.current = false;
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

  function enqueueUrls(values, { clearInput = false } = {}) {
    const candidates = values.map((value) => typeof value === "string"
      ? { url: value.trim(), qualityPreference, filenamePattern }
      : {
        url: String(value?.url || "").trim(),
        customFilename: String(value?.customFilename || "").trim(),
        qualityPreference: value?.qualityPreference,
        filenamePattern: value?.filenamePattern,
      }).filter((value) => value.url);
    const uniqueItems = [...new Map(candidates.map((item) => [item.url, item])).values()];
    if (!uniqueItems.length) {
      setQueueFeedback(copy.queue.emptyInput);
      return;
    }

    const invalidCount = uniqueItems.filter((item) => !isFacebookPageUrl(item.url)).length;
    const validItems = uniqueItems.filter((item) => isFacebookPageUrl(item.url));
    if (!validItems.length) {
      setQueueFeedback(copy.queue.invalidInput);
      return;
    }
    if (!extensionAvailable) {
      setQueueFeedback("เปิดส่วนขยายในเบราว์เซอร์เดียวกับ Facebook ก่อน แล้วรีเฟรชหน้านี้");
      return;
    }

    const requestId = crypto.randomUUID();
    requestRef.current = requestId;
    clearQueueTextAfterAddRef.current = clearInput;
    setQueueSubmitting(true);
    setQueueFeedback("กำลังเพิ่มรายการเข้าคิว…");
    postToExtension("QUEUE_ADD", {
      requestId,
      urls: validItems,
      invalidCount,
      qualityPreference,
      filenamePattern,
    });
    window.setTimeout(() => {
      if (requestRef.current === requestId) {
        requestRef.current = "";
        clearQueueTextAfterAddRef.current = false;
        setQueueSubmitting(false);
        setQueueFeedback("ส่วนขยายไม่ตอบกลับ ลองรีเฟรชเว็บแอปหลังเปิดส่วนขยาย");
      }
    }, 10000);
  }

  function addQueueItems(event) {
    event.preventDefault();
    enqueueUrls(parseQueueText(queueText), { clearInput: true });
  }

  async function importQueueFile(event) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    try {
      if (file.size > 256 * 1024) throw new Error("file too large");
      const text = await file.text();
      let entries;
      if (file.name.toLowerCase().endsWith(".txt")) {
        entries = parseQueueText(text);
      } else {
        const exported = JSON.parse(text);
        if (Array.isArray(exported)) entries = exported;
        else if (exported?.format === "facebook-video-loader-queue" && Array.isArray(exported.links)) entries = exported.links;
        else throw new Error("unsupported format");
      }
      if (!entries.some((entry) => typeof entry === "string" ? entry.trim() : typeof entry?.url === "string" && entry.url.trim())) {
        throw new Error("no links");
      }
      enqueueUrls(entries);
    } catch {
      setQueueFeedback(copy.queue.importInvalid);
    }
  }

  function exportQueue() {
    const links = queueItems
      .filter((item) => item.status !== "complete")
      .map((item) => item.url)
      .filter(Boolean);
    if (!links.length) {
      setQueueFeedback(copy.queue.exportEmpty);
      return;
    }

    const payload = {
      format: "facebook-video-loader-queue",
      version: 1,
      exportedAt: new Date().toISOString(),
      links: queueItems
        .filter((item) => item.status !== "complete" && item.url)
        .map((item) => ({
          url: item.url,
          ...(item.customFilename ? { customFilename: item.customFilename } : {}),
          qualityPreference: item.qualityPreference || "auto",
          filenamePattern: item.filenamePattern || "title",
        })),
    };
    const file = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `facebook-video-loader-queue-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    setQueueFeedback(`ส่งออกลิงก์คิว ${links.length} รายการแล้ว`);
  }

  const activeCount = queueItems.filter((item) => ["queued", "opening", "searching", "merging", "downloading"].includes(item.status)).length;
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

            <div className={`login-note ${extensionAvailable ? extensionNeedsUpdate ? "is-outdated" : "is-ready" : ""}`} role="status">
              {!extensionAvailable
                ? copy.queue.missingNote
                : extensionNeedsUpdate
                  ? <>{copy.queue.updateNote} <a href={extensionDownloadUrl} download>{copy.queue.updateLink}</a></>
                  : copy.queue.readyNote}
            </div>

            <div className="download-settings" aria-label={copy.queue.settingsTitle}>
              <div className="download-settings-heading">{copy.queue.settingsTitle}</div>
              <div className="download-settings-fields">
                <label htmlFor="quality-preference">
                  <span>{copy.queue.qualityLabel}</span>
                  <select id="quality-preference" value={qualityPreference} onChange={(event) => setQualityPreference(event.target.value)}>
                    {copy.queue.qualityOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label htmlFor="filename-pattern">
                  <span>{copy.queue.filenameLabel}</span>
                  <select id="filename-pattern" value={filenamePattern} onChange={(event) => setFilenamePattern(event.target.value)}>
                    {copy.queue.filenameOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
              </div>
              <p>{copy.queue.settingsNote}</p>
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
              <div className="queue-controls">
                <button type="button" className="quiet-button" onClick={() => importInputRef.current?.click()} disabled={!extensionAvailable || queueSubmitting}>
                  {copy.queue.import}
                </button>
                {queueItems.length > 0 && (
                  <button type="button" className="quiet-button" onClick={exportQueue}>
                    {copy.queue.export}
                  </button>
                )}
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
            </div>
            <input ref={importInputRef} className="visually-hidden" type="file" accept=".json,.txt,application/json,text/plain" onChange={importQueueFile} />
            <p className="queue-export-note">{copy.queue.exportNote}</p>

            {queuePaused && activeCount > 0 && <div className="paused-banner">{copy.queue.paused}</div>}
            {queueItems.length === 0 ? (
              <div className="empty-queue">{copy.queue.empty}</div>
            ) : (
              <ol className="queue-list">
                {queueItems.map((item, index) => {
                  const canRetry = item.status === "failed";
                  const canRemove = ["queued", "complete", "failed"].includes(item.status);
                  const queueLabel = item.customFilename
                    ? `${item.customFilename.replace(/\.mp4$/i, "")}.mp4`
                    : item.title || item.url;
                  return (
                    <li key={item.id} className={`queue-item status-${item.status}`}>
                      <span className="queue-number">{String(index + 1).padStart(2, "0")}</span>
                      <div className="queue-item-main">
                        <span className="queue-item-label" title={item.customFilename ? `${queueLabel} · ${item.title || item.url}` : item.url}>{queueLabel}</span>
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
                <GuideIcon name={["download", "browser", "folder"][index]} />
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

        <section className="troubleshooting-section" aria-labelledby="troubleshooting-title">
          <div className="section-heading">
            <span className="eyebrow">{copy.troubleshooting.eyebrow}</span>
            <h2 id="troubleshooting-title">{copy.troubleshooting.title}</h2>
            <p>{copy.troubleshooting.description}</p>
          </div>
          <div className="troubleshooting-grid">
            {copy.troubleshooting.steps.map(([title, description], index) => (
              <article className="troubleshooting-card" key={title}>
                <div className="troubleshooting-card-top">
                  <GuideIcon name={["access", "refresh", "warning"][index]} />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
          <p className="troubleshooting-note">{copy.troubleshooting.note}</p>
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
