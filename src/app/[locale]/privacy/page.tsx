import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/layout/CookieBanner';

export default async function PrivacyPage() {
  const locale = await getLocale();
  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <div style={{ background: 'linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))', padding: '40px 0', color: 'white' }}>
          <div className="container">
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>🔒 นโยบายความเป็นส่วนตัว</h1>
            <p style={{ opacity: 0.85, marginTop: '8px' }}>Privacy Policy — JobPhichit.com</p>
          </div>
        </div>
        <div className="section">
          <div className="container-sm">
            <div className="card">
              <div className="card-body" style={{ lineHeight: 1.8, color: 'var(--color-gray-700)' }}>
                <p style={{ fontSize: '13px', color: 'var(--color-gray-400)', marginBottom: '24px' }}>
                  อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '12px' }}>1. ข้อมูลที่เราเก็บรวบรวม</h2>
                <p style={{ marginBottom: '16px' }}>เว็บไซต์ JobPhichit.com เก็บรวบรวมข้อมูลดังต่อไปนี้เพื่อให้บริการ:</p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li style={{ marginBottom: '8px' }}><strong>ข้อมูลส่วนตัว:</strong> ชื่อ-นามสกุล, อีเมล, เบอร์โทรศัพท์</li>
                  <li style={{ marginBottom: '8px' }}><strong>ข้อมูลโปรไฟล์:</strong> ประสบการณ์, ทักษะ, เรซูเม่</li>
                  <li style={{ marginBottom: '8px' }}><strong>ข้อมูลบริษัท:</strong> ชื่อบริษัท, ที่อยู่, เลขทะเบียนนิติบุคคล</li>
                  <li style={{ marginBottom: '8px' }}><strong>ข้อมูลการใช้งาน:</strong> หน้าที่เยี่ยมชม, การค้นหา, คุกกี้</li>
                </ul>

                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '12px' }}>2. วิธีที่เราใช้ข้อมูล</h2>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li style={{ marginBottom: '8px' }}>เพื่อให้บริการจับคู่ผู้หางานและนายจ้าง</li>
                  <li style={{ marginBottom: '8px' }}>เพื่อส่งการแจ้งเตือนเกี่ยวกับสถานะการสมัครงาน</li>
                  <li style={{ marginBottom: '8px' }}>เพื่อปรับปรุงประสบการณ์การใช้งานเว็บไซต์</li>
                  <li style={{ marginBottom: '8px' }}>เพื่อแสดงโฆษณาที่เกี่ยวข้องผ่าน Google AdSense</li>
                </ul>

                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '12px' }}>3. การแบ่งปันข้อมูล</h2>
                <p style={{ marginBottom: '16px' }}>เราไม่ขายหรือแบ่งปันข้อมูลส่วนตัวของคุณกับบุคคลที่สาม ยกเว้น:</p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li style={{ marginBottom: '8px' }}>เมื่อผู้หางานสมัครงาน ข้อมูลโปรไฟล์จะถูกแบ่งปันกับนายจ้างที่ประกาศงานนั้น</li>
                  <li style={{ marginBottom: '8px' }}>เมื่อกฎหมายกำหนดหรือมีคำสั่งศาล</li>
                  <li style={{ marginBottom: '8px' }}>บริการที่เราใช้: Supabase (ฐานข้อมูล), Vercel (hosting), Google Analytics</li>
                </ul>

                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '12px' }}>4. คุกกี้ (Cookies)</h2>
                <p style={{ marginBottom: '16px' }}>
                  เว็บไซต์ใช้คุกกี้เพื่อการยืนยันตัวตน และเพื่อวิเคราะห์การใช้งาน Google AdSense อาจใช้คุกกี้เพื่อแสดงโฆษณาที่เกี่ยวข้อง คุณสามารถปฏิเสธคุกกี้ได้ผ่านการตั้งค่าเบราว์เซอร์
                </p>

                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '12px' }}>5. สิทธิ์ของคุณ (PDPA)</h2>
                <p style={{ marginBottom: '16px' }}>ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 คุณมีสิทธิ์:</p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li style={{ marginBottom: '8px' }}>เข้าถึงและขอสำเนาข้อมูลส่วนตัวของคุณ</li>
                  <li style={{ marginBottom: '8px' }}>ขอแก้ไขข้อมูลที่ไม่ถูกต้อง</li>
                  <li style={{ marginBottom: '8px' }}>ขอลบข้อมูลส่วนตัว (Right to Erasure)</li>
                  <li style={{ marginBottom: '8px' }}>ถอนความยินยอมการประมวลผลข้อมูลได้ทุกเมื่อ</li>
                </ul>

                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '12px' }}>6. ความปลอดภัย</h2>
                <p style={{ marginBottom: '16px' }}>
                  เราใช้ HTTPS, Row Level Security บน Supabase และการเข้ารหัสข้อมูลมาตรฐานอุตสาหกรรมเพื่อปกป้องข้อมูลของคุณ
                </p>

                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '12px' }}>7. ติดต่อเรา</h2>
                <p style={{ marginBottom: '8px' }}>หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว ติดต่อได้ที่:</p>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Line: <strong>chanatipfew</strong></li>
                  <li>เว็บไซต์: <strong>jobphichit.com</strong></li>
                </ul>

                <div style={{ marginTop: '32px', padding: '16px', background: 'var(--color-primary-50)', borderRadius: '10px', borderLeft: '4px solid var(--color-primary-500)' }}>
                  <p style={{ fontSize: '13px', color: 'var(--color-gray-600)' }}>
                    ⚠️ <strong>ข้อจำกัดความรับผิดชอบ:</strong> JobPhichit.com เป็นเพียงสื่อกลางระหว่างผู้หางานและนายจ้างเท่านั้น ไม่มีส่วนเกี่ยวข้องกับข้อตกลงการจ้างงาน หรือความรับผิดชอบใดๆ ที่เกิดขึ้นระหว่างนายจ้างและลูกจ้าง
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <Link href={`/${locale}`} className="btn btn-secondary">← กลับหน้าหลัก</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
