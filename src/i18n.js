const STATUS = {
  th: {
    queued: "รอคิว",
    opening: "กำลังเปิด Facebook",
    searching: "กำลังค้นหาวิดีโอ",
    downloading: "กำลังดาวน์โหลด",
    complete: "เสร็จแล้ว",
    failed: "ไม่สำเร็จ",
  },
  en: {
    queued: "Queued",
    opening: "Opening Facebook",
    searching: "Finding video",
    downloading: "Downloading",
    complete: "Completed",
    failed: "Failed",
  },
};

export const COPY = {
  th: {
    pageTitle: "โหลดวิดีโอ Facebook เป็นคิว | Facebook Video Loader",
    pageDescription: "Facebook Video Loader ช่วยจัดคิวลิงก์วิดีโอ Facebook เปิดค้นหาและดาวน์โหลดทีละรายการใน Edge หรือ Chrome โปรไฟล์ที่ล็อกอินไว้",
    ogTitle: "Facebook Video Loader — โหลดวิดีโอ Facebook เป็นคิว",
    ogDescription: "วางลิงก์ Facebook หลายรายการ แล้วดาวน์โหลดทีละรายการในเบราว์เซอร์ที่ล็อกอินอยู่",
    languageLabel: "เลือกภาษา",
    mainMenu: "เมนูหลัก",
    languageThai: "ภาษาไทย",
    languageEnglish: "ภาษาอังกฤษ",
    navHow: "วิธีใช้งาน",
    navFaq: "คำถามที่พบบ่อย",
    navDownload: "ดาวน์โหลดส่วนขยาย",
    hero: {
      eyebrow: "FACEBOOK VIDEO LOADER",
      title: "โหลดวิดีโอ Facebook",
      accent: "เป็นคิว จบทีละรายการ",
      description: "ตัวช่วยจัดคิววิดีโอ Facebook ในเบราว์เซอร์ของคุณ วางลิงก์ได้ต่อเนื่อง แล้วให้ระบบเปิดโพสต์ ค้นหาวิดีโอ และดาวน์โหลดตามลำดับ",
      points: ["ใช้โปรไฟล์ Facebook เดิม", "ประมวลผลครั้งละหนึ่งรายการ", "คิวอยู่ในเบราว์เซอร์"],
      pointsLabel: "จุดเด่น",
    },
    queue: {
      overline: "ตัวจัดการงาน",
      title: "คิวดาวน์โหลด",
      connected: "เชื่อมต่อแล้ว",
      waiting: "รอส่วนขยาย",
      readyNote: "เชื่อมต่อส่วนขยายแล้ว ใช้ Facebook ในโปรไฟล์เบราว์เซอร์นี้",
      missingNote: "เปิดส่วนขยายใน Edge หรือ Chrome โปรไฟล์เดียวกับ Facebook แล้วรีเฟรชหน้านี้",
      inputLabel: "วางลิงก์วิดีโอ Facebook",
      placeholder: "วางหนึ่งลิงก์ต่อบรรทัด\nhttps://www.facebook.com/reel/...",
      inputHelp: "เพิ่มลิงก์ชุดใหม่ได้ระหว่างที่คิวกำลังทำงาน",
      add: "เพิ่มเข้าคิว",
      adding: "กำลังเพิ่ม…",
      items: "รายการในคิว",
      summary: (active, finished) => `${active} รอหรือกำลังทำ · ${finished} จบแล้ว`,
      resume: "ทำงานต่อ",
      pause: "พักคิว",
      clear: "ล้างรายการจบแล้ว",
      paused: "คิวจะพักหลังรายการที่กำลังประมวลผลหรือดาวน์โหลดเสร็จ",
      empty: "ลิงก์ที่เพิ่มจะแสดงตรงนี้",
      privacy: "ใช้กับวิดีโอที่คุณมีสิทธิ์ดูและบันทึก · ไม่ต้องกรอกรหัสผ่าน Facebook ในเว็บนี้",
      retry: "ลองใหม่",
      remove: "ลบ",
      removeLabel: "นำรายการออก",
      statuses: STATUS.th,
    },
    install: {
      eyebrow: "เริ่มต้นใช้งาน",
      title: "ดาวน์โหลดส่วนขยาย",
      description: "ติดตั้งในโปรไฟล์ Edge หรือ Chrome ที่ล็อกอิน Facebook เพื่อเชื่อมคิวกับเบราว์เซอร์",
      download: "ดาวน์โหลด Extension",
      fileNote: "ไฟล์ ZIP สำหรับติดตั้งแบบ Load unpacked",
      steps: [
        ["ดาวน์โหลดและแตกไฟล์", "แตก ZIP ไว้ในโฟลเดอร์ที่ต้องการเก็บส่วนขยาย"],
        ["เปิดหน้าส่วนขยาย", "ใช้ chrome://extensions หรือ edge://extensions"],
        ["โหลดส่วนขยายเข้าเบราว์เซอร์", "เปิด Developer mode เลือก Load unpacked แล้วเลือกโฟลเดอร์ที่มี manifest.json"],
      ],
    },
    how: {
      eyebrow: "วิธีทำงาน",
      title: "จากลิงก์ไปถึงไฟล์ดาวน์โหลด",
      description: "เว็บแอปส่งงานให้ส่วนขยายทำในเบราว์เซอร์ที่คุณใช้ Facebook อยู่",
      steps: [
        ["วางลิงก์โพสต์", "ใส่ URL วิดีโอ Facebook หนึ่งลิงก์ต่อหนึ่งบรรทัด แล้วเพิ่มเข้าคิวได้เรื่อย ๆ"],
        ["เปิดและค้นหาอัตโนมัติ", "ส่วนขยายเปิดโพสต์ในแท็บเบื้องหลัง ใช้สิทธิ์เข้าถึงจากโปรไฟล์ที่ล็อกอินอยู่"],
        ["ดาวน์โหลดตามลำดับ", "ระบบรอให้รายการปัจจุบันจบก่อนเริ่มรายการถัดไป และให้พักคิวหรือลองรายการที่พลาดใหม่ได้"],
      ],
    },
    about: {
      eyebrow: "ออกแบบมาสำหรับงานเป็นชุด",
      title: "Facebook Video Loader คืออะไร",
      paragraphs: [
        "Facebook Video Loader เป็นเว็บแอปช่วยจัดการลิงก์วิดีโอหลายรายการโดยไม่ต้องเปิดและดาวน์โหลดเองทีละโพสต์ คุณวางลิงก์ต่อเนื่องได้ ส่วนขยายจะค้นหาวิดีโอผ่านหน้า Facebook ที่โหลดในเบราว์เซอร์ของคุณ แล้วส่งไฟล์ให้ตัวจัดการดาวน์โหลดของเบราว์เซอร์",
        "แนะนำให้ล็อกอิน Facebook ใน Edge หรือ Chrome โปรไฟล์เดียวกับที่ติดตั้งส่วนขยายไว้ คิวเก็บใน session ของเบราว์เซอร์ ไม่ส่งรหัสผ่าน คุกกี้ หรือซอร์สหน้าโพสต์ไปยังเซิร์ฟเวอร์ของเว็บแอป",
      ],
    },
    faq: {
      eyebrow: "คำตอบก่อนเริ่ม",
      title: "คำถามที่พบบ่อย",
      description: "รายละเอียดการใช้งานและข้อจำกัดของตัวดาวน์โหลด",
      items: [
        ["ต้องล็อกอิน Facebook ก่อนใช้งานไหม?", "ต้องล็อกอินในเบราว์เซอร์โปรไฟล์เดียวกับที่เปิด Facebook Video Loader และติดตั้งส่วนขยายไว้ เว็บแอปไม่มีช่องกรอกรหัสผ่าน Facebook"],
        ["วางหลายลิงก์แล้วระบบทำพร้อมกันหรือไม่?", "ระบบทำทีละรายการ เปิดโพสต์หนึ่งรายการ ค้นหาวิดีโอ แล้วรอให้ดาวน์โหลดเสร็จก่อนเริ่มโพสต์ถัดไป คุณเพิ่มลิงก์ใหม่เข้าคิวระหว่างทำงานได้"],
        ["ดาวน์โหลดวิดีโอในกลุ่มส่วนตัวได้หรือไม่?", "ระบบค้นหาได้เมื่อบัญชีที่ล็อกอินอยู่มีสิทธิ์เปิดโพสต์นั้น แต่รูปแบบโพสต์และสิทธิ์ของ Facebook อาจทำให้บางวิดีโอไม่สามารถค้นหาหรือดาวน์โหลดได้ ใช้กับวิดีโอที่คุณมีสิทธิ์บันทึกเท่านั้น"],
        ["ถ้าขึ้น Facebook CDN 403 ต้องทำอย่างไร?", "ลิงก์วิดีโออาจหมดอายุ ระบบจะเปิดโพสต์อีกครั้งเพื่อหาลิงก์ใหม่หนึ่งครั้ง หากยังถูกปฏิเสธ ให้ตรวจว่าโพสต์ยังเปิดได้ในโปรไฟล์นี้ แล้วกดลองใหม่จากรายการที่ล้มเหลว"],
        ["ไฟล์ที่ดาวน์โหลดอยู่ที่ไหน และเก็บข้อมูลอะไรไว้บ้าง?", "ไฟล์ใช้โฟลเดอร์ดาวน์โหลดของเบราว์เซอร์ ส่วนคิวและสถานะอยู่ใน session ของส่วนขยายและถูกล้างเมื่อปิดเบราว์เซอร์ เว็บแอปไม่ขอสิทธิ์ cookies และไม่เก็บรหัสผ่าน Facebook"],
        ["ทำไมบางวิดีโอถึงดาวน์โหลดไม่ได้?", "โพสต์อาจต้องใช้สิทธิ์เพิ่มเติม ลิงก์ CDN อาจถูกยกเลิก หรือวิดีโออาจแยกสตรีมภาพกับเสียง ซึ่งตัวดาวน์โหลดรุ่นนี้ยังไม่รวมเป็นไฟล์เดียว"],
      ],
    },
    recommendation: {
      eyebrow: "คำแนะนำ",
      title: "เตรียมเบราว์เซอร์ก่อนเริ่ม",
      text: "ใช้ Microsoft Edge หรือ Google Chrome เวอร์ชันล่าสุด ติดตั้งส่วนขยายนี้ในโปรไฟล์ที่ล็อกอิน Facebook และตรวจโฟลเดอร์ดาวน์โหลดของเบราว์เซอร์ก่อนส่งลิงก์จำนวนมาก",
    },
    adLabel: "โฆษณา",
    footer: "ใช้กับวิดีโอที่คุณมีสิทธิ์ดูและบันทึก",
    localFeedback: {
      empty: "วางลิงก์ Facebook อย่างน้อยหนึ่งรายการก่อนเพิ่มเข้าคิว",
      invalid: "ไม่พบลิงก์ Facebook ที่ถูกต้องในรายการ",
      missingExtension: "เปิดส่วนขยายในเบราว์เซอร์เดียวกับ Facebook ก่อน แล้วรีเฟรชหน้านี้",
      adding: "กำลังเพิ่มรายการเข้าคิว…",
      noReply: "ส่วนขยายไม่ตอบกลับ ลองรีเฟรชเว็บแอปหลังเปิดส่วนขยาย",
      added: (count) => `เพิ่ม ${count} รายการเข้าคิวแล้ว`,
      duplicates: (count) => `ข้ามลิงก์ซ้ำ ${count} รายการ`,
      invalidCount: (count) => `ข้ามลิงก์ที่ไม่ใช่ Facebook ${count} รายการ`,
    },
  },
  en: {
    pageTitle: "Queue Facebook Video Downloads | Facebook Video Loader",
    pageDescription: "Queue Facebook video links and download them one at a time in the Edge or Chrome profile where you are signed in.",
    ogTitle: "Facebook Video Loader — Queue Facebook video downloads",
    ogDescription: "Add multiple Facebook links and download them sequentially in your signed-in browser.",
    languageLabel: "Language",
    mainMenu: "Main menu",
    languageThai: "Thai",
    languageEnglish: "English",
    navHow: "How it works",
    navFaq: "FAQ",
    navDownload: "Download extension",
    hero: {
      eyebrow: "FACEBOOK VIDEO LOADER",
      title: "Download Facebook",
      accent: "videos one at a time",
      description: "Keep a queue of Facebook video links in your browser. Add links as you go, then let the extension open each post, find the video, and download it in order.",
      points: ["Use your signed-in Facebook profile", "Process one video at a time", "Queue stays in your browser"],
      pointsLabel: "Highlights",
    },
    queue: {
      overline: "QUEUE MANAGER",
      title: "Download queue",
      connected: "Connected",
      waiting: "Waiting for extension",
      readyNote: "Extension connected. Facebook is available in this browser profile.",
      missingNote: "Enable the extension in the Edge or Chrome profile you use for Facebook, then refresh this page.",
      inputLabel: "Paste Facebook video links",
      placeholder: "One link per line\nhttps://www.facebook.com/reel/...",
      inputHelp: "Add more links while the queue is running",
      add: "Add to queue",
      adding: "Adding…",
      items: "Queue items",
      summary: (active, finished) => `${active} queued or active · ${finished} finished`,
      resume: "Resume queue",
      pause: "Pause queue",
      clear: "Clear finished items",
      paused: "The queue will pause after the current item finishes processing or downloading.",
      empty: "Added links will appear here",
      privacy: "Only use videos you are allowed to view and save · No Facebook password is needed here.",
      retry: "Retry",
      remove: "Remove",
      removeLabel: "Remove item",
      statuses: STATUS.en,
    },
    install: {
      eyebrow: "GETTING STARTED",
      title: "Download the extension",
      description: "Install it in the Edge or Chrome profile where you are signed in to Facebook to connect the queue to your browser.",
      download: "Download extension",
      fileNote: "ZIP package for manual installation",
      steps: [
        ["Download and extract", "Extract the ZIP into a folder where you want to keep the extension."],
        ["Open the extensions page", "Go to chrome://extensions or edge://extensions."],
        ["Load the extension", "Turn on Developer mode, choose Load unpacked, then select the folder containing manifest.json."],
      ],
    },
    how: {
      eyebrow: "HOW IT WORKS",
      title: "From link to downloaded file",
      description: "The web app hands each task to the extension in the browser where you use Facebook.",
      steps: [
        ["Add post links", "Paste Facebook video URLs, one per line, and add more links whenever you like."],
        ["Open and find videos", "The extension opens each post in a background tab using the access of your signed-in profile."],
        ["Download in order", "The next post starts after the current download finishes. You can pause the queue or retry failed items."],
      ],
    },
    about: {
      eyebrow: "BUILT FOR BATCHES",
      title: "What is Facebook Video Loader?",
      paragraphs: [
        "Facebook Video Loader helps you manage multiple Facebook video links without opening and downloading each post yourself. Add links as you go. The extension looks for videos on Facebook pages opened in your browser and sends files to the browser's download manager.",
        "Sign in to Facebook in the same Edge or Chrome profile where the extension is installed. The queue stays in the browser session. The app does not send your password, cookies, or post source to its server.",
      ],
    },
    faq: {
      eyebrow: "BEFORE YOU START",
      title: "Frequently asked questions",
      description: "How the downloader works and what to expect",
      items: [
        ["Do I need to sign in to Facebook first?", "Yes. Sign in to the same browser profile where Facebook Video Loader and its extension are open. The web app never asks for your Facebook password."],
        ["Will multiple links download at the same time?", "No. The extension opens one post, finds its video, and waits for the download to finish before starting the next one. You can add more links while the queue runs."],
        ["Can I download videos from private groups?", "The extension can look for a video when your signed-in account can open the post. Facebook permissions and post formats may still prevent some downloads. Only save videos you are allowed to keep."],
        ["What should I do if Facebook CDN returns 403?", "A video link may have expired. The extension reopens the post once to find a fresh link. If Facebook still rejects it, confirm you can open the post in this profile and retry the failed item."],
        ["Where are files saved, and what data is stored?", "Files go to your browser's download folder. Queue state stays in the extension's session storage and clears when the browser closes. The app does not request cookie access or store your Facebook password."],
        ["Why can't some videos be downloaded?", "A post may need additional access, a CDN link may expire, or the video may use separate audio and video streams that this version cannot combine into one file."],
      ],
    },
    recommendation: {
      eyebrow: "TIP",
      title: "Set up your browser first",
      text: "Use the latest version of Microsoft Edge or Google Chrome. Install the extension in the profile where you are signed in to Facebook, and check your browser's download folder before adding a large batch.",
    },
    adLabel: "Advertisement",
    footer: "Only use videos you are allowed to view and save.",
    localFeedback: {
      empty: "Paste at least one Facebook link before adding to the queue.",
      invalid: "No valid Facebook links were found.",
      missingExtension: "Enable the extension in the same browser profile as Facebook, then refresh this page.",
      adding: "Adding links to the queue…",
      noReply: "The extension did not respond. Refresh this page after enabling it.",
      added: (count) => `Added ${count} item${count === 1 ? "" : "s"} to the queue`,
      duplicates: (count) => `Skipped ${count} duplicate link${count === 1 ? "" : "s"}`,
      invalidCount: (count) => `Skipped ${count} non-Facebook link${count === 1 ? "" : "s"}`,
    },
  },
};

