# 🌿 JobPhichit.com — คู่มือ Deploy

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
├── .env.local                ← Environment variables (ห้าม push ขึ้น Git!)
└── next.config.mjs
```

## ขั้นตอน Deploy บน Vercel

### 1. Push ขึ้น GitHub
```bash
cd /Users/chanatipk/.gemini/antigravity/scratch/jobphichit
git init
git add .
git commit -m "🌿 Initial JobPhichit.com"
git remote add origin https://github.com/YOUR_USERNAME/jobphichit.git
git push -u origin main
```

### 2. Deploy บน Vercel
1. ไปที่ **vercel.com** → Login → **Add New Project**
2. Import GitHub Repository: `jobphichit`
3. ที่ **Environment Variables** ใส่ค่าเหล่านี้:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://lzumsiptvnzwbyemhkau.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_vKmk4sgILk9otNwjArKYcg_jrz40K83
   SUPABASE_SERVICE_ROLE_KEY = [ค่า service_role จาก Supabase Settings]
   NEXT_PUBLIC_SITE_URL = https://jobphichit.com
   NEXT_PUBLIC_CONTACT_LINE = chanatipfew
   ```
4. กด **Deploy** → รอ 2-3 นาที → ได้ URL `jobphichit.vercel.app`

### 3. ผูกโดเมน
1. ใน Vercel → **Settings → Domains → Add Domain**
2. ใส่ `jobphichit.com`
3. ที่ Cloudflare/Namecheap → ตั้ง DNS ตามที่ Vercel บอก:
   - Type: `A`, Name: `@`, Value: `76.76.21.21`
   - Type: `CNAME`, Name: `www`, Value: `cname.vercel-dns.com`
4. รอ 24-48 ชั่วโมง

### 4. ตั้งค่า Admin Account
หลัง Deploy แล้ว ต้องตั้ง role=admin ให้ตัวเอง:
1. ไปที่ **Supabase → SQL Editor**
2. Run:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@gmail.com');
```
3. Login เว็บแล้วไปที่ `/th/admin/dashboard`

### 5. อัปเดต Facebook OAuth Redirect URI
หลังได้โดเมนจริง ไปอัปเดตที่ Facebook Developers:
```
Valid OAuth Redirect URIs:
https://lzumsiptvnzwbyemhkau.supabase.co/auth/v1/callback
```
และที่ Supabase → Authentication → URL Configuration:
```
Site URL: https://jobphichit.com
Redirect URLs: https://jobphichit.com/**
```

## 🛠️ Run ในเครื่องตัวเอง
```bash
cd /Users/chanatipk/.gemini/antigravity/scratch/jobphichit
npm run dev
# เปิดที่ http://localhost:3000/th
```

## 📁 หน้าที่มีอยู่แล้ว
| หน้า | URL |
|------|-----|
| หน้าหลัก | `/th` |
| ค้นหางาน | `/th/jobs` |
| เข้าสู่ระบบ | `/th/auth/login` |
| สมัครสมาชิก | `/th/auth/register` |
| นโยบายความเป็นส่วนตัว | `/th/privacy` |
| Admin Dashboard | `/th/admin/dashboard` |

## 🔮 หน้าที่ยังต้องสร้างต่อ
- `/th/job/[id]` — รายละเอียดงาน
- `/th/seeker/dashboard` — Dashboard ผู้หางาน
- `/th/employer/dashboard` — Dashboard นายจ้าง
- `/th/admin/ads` — จัดการโฆษณา 15 ช่อง
- `/th/admin/jobs` — อนุมัติ/ปฏิเสธประกาศงาน
- `/th/terms` — ข้อกำหนดการใช้งาน
