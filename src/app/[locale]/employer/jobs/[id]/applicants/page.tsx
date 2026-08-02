import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, FileText, Check, X, Clock, MapPin, Award } from 'lucide-react';
import Header from '@/components/layout/Header';
import ApplicantStatusBtn from './ApplicantStatusBtn';

export default async function JobApplicantsPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const { data: job } = await supabase.from('job_posts').select('*').eq('id', id).single();
  if (!job || job.employer_id !== user.id) notFound();

  const { data: applicants } = await supabase
    .from('applications')
    .select(`*, profiles!seeker_id(*), job_seeker_profiles!seeker_id(*)`)
    .eq('job_id', id)
    .order('applied_at', { ascending: false });

  const navLinks = [
    { href: `/${locale}/employer/dashboard`, label: '📊 ภาพรวม' },
    { href: `/${locale}/employer/jobs`, label: '💼 จัดการประกาศงาน' },
    { href: `/${locale}/employer/jobs/new`, label: '➕ ลงประกาศงานใหม่' },
  ];

  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <div className="dashboard-layout">
          <aside className="dashboard-sidebar">
            <ul className="dashboard-nav" style={{ paddingTop: '8px' }}>
              {navLinks.map(({ href, label }) => (
                <li key={href}><Link href={href} className="dashboard-nav-link">{label}</Link></li>
              ))}
            </ul>
          </aside>

          <div className="dashboard-main">
            <div style={{ marginBottom: '16px' }}>
              <Link href={`/${locale}/employer/jobs`} style={{ color: 'var(--color-gray-500)', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeft size={16} /> กลับไปหน้ารายการประกาศงาน
              </Link>
            </div>

            <div className="dashboard-header">
              <h1 className="dashboard-title">👥 ผู้สมัครงาน: {job.title}</h1>
              <p className="dashboard-subtitle">ทั้งหมด {applicants?.length || 0} คน (แสดงผลแบบ List View ตาราง)</p>
            </div>

            {applicants && applicants.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {applicants.map((app) => {
                  const prof = app.profiles as any;
                  const seekerProf = app.job_seeker_profiles as any;
                  const isDaily = seekerProf?.seeker_type === 'daily';

                  return (
                    <div key={app.id} className="card" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        {/* Seeker Header */}
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <div className="avatar avatar-lg">
                            {prof?.full_name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-gray-900)' }}>{prof?.full_name || 'ผู้หางาน'}</h3>
                              <span className={`badge ${isDaily ? 'badge-daily' : 'badge-fulltime'}`}>
                                {isDaily ? '🌾 รับจ้างรายวัน (โปรไฟล์ย่อ)' : '💼 ทั่วไป'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '13px', color: 'var(--color-gray-600)' }}>
                              {prof?.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {prof.phone}</span>}
                              {prof?.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {prof.email}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Status Control */}
                        <ApplicantStatusBtn appId={app.id} initialStatus={app.status} />
                      </div>

                      {/* Bio / Cover Letter */}
                      {(app.cover_letter || seekerProf?.bio) && (
                        <div style={{ marginTop: '16px', padding: '12px', background: 'var(--color-gray-50)', borderRadius: '8px', fontSize: '14px', lineHeight: 1.6, color: 'var(--color-gray-700)' }}>
                          <strong>💬 ข้อความ / บทแนะนำตัว:</strong>
                          <p style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>{app.cover_letter || seekerProf?.bio}</p>
                        </div>
                      )}

                      {/* Skills & Districts */}
                      <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                        {seekerProf?.skills && seekerProf.skills.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Award size={14} color="var(--color-gray-400)" />
                            {seekerProf.skills.map((s: string) => (
                              <span key={s} className="skill-tag">{s}</span>
                            ))}
                          </div>
                        )}
                        {seekerProf?.work_districts && seekerProf.work_districts.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <MapPin size={14} color="var(--color-gray-400)" />
                            {seekerProf.work_districts.map((d: string) => (
                              <span key={d} className="badge badge-gray">{d}</span>
                            ))}
                          </div>
                        )}
                        {seekerProf?.resume_url && (
                          <a href={seekerProf.resume_url} target="_blank" rel="noopener" className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
                            <FileText size={14} /> ดูเรซูเม่ PDF
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <h3 className="empty-state-title">ยังไม่มีผู้สมัครงานในตำแหน่งนี้</h3>
                <p className="empty-state-desc">เมื่อมีคนสนใจสมัครงาน ข้อมูลจะปรากฏขึ้นที่นี่ทันที</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