const EXTENSION_TEXT_EN = {
  "ลิงก์ CDN หมดอายุ (403) กำลังเปิดโพสต์เพื่อหาลิงก์ใหม่": "The CDN link expired (403). Reopening the post to find a fresh link.",
  "เสร็จแล้ว": "Completed",
  "Facebook CDN ปฏิเสธลิงก์ (403) — คัดลอกซอร์สใหม่ขณะล็อกอิน": "Facebook CDN rejected the link (403). Reopen the post while signed in and try again.",
  "ยกเลิกการดาวน์โหลด": "Download canceled",
  "ดาวน์โหลดไม่สำเร็จ — ตรวจลิงก์หรือการเข้าสู่ระบบ": "Download failed. Check the link and your Facebook sign-in.",
  "กำลังเปิดหน้า Facebook": "Opening Facebook post",
  "กำลังค้นหาลิงก์วิดีโอ": "Finding a video link",
  "รอคิวหลังกลับมาเชื่อมต่อ": "Queued after reconnecting",
  "รอคิว": "Queued",
  "รอคิวอีกครั้ง": "Queued to retry",
  "เปิดแท็บ Facebook ไม่สำเร็จ": "Could not open the Facebook tab.",
  "วิดีโอแยกภาพกับเสียง เว็บแอปยังรวมสตรีมไม่ได้": "This video has separate audio and video streams, which the app cannot combine yet.",
  "ไม่พบลิงก์วิดีโอในหน้า Facebook กรุณาตรวจว่าเข้าสู่ระบบและเปิดวิดีโอได้": "No video link was found. Check that you are signed in and can play the post.",
  "ประมวลผลรายการนี้ไม่สำเร็จ": "Could not process this item.",
  "อ่านข้อมูลวิดีโอจากหน้า Facebook ไม่สำเร็จ": "Could not read video details from the Facebook page.",
  "ไม่พบ URL Facebook ที่ถูกต้อง": "No valid Facebook URL was found.",
  "เพิ่มคิวไม่สำเร็จ": "Could not add items to the queue.",
  "ล้างรายการที่จบแล้วออกจากคิว": "Cleared finished items from the queue.",
  "พักคิวแล้ว": "Queue paused.",
  "ทำคิวต่อแล้ว": "Queue resumed.",
  "ลองใหม่ได้เฉพาะรายการที่ไม่สำเร็จ": "Only failed items can be retried.",
  "เพิ่มรายการให้ลองใหม่แล้ว": "Item added to the retry queue.",
  "นำออกได้เฉพาะรายการที่ยังไม่เริ่มหรือจบแล้ว": "Only queued or finished items can be removed.",
  "นำรายการออกจากคิวแล้ว": "Item removed from the queue.",
  "วางลิงก์ Facebook อย่างน้อยหนึ่งรายการก่อนเพิ่มเข้าคิว": "Paste at least one Facebook link before adding to the queue.",
  "ไม่พบลิงก์ Facebook ที่ถูกต้องในรายการ": "No valid Facebook links were found.",
  "เปิดส่วนขยายในเบราว์เซอร์เดียวกับ Facebook ก่อน แล้วรีเฟรชหน้านี้": "Enable the extension in the same browser profile as Facebook, then refresh this page.",
  "กำลังเพิ่มรายการเข้าคิว…": "Adding links to the queue…",
  "ส่วนขยายไม่ตอบกลับ ลองรีเฟรชเว็บแอปหลังเปิดส่วนขยาย": "The extension did not respond. Refresh this page after enabling it.",
  "อัปเดตคิวแล้ว": "Queue updated.",
};

