# Facebook Video Loader

เว็บแอปและส่วนขยายเบราว์เซอร์สำหรับประมวลผลลิงก์วิดีโอ Facebook ทีละรายการในโปรไฟล์เบราว์เซอร์ที่เข้าสู่ระบบอยู่

## เริ่มใช้งาน

1. ใช้โปรไฟล์ Edge หรือ Chrome ที่เข้าสู่ระบบ Facebook และเปิด `edge://extensions` หรือ `chrome://extensions`.
2. เปิด **Developer mode** แล้วเลือก **Load unpacked**.
3. เลือกโฟลเดอร์ `browser-extension` ในโปรเจกต์
4. เปิดเว็บแอปและรีเฟรชหน้า
5. วางลิงก์ทีละหลายรายการหรือทยอยเพิ่มรายการ แล้วเลือก **เพิ่มเข้าคิว**

ดาวน์โหลดไฟล์ส่วนขยายได้จากปุ่ม **ดาวน์โหลดส่วนขยาย** บนหน้าเว็บ แล้วแตกไฟล์ ZIP ไปยังโฟลเดอร์ที่ต้องการ ใน Edge/Chrome เปิด Developer mode เลือก **Load unpacked** และเลือกโฟลเดอร์ที่มี `manifest.json` จากนั้นเปิดเว็บแอปในโปรไฟล์เดียวกัน

## เผยแพร่ด้วย Vercel

นำ repository `JiraNot/facedownload` เข้า Vercel โดยเลือก framework preset เป็น Vite (หรือให้ Vercel ตรวจจับอัตโนมัติ) ค่า build ถูกกำหนดไว้ใน `vercel.json` แล้ว: ติดตั้งด้วย `npm ci`, รัน `npm run build:vercel` และเผยแพร่โฟลเดอร์ `dist/client`. เมื่อเชื่อม GitHub แล้ว การ push เข้า `main` จะสร้าง production deployment และ branch อื่นจะสร้าง preview deployment.

สคริปต์ prerender ใช้ `VITE_VERCEL_PROJECT_PRODUCTION_URL` ที่ Vercel กำหนดให้สร้าง canonical URL, sitemap และ robots.txt ตาม production domain หากใช้ custom domain ให้เพิ่ม `VITE_SITE_URL` เป็น URL แบบ HTTPS ใน Project Environment Variables เพื่อให้ metadata ชี้ไปยังโดเมนหลักที่ต้องการ

production URL ปัจจุบันคือ `https://facedownload.vercel.app/` และได้เพิ่ม origin นี้ใน `browser-extension/manifest.json` กับ `browser-extension/background.js` แล้ว หลังดึงโค้ดรุ่นใหม่ให้ reload ส่วนขยายในหน้า Extensions เพื่อให้เว็บแอปสื่อสารกับส่วนขยายได้

`https://jiranot.github.io/facedownload/` ยังเป็น fallback สำหรับ build GitHub Pages เดิม (`npm run build:pages`).

หน้า HTML จะ pre-render เนื้อหาคำแนะนำและ FAQ ไว้ใน source เพื่อให้ crawler อ่านได้ก่อน JavaScript ทำงาน มี title/description, canonical URL, sitemap และ `WebApplication` structured data การเตรียมข้อมูลนี้ช่วยให้ค้นพบและเข้าใจหน้าได้ แต่ไม่รับประกันอันดับหรือการแสดงผลใน Google/AI Search.

## พฤติกรรมคิว

- เปิดโพสต์ Facebook หนึ่งรายการในแท็บเบื้องหลัง
- ค้นหาลิงก์วิดีโอจากหน้าโพสต์ที่โหลดในโปรไฟล์ที่เข้าสู่ระบบ
- ดาวน์โหลดด้วยตัวจัดการดาวน์โหลดของเบราว์เซอร์ และรอจนจบก่อนเริ่มรายการถัดไป
- หยุดคิวชั่วคราวได้ รายการที่กำลังทำจะจบก่อนคิวหยุด
- ลองรายการที่ล้มเหลวใหม่ ลบรายการ หรือเคลียร์รายการที่จบแล้วได้
- หากลิงก์ CDN ตอบ 403 จะเปิดโพสต์ใหม่เพื่อหา URL สดอีกครั้งหนึ่ง
- คิวใช้ session storage ของส่วนขยาย จึงคงอยู่ขณะ Edge/Chrome เปิดอยู่ และล้างเมื่อเริ่มเบราว์เซอร์ใหม่

## สิทธิ์และข้อมูล

ส่วนขยายใช้สิทธิ์ `downloads` และ `storage` พร้อม host access สำหรับหน้า Facebook และเว็บแอปนี้ ใช้ `chrome.tabs` เพื่อเปิดและปิดแท็บประมวลผล ไม่ขอ `cookies` permission ไม่เก็บรหัสผ่านหรือคุกกี้ และไม่ส่งซอร์สหน้า Facebook หรือ URL สื่อไปยังเซิร์ฟเวอร์แอป

ใช้กับวิดีโอที่คุณมีสิทธิ์ดูและบันทึกเท่านั้น วิดีโอที่ Facebook แยกเสียงกับภาพยังดาวน์โหลดผ่านตัวจัดการเบราว์เซอร์แบบไฟล์เดียวไม่ได้ หาก Facebook ปฏิเสธ URL สดซ้ำ ให้เปิดโพสต์ในโปรไฟล์ที่เข้าสู่ระบบ ตรวจสิทธิ์เข้าถึง แล้วลองใหม่

## คำสั่งพัฒนา

- `npm run dev` — เปิดเซิร์ฟเวอร์พัฒนา
- `npm run package:extension` — สร้าง ZIP ส่วนขยายลงใน `public/downloads/`
- `npm run build` — build สำหรับ local preview และ Sites handoff
- `npm run build:pages` — build โดยใช้ base path ของ GitHub Pages
- `npm run build:vercel` — build เว็บพร้อม prerender สำหรับ Vercel
- `npm run test:parser` — ทดสอบ parser ด้วยตัวอย่างที่ไม่มีข้อมูลผู้ใช้
- `npm run test:sites` — ทดสอบ Sites worker

## Google AdSense

หน้าเว็บมีตำแหน่งโฆษณา responsive สองตำแหน่ง โดยจะไม่แสดงหรือโหลด AdSense จนกว่าจะกำหนดค่าจริง:

- `VITE_ADSENSE_CLIENT` — publisher ID รูปแบบ `ca-pub-...`
- `VITE_ADSENSE_SLOT_TOOL` — ad unit ID สำหรับตำแหน่งใต้ตัวจัดการคิว
- `VITE_ADSENSE_SLOT_CONTENT` — ad unit ID สำหรับตำแหน่งใต้ FAQ

ตั้งค่าใน `.env.local` สำหรับ build ในเครื่อง หรือ Project Environment Variables ใน Vercel จากนั้น build และ deploy ใหม่ ระบบจะสร้าง `ads.txt` จาก publisher ID จริงให้อัตโนมัติ ต้องเพิ่ม/ยืนยันเว็บไซต์และสร้าง ad units ในบัญชี AdSense ก่อน Google จึงจะพิจารณาแสดงโฆษณา.
