# 🌿 JobPhichit (หางานพิจิตร.com & jobphichit.com)

ระบบเว็บหางานจังหวัดพิจิตร ครบวงจร ทั้งงานประจำ พาร์ทไทม์ และรับจ้างรายวัน พร้อมระบบปล่อยเช่าพื้นที่โฆษณา 15 ช่อง

## 🛠️ Tech Stack
- **Framework:** Next.js 14/15 (App Router, TypeScript)
- **Database & Auth:** Supabase (PostgreSQL + Auth + Storage)
- **Localization:** `next-intl` (3 ภาษา: ไทย 🇹🇭, อังกฤษ 🇬🇧, จีน 🇨🇳)
- **Icons:** `lucide-react`
- **Styling:** Custom CSS Tokens (ธีมเขียว-ขาว พรีเมียม)

---

## 📌 สรุปโครงสร้างระบบและเส้นทาง URL (Routes)

### 🌐 สาธารณะ (Public Pages)
- `/[locale]` — หน้าหลัก (Hero Search + 15 ช่องโฆษณา + งานล่าสุด + 3 ขั้นตอนใช้งาน)
- `/[locale]/jobs` — หน้าค้นหางาน (ตัวกรอง: คำค้น, ประเภทงาน, 13 อำเภอในพิจิตร, เงินเดือน)
- `/[locale]/job/[id]` — หน้ารายละเอียดงาน (ปุ่ม Quick Apply + บุ๊กมาร์ก + ข้อมูลนายจ้าง + งานที่คล้ายกัน)
- `/[locale]/privacy` — นโยบายความเป็นส่วนตัว (รองรับ PDPA)
- `/[locale]/terms` — ข้อกำหนดและเงื่อนไขการใช้งาน (ข้อตกลงและ Disclaimer ตัวกลาง)

### 🔐 ระบบยืนยันตัวตน (Auth Pages)
- `/[locale]/auth/login` — เข้าสู่ระบบ (Email/Password + Google OAuth + Facebook OAuth)
- `/[locale]/auth/register` — สมัครสมาชิก (เลือกประเภท: ผู้หางาน / นายจ้าง)
- `/[locale]/auth/forgot-password` — รีเซ็ตรหัสผ่านผ่านอีเมล
- `/[locale]/auth/callback` — OAuth Callback (จัดการ Sync Role ของโปรไฟล์)

### 👤 แผงควบคุมผู้หางาน (Job Seeker Dashboard)
- `/[locale]/seeker/dashboard` — ภาพรวมสถานะการสมัครงาน + สถิติ
- `/[locale]/seeker/profile` — จัดการโปรไฟล์ (สลับโปรไฟล์ย่อรับจ้างรายวัน / โปรไฟล์เต็ม + อัปโหลดเรซูเม่ PDF + ทักษะ + พื้นที่รับงาน)
- `/[locale]/seeker/applications` — ประวัติการสมัครงาน (พร้อมตัวกรองสถานะ)
- `/[locale]/seeker/bookmarks` — รายการงานที่บันทึกไว้

### 🏢 แผงควบคุมนายจ้าง (Employer Dashboard)
- `/[locale]/employer/dashboard` — ภาพรวมยอดเข้าชมประกาศงาน + สถิติผู้สมัคร
- `/[locale]/employer/jobs` — รายการประกาศงานทั้งหมดของนายจ้าง
- `/[locale]/employer/jobs/new` — ฟอร์มลงประกาศงานใหม่ (ฟรี!)
- `/[locale]/employer/jobs/[id]/applicants` — ตาราง List View รายชื่อผู้สมัคร (อัปเดตสถานะ: รอตรวจ/นัดสัมภาษณ์/รับเข้าทำงาน/ไม่รับ)

### 👑 แผงควบคุมผู้ดูแลระบบ (Admin Panel)
- `/[locale]/admin/dashboard` — ภาพรวมสถิติทั้งระบบ (จำนวนสมาชิก, ประกาศงาน, การสมัคร, โฆษณา)
- `/[locale]/admin/jobs` — อนุมัติ / ปฏิเสธ / เปิด-ปิด ประกาศงาน + ตั้งค่า "งานเด่น"
- `/[locale]/admin/users` — จัดการสมาชิกและสิทธิ์ (เปลี่ยนบทบาท: ผู้หางาน / นายจ้าง / แอดมิน)
- `/[locale]/admin/ads` — **ระบบจัดการพื้นที่โฆษณา 15 ช่อง** (ใส่รูปแบนเนอร์, ลิงก์ร้านค้า, วันหมดอายุ)
- `/[locale]/admin/categories` — จัดการหมวดหมู่งาน และ 13 อำเภอในจังหวัดพิจิตร

---

## ⚡ วิธีเอาขึ้น Vercel เมื่อคุณพร้อม

เมื่อคุณพร้อมที่จะ Deploy ขึ้น GitHub และ Vercel ให้รันคำสั่งดังนี้ใน Terminal:

```bash
cd /Users/chanatipk/.gemini/antigravity/scratch/jobphichit

# 1. Initialize Git
git init
git add .
git commit -m "🌿 Complete JobPhichit.com Website"

# 2. Push ขึ้น GitHub
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/jobphichit.git
git branch -M main
git push -u origin main
```

จากนั้นทำตามขั้นตอนใน **[README.md](file:///Users/chanatipk/.gemini/antigravity/scratch/jobphichit/README.md)** เพื่อ Import โปรเจกต์ใน Vercel ครับ!