function translateExtensionText(text) {
  if (!text) return "";
  if (EXTENSION_TEXT_EN[text]) return EXTENSION_TEXT_EN[text];

  const downloadMatch = text.match(/^กำลังดาวน์โหลด\s+(.+)$/);
  if (downloadMatch) return `Downloading ${downloadMatch[1]}`;

  const capacityMatch = text.match(/^คิวรองรับรายการที่ยังไม่เสร็จได้สูงสุด\s+(\d+)\s+รายการ$/);
  if (capacityMatch) return `The queue can hold up to ${capacityMatch[1]} unfinished items.`;

  const addedMatch = text.match(/^เพิ่ม\s+(\d+)\s+รายการเข้าคิวแล้ว$/);
  if (addedMatch) {
    const count = Number(addedMatch[1]);
    return `Added ${count} item${count === 1 ? "" : "s"} to the queue`;
  }

  const duplicateMatch = text.match(/^ข้ามลิงก์ซ้ำ\s+(\d+)\s+รายการ$/);
  if (duplicateMatch) {
    const count = Number(duplicateMatch[1]);
    return `Skipped ${count} duplicate link${count === 1 ? "" : "s"}`;
  }

  const invalidMatch = text.match(/^ข้ามลิงก์ที่ไม่ใช่ Facebook\s+(\d+)\s+รายการ$/);
  if (invalidMatch) {
    const count = Number(invalidMatch[1]);
    return `Skipped ${count} non-Facebook link${count === 1 ? "" : "s"}`;
  }

  return null;
}

export function localizeFeedback(text, language) {
  if (language === "th" || !text) return text;
  return text.split(" • ").map((part) => translateExtensionText(part) || "The extension could not complete this action.").join(" · ");
}

export function localizeQueueDetail(detail, status, language) {
  if (language === "th") return detail || STATUS.th[status] || status;
  return translateExtensionText(detail) || STATUS.en[status] || "Processing";
}
