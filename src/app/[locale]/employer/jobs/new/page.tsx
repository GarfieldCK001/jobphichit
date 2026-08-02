'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Send, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';

export default function NewJobPage() {
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);

  const [title, setTitle] = useState('');
  const [jobType, setJobType] = useState('fulltime');
  const [categoryId, setCategoryId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [salaryType, setSalaryType] = useState('monthly');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryDisplay, setSalaryDisplay] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCats = async () => {
      const { data: catData } = await supabase.from('categories').select('*').eq('type', 'job_category').order('sort_order');
      const { data: distData } = await supabase.from('categories').select('*').eq('type', 'district').order('sort_order');
      setCategories(catData || []);
      setDistricts(distData || []);
      if (catData?.[0]) setCategoryId(catData[0].id);
      if (distData?.[0]) setDistrictId(distData[0].id);
    };
    fetchCats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    setSubmitting(true);

    // Make sure profile is employer
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (prof?.role !== 'employer') {
      await supabase.from('profiles').update({ role: 'employer' }).eq('id', user.id);
    }

    // Ensure employer_profile exists
    const { data: empProf } = await supabase.from('employer_profiles').select('id').eq('user_id', user.id).single();
    if (!empProf) {
      await supabase.from('employer_profiles').insert({ user_id: user.id, company_name: user.email?.split('@')[0] || 'นายจ้าง' });
    }

    const { data, error: err } = await supabase.from('job_posts').insert({
      employer_id: user.id,
      title,
      job_type: jobType,
      job_category_id: categoryId,
      district_id: districtId,
      salary_type: salaryType,
      salary_min: salaryMin ? parseInt(salaryMin) : null,
      salary_max: salaryMax ? parseInt(salaryMax) : null,
      salary_display: salaryDisplay || null,
      description,
      requirements: requirements || null,
      benefits: benefits || null,
      contact_info: contactInfo || null,
      status: 'pending', // Pending admin approval
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    }).select().single();

    if (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการลงประกาศงาน');
      setSubmitting(false);
    } else {
      router.push(`/${locale}/employer/jobs?success=1`);
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content" style={{ background: 'var(--color-gray-50)', padding: '32px 0' }}>
        <div className="container-sm">
          <div style={{ marginBottom: '16px' }}>
            <Link href={`/${locale}/employer/dashboard`} style={{ color: 'var(--color-gray-500)', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={16} /> กลับไปยังแผงควบคุม
            </Link>
          </div>

          <div className="card">
            <div className="card-header" style={{ background: 'white' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-gray-900)' }}>
                ➕ ลงประกาศรับสมัครงานฟรี
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--color-gray-500)' }}>
                ประกาศงานจะเปิดแสดงผลทันทีหลังการตรวจสอบระบบสแกนความปลอดภัย
              </p>
            </div>

            <div className="card-body">
              {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>❌ {error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label required">ชื่อตำแหน่งงาน</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="เช่น ช่างตัดหญ้า, แม่บ้านประจำร้าน, พนักงานบัญชี..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    id="new-job-title"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label required">ประเภทงาน</label>
                    <select
                      className="form-control"
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      required
                      id="new-job-type"
                    >
                      <option value="fulltime">💼 งานประจำ</option>
                      <option value="parttime">⏰ พาร์ทไทม์</option>
                      <option value="daily">🌾 รับจ้างรายวัน</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">อำเภอที่ตั้งงาน</label>
                    <select
                      className="form-control"
                      value={districtId}
                      onChange={(e) => setDistrictId(e.target.value)}
                      required
                      id="new-job-district"
                    >
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>{d.name_th}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">หมวดหมู่งาน</label>
                  <select
                    className="form-control"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    id="new-job-category"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name_th}</option>
                    ))}
                  </select>
                </div>

                {/* Salary Section */}
                <div style={{ background: 'var(--color-gray-50)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--color-gray-200)' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>💵 ค่าตอบแทน / เงินเดือน</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <span className="form-hint">รูปแบบ</span>
                      <select className="form-control" value={salaryType} onChange={(e) => setSalaryType(e.target.value)}>
                        <option value="monthly">บาท / เดือน</option>
                        <option value="daily">บาท / วัน</option>
                        <option value="per_piece">บาท / ชิ้นงาน</option>
                        <option value="negotiable">ตกลงกันได้</option>
                      </select>
                    </div>
                    <div>
                      <span className="form-hint">ขั้นต่ำ (บาท)</span>
                      <input type="number" className="form-control" placeholder="เช่น 350" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
                    </div>
                    <div>
                      <span className="form-hint">สูงสุด (บาท)</span>
                      <input type="number" className="form-control" placeholder="เช่น 500" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <span className="form-hint">หรือระบุข้อความสั้นๆ (เช่น "350-500 บาท/วัน ตามตกลง")</span>
                    <input type="text" className="form-control" placeholder="ข้อความแสดงผลค่าตอบแทน..." value={salaryDisplay} onChange={(e) => setSalaryDisplay(e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">รายละเอียดงาน</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    placeholder="ระบุหน้าที่ความรับผิดชอบ ลักษณะงาน เวลาทำงาน..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    id="new-job-desc"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">คุณสมบัติผู้สมัคร</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="เช่น เพศชาย/หญิง อายุ 20 ขึ้นไป ไม่จำกัดวุฒิ มีประสบการณ์จะพิจารณาเป็นพิเศษ..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    id="new-job-reqs"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ข้อมูลติดต่อเพิ่มเติม / Line / โทรศัพท์</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="เช่น โทร 081-xxxxxxx หรือ Line: id_line"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    id="new-job-contact"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">วันปิดรับสมัคร (ไม่ระบุ = ไม่มีกำหนด)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    id="new-job-expires"
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting} id="submit-new-job-btn">
                  <Send size={18} /> {submitting ? 'กำลังลงประกาศ...' : 'ส่งประกาศงาน (ส่งพิจารณา)'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
