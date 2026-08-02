'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Upload, Plus, X, Save, User, Briefcase, FileText, Bookmark } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, JobSeekerProfile } from '@/types';

const DISTRICTS = ['เมืองพิจิตร','กงไกรลาศ','โพธิ์ประทับช้าง','ตะพานหิน','บางมูลนาก','โพทะเล','สามง่าม','ทับคล้อ','สากเหล็ก','วังทรายพูน','บึงนาราง','ดงเจริญ'];

export default function SeekerProfilePage() {
  const locale = useLocale();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [seekerProfile, setSeekerProfile] = useState<Partial<JobSeekerProfile>>({});
  const [skills, setSkills] = useState<string[]>([]);
  const [workDistricts, setWorkDistricts] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = `/${locale}/auth/login`; return; }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);
      const { data: sp } = await supabase.from('job_seeker_profiles').select('*').eq('user_id', user.id).single();
      if (sp) { setSeekerProfile(sp); setSkills(sp.skills || []); setWorkDistricts(sp.work_districts || []); }
      setLoading(false);
    };
    load();
  }, []);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (s: string) => setSkills(skills.filter(x => x !== s));

  const toggleDistrict = (d: string) => {
    setWorkDistricts(workDistricts.includes(d)
      ? workDistricts.filter(x => x !== d)
      : [...workDistricts, d]);
  };

  const uploadResume = async (file: File) => {
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const path = `${user.id}/resume.pdf`;
    const { data, error } = await supabase.storage.from('resumes').upload(path, file, { upsert: true });
    if (!error) {
      const url = supabase.storage.from('resumes').getPublicUrl(path).data.publicUrl;
      setSeekerProfile(prev => ({ ...prev, resume_url: url }));
    }
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update profile
    await supabase.from('profiles').update({ full_name: profile?.full_name, phone: profile?.phone }).eq('id', user.id);

    // Upsert seeker profile
    const { error: err } = await supabase.from('job_seeker_profiles').upsert({
      user_id: user.id,
      ...seekerProfile,
      skills,
      work_districts: workDistricts,
    });

    if (err) setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    else setSuccess('บันทึกโปรไฟล์สำเร็จ!');
    setSaving(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const navLinks = [
    { href: `/${locale}/seeker/dashboard`, label: '📊 ภาพรวม' },
    { href: `/${locale}/seeker/profile`, label: '👤 โปรไฟล์ของฉัน', active: true },
    { href: `/${locale}/seeker/applications`, label: '📋 ประวัติการสมัคร' },
    { href: `/${locale}/seeker/bookmarks`, label: '🔖 งานที่บันทึก' },
    { href: `/${locale}/jobs`, label: '🔍 หางาน' },
  ];

  if (loading) return <div className="loading-wrapper"><div className="spinner"></div></div>;

  return (
    <div className="page-wrapper">
      <div style={{ position: 'sticky', top: 0, zIndex: 200, background: 'white', borderBottom: '1px solid var(--color-gray-200)' }}>
        <div className="container" style={{ height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={`/${locale}`} style={{ fontWeight: 800, fontSize: '18px', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🌿 JobPhichit
          </Link>
          <Link href={`/${locale}/auth/login`} onClick={async () => { await supabase.auth.signOut(); }} className="btn btn-ghost btn-sm">
            ออกจากระบบ
          </Link>
        </div>
      </div>

      <main className="main-content">
        <div className="dashboard-layout">
          <aside className="dashboard-sidebar">
            <ul className="dashboard-nav" style={{ paddingTop: '8px' }}>
              {navLinks.map(({ href, label, active }) => (
                <li key={href}><Link href={href} className={`dashboard-nav-link ${active ? 'active' : ''}`}>{label}</Link></li>
              ))}
            </ul>
          </aside>

          <div className="dashboard-main">
            <div className="dashboard-header">
              <h1 className="dashboard-title">👤 โปรไฟล์ของฉัน</h1>
            </div>

            {success && <div className="alert alert-success" style={{ marginBottom: '16px' }}>✅ {success}</div>}
            {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>❌ {error}</div>}

            {/* Profile Type */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <div className="card-header"><h2 style={{ fontWeight: 700, fontSize: '15px' }}>ประเภทโปรไฟล์</h2></div>
              <div className="card-body">
                <div className="role-selector">
                  {[
                    { value: 'daily', label: '🌾 โปรไฟล์ย่อ (รับจ้างรายวัน)', desc: 'ไม่ต้องอัปโหลดเรซูเม่' },
                    { value: 'fulltime', label: '💼 โปรไฟล์เต็ม (งานประจำ)', desc: 'อัปโหลดเรซูเม่ + ประวัติ' },
                  ].map(({ value, label, desc }) => (
                    <div key={value}
                      className={`role-option ${seekerProfile.seeker_type === value ? 'selected' : ''}`}
                      onClick={() => setSeekerProfile(prev => ({ ...prev, seeker_type: value as any }))}>
                      <div style={{ fontSize: '24px' }}>{value === 'daily' ? '🌾' : '💼'}</div>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{value === 'daily' ? 'รับจ้างรายวัน' : 'งานประจำ'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <div className="card-header"><h2 style={{ fontWeight: 700, fontSize: '15px' }}>ข้อมูลส่วนตัว</h2></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">ชื่อ-นามสกุล</label>
                    <input type="text" className="form-control" value={profile?.full_name || ''}
                      onChange={e => setProfile(p => p ? { ...p, full_name: e.target.value } : p)} id="profile-name" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">เบอร์โทรศัพท์</label>
                    <input type="tel" className="form-control" value={profile?.phone || ''}
                      onChange={e => setProfile(p => p ? { ...p, phone: e.target.value } : p)} id="profile-phone" />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '16px', marginBottom: 0 }}>
                  <label className="form-label">แนะนำตัว</label>
                  <textarea className="form-control" rows={3}
                    value={seekerProfile.bio || ''}
                    onChange={e => setSeekerProfile(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="แนะนำตัวเองสั้นๆ ทักษะพิเศษ หรือสิ่งที่คุณทำได้ดี..." id="profile-bio" />
                </div>
              </div>
            </div>

            {/* Resume Upload (Full Profile Only) */}
            {seekerProfile.seeker_type === 'fulltime' && (
              <div className="card" style={{ marginBottom: '16px' }}>
                <div className="card-header"><h2 style={{ fontWeight: 700, fontSize: '15px' }}>📄 เรซูเม่ (PDF)</h2></div>
                <div className="card-body">
                  {seekerProfile.resume_url ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--color-primary-50)', borderRadius: '8px', marginBottom: '12px' }}>
                      <FileText size={20} color="var(--color-primary-500)" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>เรซูเม่ของคุณ</div>
                        <a href={seekerProfile.resume_url} target="_blank" rel="noopener" style={{ fontSize: '12px', color: 'var(--color-primary-600)' }}>คลิกเพื่อดู</a>
                      </div>
                      <button onClick={() => setSeekerProfile(prev => ({ ...prev, resume_url: undefined }))} className="btn btn-ghost btn-sm">
                        <X size={14} /> ลบ
                      </button>
                    </div>
                  ) : null}
                  <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
                    onChange={e => e.target.files?.[0] && uploadResume(e.target.files[0])} id="resume-upload" />
                  <button onClick={() => fileRef.current?.click()} className="btn btn-secondary" disabled={uploading}>
                    <Upload size={16} /> {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดเรซูเม่ PDF'}
                  </button>
                  <div className="form-hint">ไฟล์ PDF ขนาดไม่เกิน 5MB</div>
                </div>
              </div>
            )}

            {/* Skills */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <div className="card-header"><h2 style={{ fontWeight: 700, fontSize: '15px' }}>🛠️ ทักษะ / ความสามารถ</h2></div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input type="text" className="form-control" placeholder="เพิ่มทักษะ เช่น ตัดหญ้า, ขับรถ, ทำอาหาร..."
                    value={newSkill} onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} id="skill-input" />
                  <button onClick={addSkill} className="btn btn-primary" id="add-skill-btn"><Plus size={16} /></button>
                </div>
                <div className="skills-container">
                  {skills.map(s => (
                    <div key={s} className="skill-tag">
                      {s}
                      <span className="skill-tag-remove" onClick={() => removeSkill(s)}>
                        <X size={10} />
                      </span>
                    </div>
                  ))}
                  {skills.length === 0 && <span style={{ fontSize: '13px', color: 'var(--color-gray-400)' }}>ยังไม่มีทักษะ</span>}
                </div>
              </div>
            </div>

            {/* Work Districts */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <div className="card-header"><h2 style={{ fontWeight: 700, fontSize: '15px' }}>📍 พื้นที่รับงาน (เลือกได้หลายอำเภอ)</h2></div>
              <div className="card-body">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {DISTRICTS.map(d => (
                    <button key={d}
                      onClick={() => toggleDistrict(d)}
                      className={`badge ${workDistricts.includes(d) ? 'badge-green' : 'badge-gray'}`}
                      style={{ cursor: 'pointer', padding: '6px 14px', fontSize: '13px', border: 'none' }}
                    >
                      {workDistricts.includes(d) ? '✓ ' : ''}{d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Expected Salary */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-header"><h2 style={{ fontWeight: 700, fontSize: '15px' }}>💰 ค่าตอบแทนที่คาดหวัง</h2></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">ขั้นต่ำ (บาท)</label>
                    <input type="number" className="form-control" placeholder="เช่น 15000"
                      value={seekerProfile.expected_salary_min || ''}
                      onChange={e => setSeekerProfile(prev => ({ ...prev, expected_salary_min: parseInt(e.target.value) || undefined }))} id="salary-min" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">สูงสุด (บาท)</label>
                    <input type="number" className="form-control" placeholder="เช่น 25000"
                      value={seekerProfile.expected_salary_max || ''}
                      onChange={e => setSeekerProfile(prev => ({ ...prev, expected_salary_max: parseInt(e.target.value) || undefined }))} id="salary-max" />
                  </div>
                </div>
              </div>
            </div>

            <button onClick={save} className="btn btn-primary btn-lg" disabled={saving} id="save-profile-btn">
              <Save size={18} /> {saving ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
