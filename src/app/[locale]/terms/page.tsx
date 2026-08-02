import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/layout/CookieBanner';

export default async function TermsPage() {
  const locale = await getLocale();
  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <div style={{ background: 'linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))', padding: '40px 0', color: 'white' }}>
          <div className="container">
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>📄 ข้อกำหนดการใช้งาน</h1>
            <p style={{ opacity: 0.85, marginTop: '8px' }}>Terms of Service — JobPhichit.com</p>
          </div>
        </div>
        <div className="section">
          <div className="container-sm">
            <div className="card">
              <div className="card-body" style={{ lineHeight: 1.8, color: 'var(--color-gray-700)' }}>
                <p style={{ fontSize: '13px', color: 'var(--color-gray-400)', marginBottom: '24px' }}>
                  อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                <div className="alert alert-warning" style={{ marginBottom: '24px' }}>
                  ⚠️ <strong>ข้อจำกัดความรับผิดชอบที่สำคัญ:</strong> JobPhichit.com เป็นเพียงสื่อกลางระหว่างผู้หางานและนายจ้าง เว็บไซต์ไม่มีส่วนรับผิดชอบต่อข้อตกลง ข้อพิพาท หรือความเสียหายใดๆ ที่เกิดขึ้นระหว่างนายจ้างและลูกจ้าง
                </div>

                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '12px' }}>1. การยอมรับข้อกำหนด</h2>
                <p style={{ marginBottom: '16px' }}>การใช้งานเว็บไซต์ JobPhichit.com ถือว่าคุณยอมรับข้อกำหนดและเงื่อนไขทั้งหมดที่ระบุในเอกสารนี้ หากไม่ยอมรับ กรุณาหยุดใช้งานเว็บไซต์</p>

                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '12px' }}>2. บทบาทของ JobPhichit</h2>
                <p style={{ marginBottom: '8px' }}>JobPhichit.com ทำหน้าที่เป็นแพลตฟอร์มกลางในการเผยแพร่ประกาศงานเท่านั้น โดย:</p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li style={{ marginBottom: '6px' }}>ไม่รับผิดชอบต่อความถูกต้องของข้อมูลในประกาศงาน</li>
                  <li style={{ marginBottom: '6px' }}>ไม่รับผิดชอบต่อกระบวนการจ้างงาน การสัมภาษณ์ หรือการจ่ายค่าจ้าง</li>
                  <li style={{ marginBottom: '6px' }}>ไม่รับประกันว่าผู้สมัครจะได้รับการว่าจ้าง</li>
                  <li style={{ marginBottom: '6px' }}>ไม่รับผิดชอบต่อการหลอกลวงที่อาจเกิดขึ้น</li>
                </ul>

                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '12px' }}>3. หน้าที่ของผู้ใช้งาน</h2>
                <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>สำหรับนายจ้าง:</h3>
                <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
                  <li style={{ marginBottom: '6px' }}>ต้องให้ข้อมูลที่เป็นความจริงและถูกต้องในประกาศงาน</li>
                  <li style={{ marginBottom: '6px' }}>ห้ามเรียกเก็บเงินจากผู้สมัครในทุกกรณี</li>
                  <li style={{ marginBottom: '6px' }}>ต้องปฏิบัติตามกฎหมายแรงงานของประเทศไทย</li>
                  <li style={{ marginBottom: '6px' }}>ห้ามลงประกาศงานที่ผิดกฎหมายหรือมีเนื้อหาไม่เหมาะสม</li>
                </ul>
                <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>สำหรับผู้หางาน:</h3>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li style={{ marginBottom: '6px' }}>ต้องให้ข้อมูลที่เป็นความจริงในโปรไฟล์และเรซูเม่</li>
                  <li style={{ marginBottom: '6px' }}>ต้องตรวจสอบความน่าเชื่อถือของนายจ้างก่อนสมัครงาน</li>
                  <li style={{ marginBottom: '6px' }}>ห้ามส่งข้อมูลส่วนตัวทางการเงินให้แก่นายจ้างที่น่าสงสัย</li>
                </ul>

                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '12px' }}>4. เนื้อหาต้องห้าม</h2>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li style={{ marginBottom: '6px' }}>ประกาศงานที่เกี่ยวข้องกับกิจกรรมผิดกฎหมาย</li>
                  <li style={{ marginBottom: '6px' }}>เนื้อหาที่เป็นการหลอกลวงหรือฉ้อโกง</li>
                  <li style={{ marginBottom: '6px' }}>เนื้อหาลามก อนาจาร หรือไม่เหมาะสม</li>
                  <li style={{ marginBottom: '6px' }}>สแปมหรือการโฆษณาที่ไม่เกี่ยวข้อง</li>
                </ul>

                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '12px' }}>5. พื้นที่โฆษณา</h2>
                <p style={{ marginBottom: '16px' }}>JobPhichit.com มีพื้นที่โฆษณา 15 ช่องสำหรับธุรกิจในพิจิตร เนื้อหาโฆษณาต้องถูกกฎหมายและเหมาะสม ทางเว็บไซต์ขอสงวนสิทธิ์ในการปฏิเสธโฆษณาที่ไม่เหมาะสม</p>

                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '12px' }}>6. การยกเลิกบัญชี</h2>
                <p style={{ marginBottom: '16px' }}>ทางเว็บไซต์ขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีที่ละเมิดข้อกำหนดการใช้งาน โดยไม่ต้องแจ้งล่วงหน้า</p>

                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '12px' }}>7. กฎหมายที่ใช้บังคับ</h2>
                <p style={{ marginBottom: '16px' }}>ข้อพิพาทใดๆ ที่เกี่ยวข้องกับการใช้งานเว็บไซต์นี้ให้อยู่ภายใต้กฎหมายไทย</p>

                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '12px' }}>8. ติดต่อ</h2>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Line: <strong>chanatipfew</strong></li>
                  <li>เว็บไซต์: <strong>jobphichit.com</strong></li>
                </ul>
              </div>
            </div>
            <div style={{ marginTop: '24px', textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link href={`/${locale}/privacy`} className="btn btn-secondary">🔒 นโยบายความเป็นส่วนตัว</Link>
              <Link href={`/${locale}`} className="btn btn-secondary">← หน้าหลัก</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
