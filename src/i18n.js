const STATUS = {
  th: {
    queued: "รอคิว",
    opening: "กำลังเปิด Facebook",
    searching: "กำลังค้นหาวิดีโอ",
    merging: "กำลังรวมภาพและเสียง",
    downloading: "กำลังดาวน์โหลด",
    complete: "เสร็จแล้ว",
    failed: "ไม่สำเร็จ",
  },
  en: {
    queued: "Queued",
    opening: "Opening Facebook",
    searching: "Finding video",
    merging: "Merging audio and video",
    downloading: "Downloading",
    complete: "Completed",
    failed: "Failed",
  },
};

export const COPY = {
  th: {
    pageTitle: "ดาวน์โหลดวิดีโอ Facebook เป็นชุด | Facebook Video Loader",
    pageDescription: "วางลิงก์วิดีโอ Facebook และ Reels หลายรายการ แล้วจัดคิวดาวน์โหลดทีละรายการผ่าน Edge หรือ Chrome ใช้ส่วนขยายและบัญชีที่มีสิทธิ์ดูโพสต์ ไม่ขอรหัสผ่าน",
    schemaBrowserRequirements: "ต้องใช้ Microsoft Edge หรือ Google Chrome พร้อมติดตั้งส่วนขยาย Facebook Video Loader",
    ogTitle: "ดาวน์โหลดวิดีโอ Facebook เป็นชุด — Facebook Video Loader",
    ogDescription: "จัดคิววิดีโอ Facebook และ Reels หลายลิงก์ แล้วดาวน์โหลดทีละรายการใน Edge หรือ Chrome โปรไฟล์ที่ล็อกอินอยู่",
    languageLabel: "เลือกภาษา",
    mainMenu: "เมนูหลัก",
    languageThai: "ภาษาไทย",
    languageEnglish: "ภาษาอังกฤษ",
    navHow: "วิธีใช้งาน",
    navFaq: "คำถามที่พบบ่อย",
    navDownload: "ดาวน์โหลดส่วนขยาย",
    hero: {
      eyebrow: "FACEBOOK VIDEO LOADER",
      title: "ดาวน์โหลดวิดีโอ Facebook",
      accent: "เป็นคิว ทีละรายการ",
      description: "วางลิงก์วิดีโอ Facebook และ Reels ได้ต่อเนื่อง แล้วให้ส่วนขยายเปิดโพสต์ ค้นหา และดาวน์โหลดทีละรายการใน Edge หรือ Chrome โปรไฟล์ที่ล็อกอินอยู่",
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
      updateNote: "ส่วนขยายเวอร์ชันเก่า ตัวเลือก การรวมภาพกับเสียง และชื่อไฟล์ต่อรายการต้องใช้เวอร์ชัน 1.5.0 ขึ้นไป",
      updateLink: "ดาวน์โหลดแล้วโหลดส่วนขยายใหม่",
      inputLabel: "ลิงก์วิดีโอ Facebook (หนึ่งลิงก์ต่อบรรทัด)",
      placeholder: "https://www.facebook.com/reel/...\nhttps://www.facebook.com/reel/...",
      filenameInputLabel: "ชื่อไฟล์ (เรียงตามบรรทัดลิงก์)",
      filenamePlaceholder: "ชื่อคลิป 1\nชื่อคลิป 2",
      inputHelp: "บรรทัดที่ตรงกันจะจับคู่กัน · เว้นชื่อว่างเพื่อใช้ชื่ออัตโนมัติ · เพิ่มลิงก์ระหว่างคิวทำงานได้",
      add: "เพิ่มเข้าคิว",
      adding: "กำลังเพิ่ม…",
      items: "รายการในคิว",
      summary: (active, finished) => `${active} รอหรือกำลังทำ · ${finished} จบแล้ว`,
      settingsTitle: "ตัวเลือกดาวน์โหลด",
      qualityLabel: "คุณภาพวิดีโอ",
      qualityOptions: [["auto", "ดีที่สุดที่พบ (อัตโนมัติ)"], ["1080", "1080p (HD)"], ["720", "720p (HD)"], ["360", "360p (SD)"]],
      filenameLabel: "รูปแบบชื่อไฟล์สำรอง",
      filenameOptions: [["title", "ชื่อโพสต์"], ["date-title", "วันที่_ชื่อโพสต์"], ["title-id", "ชื่อโพสต์_ID"]],
      settingsNote: "ใช้กับลิงก์ที่ไม่ได้กำหนดชื่อไฟล์เอง",
      import: "นำเข้าคิว",
      export: "ส่งออกคิว",
      exportNote: "ไฟล์ JSON เก็บลิงก์ ตัวเลือก และชื่อไฟล์ของรายการที่ยังไม่เสร็จ รายการที่เสร็จแล้วจะไม่ถูกนำกลับมาดาวน์โหลดซ้ำ",
      emptyInput: "วางลิงก์ Facebook อย่างน้อยหนึ่งรายการก่อนเพิ่มเข้าคิว",
      invalidInput: "ไม่พบลิงก์ Facebook ที่ถูกต้องในรายการ",
      importInvalid: "อ่านไฟล์ไม่ได้ ใช้ไฟล์ JSON ที่ส่งออกจากเว็บนี้ หรือไฟล์ TXT ที่มีหนึ่งรายการต่อลิงก์ต่อบรรทัด",
      exportEmpty: "ไม่มีรายการที่ยังไม่เสร็จให้ส่งออก",
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
      description: "จัดคิวดาวน์โหลดวิดีโอ Facebook และ Reels ลงคอมทีละรายการ ผ่านส่วนขยายในเบราว์เซอร์ที่คุณใช้ Facebook อยู่",
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
        ["คิวจะหายไหมถ้าปิดเบราว์เซอร์?", "คิวอยู่ใน session ของส่วนขยายและจะถูกล้างเมื่อปิดเบราว์เซอร์ กดส่งออกคิวเพื่อบันทึกลิงก์และตัวเลือกของรายการที่ยังไม่เสร็จเป็นไฟล์ JSON แล้วนำเข้ากลับมาใช้ภายหลังได้"],
        ["เลือกคุณภาพและชื่อไฟล์ได้ไหม?", "เลือกอัตโนมัติหรือ 1080p, 720p และ 360p ได้ ส่วนชื่อไฟล์ให้ใส่ในช่องชื่อไฟล์ โดยวางชื่อไว้บรรทัดเดียวกับลิงก์ที่ต้องการ หากเว้นว่าง ระบบใช้รูปแบบชื่อไฟล์ที่เลือกไว้"],
        ["ดาวน์โหลด Facebook Reels ได้ไหม?", "ได้เมื่อบัญชีที่ล็อกอินอยู่เปิดและเล่น Reel นั้นได้ วางลิงก์ Reel ในคิวเหมือนลิงก์โพสต์ทั่วไป แล้วส่วนขยายจะค้นหาและดาวน์โหลดทีละรายการ รูปแบบโพสต์บางแบบอาจไม่รองรับ"],
        ["ดาวน์โหลดวิดีโอในกลุ่มส่วนตัวได้หรือไม่?", "ระบบค้นหาได้เมื่อบัญชีที่ล็อกอินอยู่มีสิทธิ์เปิดโพสต์นั้น แต่รูปแบบโพสต์และสิทธิ์ของ Facebook อาจทำให้บางวิดีโอไม่สามารถค้นหาหรือดาวน์โหลดได้ ใช้กับวิดีโอที่คุณมีสิทธิ์บันทึกเท่านั้น"],
        ["ถ้าขึ้น Facebook CDN 403 ต้องทำอย่างไร?", "ลิงก์วิดีโออาจหมดอายุ ระบบจะเปิดโพสต์อีกครั้งเพื่อหาลิงก์ใหม่หนึ่งครั้ง หากยังถูกปฏิเสธ ให้ตรวจว่าโพสต์ยังเปิดได้ในโปรไฟล์นี้ แล้วกดลองใหม่จากรายการที่ล้มเหลว"],
        ["ไฟล์ที่ดาวน์โหลดอยู่ที่ไหน และเก็บข้อมูลอะไรไว้บ้าง?", "ไฟล์ใช้โฟลเดอร์ดาวน์โหลดของเบราว์เซอร์ ส่วนคิวและสถานะอยู่ใน session ของส่วนขยายและถูกล้างเมื่อปิดเบราว์เซอร์ เว็บแอปไม่ขอสิทธิ์ cookies และไม่เก็บรหัสผ่าน Facebook"],
        ["ทำไมบางวิดีโอถึงดาวน์โหลดไม่ได้?", "โพสต์อาจต้องใช้สิทธิ์เพิ่มเติมหรือลิงก์ CDN อาจหมดอายุ วิดีโอที่แยกภาพกับเสียงจะถูกรวมเป็นไฟล์ MP4 ในเบราว์เซอร์ หากรูปแบบไม่รองรับ ระบบจะแจ้งให้ทราบ"],
      ],
    },
    troubleshooting: {
      eyebrow: "คู่มือแก้ปัญหา",
      title: "แก้ปัญหา Facebook CDN 403",
      description: "ข้อผิดพลาดนี้มักเกิดเมื่อลิงก์วิดีโอหมดอายุหรือโพสต์ต้องใช้สิทธิ์จากโปรไฟล์ที่ล็อกอินอยู่",
      steps: [
        ["ตรวจว่าเปิดโพสต์ได้", "เปิดโพสต์ใน Edge หรือ Chrome โปรไฟล์เดียวกับส่วนขยาย และลองเล่นวิดีโอให้เริ่มก่อน"],
        ["ลองดึงลิงก์ใหม่", "ระบบจะเปิดโพสต์อีกครั้งให้อัตโนมัติหนึ่งครั้ง ถ้ารายการยังไม่สำเร็จ ให้กด ลองใหม่ ในคิว"],
        ["ตรวจสิทธิ์และรูปแบบวิดีโอ", "ถ้ายังขึ้น 403 ให้ยืนยันว่าบัญชีนี้มีสิทธิ์ดูโพสต์ ระบบจะรวมวิดีโอที่แยกภาพกับเสียงในเบราว์เซอร์ แต่บางรูปแบบอาจไม่รองรับ"],
      ],
      note: "การส่งออกคิวเก็บเฉพาะ URL โพสต์ Facebook ไว้ในไฟล์บนเครื่อง โปรดเก็บไฟล์นั้นในที่ปลอดภัยและอย่าแชร์ลิงก์ส่วนตัว",
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
    pageTitle: "Download Facebook videos in a queue | Facebook Video Loader",
    pageDescription: "Queue Facebook video and Reel links in Edge or Chrome, find posts using your signed-in profile, and download one at a time. Requires our browser extension.",
    schemaBrowserRequirements: "Requires Microsoft Edge or Google Chrome with the Facebook Video Loader extension installed.",
    ogTitle: "Download Facebook videos in a queue — Facebook Video Loader",
    ogDescription: "Queue Facebook videos and Reels, then download one at a time in your signed-in Edge or Chrome profile.",
    languageLabel: "Language",
    mainMenu: "Main menu",
    languageThai: "Thai",
    languageEnglish: "English",
    navHow: "How it works",
    navFaq: "FAQ",
    navDownload: "Download extension",
    hero: {
      eyebrow: "FACEBOOK VIDEO LOADER",
      title: "Download Facebook videos",
      accent: "in a queue",
      description: "Queue Facebook video and Reel links, then use the extension to find posts and download one at a time in the Edge or Chrome profile where you are signed in.",
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
      updateNote: "This extension is out of date. Download options, audio/video merging, and per-link file names require version 1.5.0 or later.",
      updateLink: "Download and reload the extension",
      inputLabel: "Facebook video links (one per line)",
      placeholder: "https://www.facebook.com/reel/...\nhttps://www.facebook.com/reel/...",
      filenameInputLabel: "File names (match link order)",
      filenamePlaceholder: "Clip name 1\nClip name 2",
      inputHelp: "Matching line numbers are paired · Leave a name blank to use an automatic name · Add links while the queue runs",
      add: "Add to queue",
      adding: "Adding…",
      items: "Queue items",
      summary: (active, finished) => `${active} queued or active · ${finished} finished`,
      settingsTitle: "Download options",
      qualityLabel: "Video quality",
      qualityOptions: [["auto", "Best available (auto)"], ["1080", "1080p (HD)"], ["720", "720p (HD)"], ["360", "360p (SD)"]],
      filenameLabel: "Fallback file-name format",
      filenameOptions: [["title", "Post title"], ["date-title", "Date_title"], ["title-id", "Title_ID"]],
      settingsNote: "Used for links without a custom file name.",
      import: "Import queue",
      export: "Export queue",
      exportNote: "Saves unfinished links, options, and custom file names in JSON. Completed items are excluded to avoid downloading them again.",
      emptyInput: "Paste at least one Facebook link before adding to the queue.",
      invalidInput: "No valid Facebook links were found.",
      importInvalid: "Could not read the file. Choose a queue JSON exported from this site or a TXT file with one item per line.",
      exportEmpty: "There are no unfinished items to export.",
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
      description: "Queue Facebook video and Reel downloads to your computer one at a time with the extension in the browser where you use Facebook.",
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
        ["Will my queue disappear if I close the browser?", "The queue is stored in the extension's session and clears when the browser closes. Export it to save unfinished links and their options as JSON, then import them later."],
        ["Can I choose video quality and file names?", "Choose auto, 1080p, 720p, or 360p. Enter each file name in the separate name field on the same line as its link. Leave it blank to use your selected file-name format."],
        ["Can I download Facebook Reels?", "Yes, when your signed-in account can open and play the Reel. Add its link to the queue like any other Facebook post. Some post formats may not be supported."],
        ["Can I download videos from private groups?", "The extension can look for a video when your signed-in account can open the post. Facebook permissions and post formats may still prevent some downloads. Only save videos you are allowed to keep."],
        ["What should I do if Facebook CDN returns 403?", "A video link may have expired. The extension reopens the post once to find a fresh link. If Facebook still rejects it, confirm you can open the post in this profile and retry the failed item."],
        ["Where are files saved, and what data is stored?", "Files go to your browser's download folder. Queue state stays in the extension's session storage and clears when the browser closes. The app does not request cookie access or store your Facebook password."],
        ["Why can't some videos be downloaded?", "A post may need additional access or its CDN link may expire. Videos with separate audio and video streams are combined into an MP4 in your browser. Some formats may not be supported."],
      ],
    },
    troubleshooting: {
      eyebrow: "TROUBLESHOOTING",
      title: "Fix Facebook CDN 403 errors",
      description: "This usually means the video link expired or the post needs access from the signed-in browser profile.",
      steps: [
        ["Make sure the post opens", "Open the post in the same Edge or Chrome profile as the extension, then start playing the video."],
        ["Fetch a fresh link", "The extension reopens the post once automatically. If the item still fails, choose Retry in the queue."],
        ["Check access and video format", "If 403 continues, confirm this account can view the post. The extension combines separate audio and video streams in the browser, though some formats may not be supported."],
      ],
      note: "Queue export stores Facebook post URLs in a local file. Keep it private and do not share links to private posts.",
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
  "Facebook CDN ปฏิเสธลิงก์หลังลองใหม่ (403) — ตรวจสิทธิ์โพสต์แล้วลองอีกครั้ง": "Facebook CDN rejected the fresh link (403). Check post access and try again.",
  "ยกเลิกการดาวน์โหลด": "Download canceled",
  "ดาวน์โหลดไม่สำเร็จ — ตรวจลิงก์หรือการเข้าสู่ระบบ": "Download failed. Check the link and your Facebook sign-in.",
  "กำลังเปิดหน้า Facebook": "Opening Facebook post",
  "กำลังค้นหาลิงก์วิดีโอ": "Finding a video link",
  "กำลังรวมภาพและเสียง": "Merging audio and video",
  "รอคิวหลังเริ่มการรวมใหม่": "Queued to restart the merge",
  "ลิงก์สตรีมวิดีโอหรือเสียงไม่ถูกต้อง": "The video or audio stream URL is invalid.",
  "ไม่พบแทร็กภาพในสตรีมวิดีโอ": "No video track was found in the video stream.",
  "ไม่พบแทร็กเสียงในสตรีมเสียง": "No audio track was found in the audio stream.",
  "สร้างไฟล์วิดีโอที่มีเสียงไม่สำเร็จ": "Could not create a video file with audio.",
  "รอคิวหลังกลับมาเชื่อมต่อ": "Queued after reconnecting",
  "รอคิว": "Queued",
  "รอคิวอีกครั้ง": "Queued to retry",
  "เปิดแท็บ Facebook ไม่สำเร็จ": "Could not open the Facebook tab.",
  "วิดีโอแยกภาพกับเสียง เว็บแอปยังรวมสตรีมไม่ได้": "This older extension version could not combine the separate streams. Update the extension, then retry this item.",
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
  "อ่านไฟล์ไม่ได้ ใช้ไฟล์ JSON ที่ส่งออกจากเว็บนี้ หรือไฟล์ TXT ที่มีหนึ่งลิงก์ต่อบรรทัด": "Could not read the file. Choose a queue JSON exported from this site or a TXT file with one link per line.",
  "ไม่มีรายการที่ยังไม่เสร็จให้ส่งออก": "There are no unfinished items to export.",
};

const FEEDBACK_TH_FROM_EN = {
  "Paste at least one Facebook link before adding to the queue.": "วางลิงก์ Facebook อย่างน้อยหนึ่งรายการก่อนเพิ่มเข้าคิว",
  "No valid Facebook links were found.": "ไม่พบลิงก์ Facebook ที่ถูกต้องในรายการ",
  "Could not read the file. Choose a queue JSON exported from this site or a TXT file with one link per line.": "อ่านไฟล์ไม่ได้ ใช้ไฟล์ JSON ที่ส่งออกจากเว็บนี้ หรือไฟล์ TXT ที่มีหนึ่งลิงก์ต่อบรรทัด",
  "There are no unfinished items to export.": "ไม่มีรายการที่ยังไม่เสร็จให้ส่งออก",
  "Queue updated.": "อัปเดตคิวแล้ว",
  "Queue paused.": "พักคิวแล้ว",
  "Queue resumed.": "ทำคิวต่อแล้ว",
  "Cleared finished items from the queue.": "ล้างรายการที่จบแล้วออกจากคิว",
  "Item removed from the queue.": "นำรายการออกจากคิวแล้ว",
};

function translateExtensionText(text) {
  if (!text) return "";
  if (!/[ก-๙]/.test(text)) return text;
  if (EXTENSION_TEXT_EN[text]) return EXTENSION_TEXT_EN[text];

  const streamHttpError = text.match(/^(วิดีโอ|เสียง): Facebook CDN ตอบกลับ HTTP (\d+)$/);
  if (streamHttpError) {
    const stream = streamHttpError[1] === "วิดีโอ" ? "video" : "audio";
    return `Facebook CDN returned HTTP ${streamHttpError[2]} for the ${stream} stream.`;
  }

  const oversizedStream = text.match(/^(วิดีโอ|เสียง): ไฟล์ใหญ่เกินขนาดที่รวมในเบราว์เซอร์ได้$/);
  if (oversizedStream) return `The ${oversizedStream[1] === "วิดีโอ" ? "video" : "audio"} stream is too large to merge in this browser.`;

  const unsupportedStream = text.match(/^เบราว์เซอร์ไม่รองรับรูปแบบสตรีม(ภาพ|เสียง)นี้สำหรับการรวมแบบไม่แปลงคุณภาพ$/);
  if (unsupportedStream) return `This browser cannot merge the ${unsupportedStream[1] === "ภาพ" ? "video" : "audio"} stream without re-encoding it.`;

  const downloadMatch = text.match(/^กำลังดาวน์โหลด\s+(.+)$/);
  if (downloadMatch) return `Downloading ${downloadMatch[1]}`;

  const qualityFallbackMatch = text.match(/^ไม่พบ\s+(\d+)p\s+ใช้\s+(.+)\s+แทน$/);
  if (qualityFallbackMatch) return `${qualityFallbackMatch[1]}p was unavailable; using ${qualityFallbackMatch[2]} instead.`;

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

  const exportedMatch = text.match(/^ส่งออกลิงก์คิว\s+(\d+)\s+รายการแล้ว$/);
  if (exportedMatch) {
    const count = Number(exportedMatch[1]);
    return `Exported ${count} queue link${count === 1 ? "" : "s"}.`;
  }

  return null;
}

export function localizeFeedback(text, language) {
  if (!text) return text;
  return text.split(" • ").map((part) => {
    if (language === "en") return translateExtensionText(part) || "The extension could not complete this action.";
    if (FEEDBACK_TH_FROM_EN[part]) return FEEDBACK_TH_FROM_EN[part];

    const addedMatch = part.match(/^Added (\d+) items? to the queue$/);
    if (addedMatch) return `เพิ่ม ${addedMatch[1]} รายการเข้าคิวแล้ว`;
    const duplicateMatch = part.match(/^Skipped (\d+) duplicate links?$/);
    if (duplicateMatch) return `ข้ามลิงก์ซ้ำ ${duplicateMatch[1]} รายการ`;
    const invalidMatch = part.match(/^Skipped (\d+) non-Facebook links?$/);
    if (invalidMatch) return `ข้ามลิงก์ที่ไม่ใช่ Facebook ${invalidMatch[1]} รายการ`;

    return part;
  }).join(language === "en" ? " · " : " • ");
}

export function localizeQueueDetail(detail, status, language) {
  if (language === "th") return detail || STATUS.th[status] || status;
  return translateExtensionText(detail) || STATUS.en[status] || "Processing";
}
