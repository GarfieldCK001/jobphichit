# 🌿 JobPhichit.com — คู่มือ Deploy & สรุปโครงการ

## โครงสร้างโปรเจกต์
```
jobphichit/
├── src/
│   ├── app/[locale]/         ← Pages (th/en/zh)
│   ├── components/           ← UI Components
│   ├── lib/supabase/         ← Supabase clients
│   ├── types/                ← TypeScript types
│   ├── i18n/                 ← i18n config
│   └── middleware.ts         ← Auth + i18n routing
├── messages/                 ← Thai/English/Chinese translations
├── .env.local                ← Environment variables
└── next.config.mjs
```

## ✅ สรุปหน้าที่สร้างเสร็จสมบูรณ์ 100%

| หน้า | URL | คำอธิบาย |
|------|-----|----------|
| หน้าหลัก | `/th` | Hero Search, โฆษณา 15 ช่อง, งานเด่น, งานล่าสุด, 3 ขั้นตอนใช้งาน |
| ค้นหางาน | `/th/jobs` | ตัวกรองคำค้น, ประเภทงาน, 13 อำเภอ, ช่วงเงินเดือน |
| รายละเอียดงาน | `/th/job/[id]` | ปุ่ม Quick Apply, บันทึกงาน, ข้อมูลบริษัท, ยอดดูงาน |
| เข้าสู่ระบบ | `/th/auth/login` | Email/Password, Google OAuth, Facebook OAuth |
| สมัครสมาชิก | `/th/auth/register` | เลือกรอรับงาน / นายจ้าง |
| ลืมรหัสผ่าน | `/th/auth/forgot-password` | ส่งอีเมลรีเซ็ตรหัสผ่าน |
| นโยบายความเป็นส่วนตัว | `/th/privacy` | รองรับ PDPA |
| ข้อกำหนดการใช้งาน | `/th/terms` | เงื่อนไขการใช้งาน & Disclaimer |
| Dashboard ผู้หางาน | `/th/seeker/dashboard` | สถิติสถานะการสมัครงาน |
| โปรไฟล์ผู้หางาน | `/th/seeker/profile` | โปรไฟล์ย่อรายวัน / โปรไฟล์เต็ม + อัปโหลดเรซูเม่ PDF |
| ประวัติการสมัครงาน | `/th/seeker/applications` | ตารางสถานะการสมัคร |
| งานที่บันทึก | `/th/seeker/bookmarks` | งานที่บุ๊กมาร์ก |
| Dashboard นายจ้าง | `/th/employer/dashboard` | สถิติผู้สมัครงาน + ยอดดู |
| ประกาศงานนายจ้าง | `/th/employer/jobs` | รายการประกาศงานทั้งหมด |
| ลงประกาศงานใหม่ | `/th/employer/jobs/new` | ฟอร์มลงประกาศงานฟรี |
| ดูรายชื่อผู้สมัคร | `/th/employer/jobs/[id]/applicants` | ตาราง List View จัดการสถานะผู้สมัคร |
| Dashboard แอดมิน | `/th/admin/dashboard` | ภาพรวมระบบ |
| จัดการประกาศงาน | `/th/admin/jobs` | อนุมัติ / ปฏิเสธ / งานเด่น ⭐ |
| จัดการผู้ใช้ | `/th/admin/users` | สลับสิทธิ์ Role สมาชิก |
| จัดการโฆษณา 15 ช่อง | `/th/admin/ads` | อัปโหลดแบนเนอร์, ลิงก์ร้านค้า, วันหมดอายุ |
| จัดการหมวดหมู่ | `/th/admin/categories` | เพิ่ม/ลบ หมวดหมู่งาน และ 13 อำเภอพิจิตร |

---

## 🛠️ วิธี Run ในเครื่องตัวเอง
```bash
cd ~/Desktop/jobphichit
npm run dev
# เปิดที่ http://localhost:3000/th
```
