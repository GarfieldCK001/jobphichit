import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { Plus, Briefcase, Users, Eye, Clock, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';

export default async function EmployerDashboard() {
  const supabase = await createClient();
  const locale = await getLocale();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (profile?.role === 'admin') redirect(`/${locale}/admin/dashboard`);
  if (profile?.role === 'job_seeker') redirect(`/${locale}/seeker/dashboard`);

  const { data: employerProfile } = await supabase.from('employer_profiles').select('*').eq('user_id', user.id).single();

  // Employer stats
  const { data: myJobs, count: totalJobs } = await supabase
    .from('job_posts')
    .select('*', { count: 'exact' })
    .eq('employer_id', user.id)
    .order('created_at', { ascending: false });

  const activeJobs = myJobs?.filter(j => j.status === 'active').length || 0;
  const pendingJobs = myJobs?.filter(j => j.status === 'pending').length || 0;
  const totalViews = myJobs?.reduce((acc, j) => acc + (j.views_count || 0), 0) || 0;
  const totalApps = myJobs?.reduce((acc, j) => acc + (j.application_count || 0), 0) || 0;

  // Recent Applicants across all active jobs
  const myJobIds = myJobs?.map(j => j.id) || [];
  let recentApplicants: any[] = [];
  if (myJobIds.length > 0) {
    const { data: apps } = await supabase
      .from('applications')
      .select(`*, job_seeker_profiles!seeker_id(*), profiles!seeker_id(*), job_posts!job_id(*)`)
      .in('job_id', myJobIds)
      .order('applied_at', { ascending: false })
      .limit(5);
    recentApplicants = apps || [];
  }

  const navLinks = [
    { href: `/${locale}/employer/dashboard`, label: '📊 ภาพรวม', active: true },
    { href: `/${locale}/employer/jobs`, label: '💼 จัดการประกาศงาน' },
    { href: `/${locale}/employer/jobs/new`, label: '➕ ลงประกาศงานใหม่' },
  ];

  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <div className="dashboard-layout">
          <aside className="dashboard-sidebar">
            <div style={{ padding: '16px', borderBottom: '1px solid var(--color-gray-100)' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-primary-700)' }}>
                {employerProfile?.company_name || profile?.full_name || 'นายจ้าง'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>{user.email}</div>
            </div>
            <ul className="dashboard-nav" style={{ paddingTop: '8px' }}>
              {navLinks.map(({ href, label, active }) => (
                <li key={href}><Link href={href} className={`dashboard-nav-link ${active ? 'active' : ''}`}>{label}</Link></li>
              ))}
            </ul>
          </aside>

          <div className="dashboard-main">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 className="dashboard-title">🏢 แผงควบคุมนายจ้าง</h1>
                <p className="dashboard-subtitle">จัดการประกาศงานและดูรายชื่อผู้สมัคร</p>
              </div>
              <Link href={`/${locale}/employer/jobs/new`} className="btn btn-primary">
                <Plus size={16} /> ลงประกาศงานใหม่
              </Link>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              {[
                { icon: '💼', label: 'ประกาศเปิดอยู่', value: activeJobs, color: '#d1fae5', iconColor: '#065f46' },
                { icon: '⏳', label: 'รออนุมัติ', value: pendingJobs, color: '#fef3c7', iconColor: '#d97706' },
                { icon: '👥', label: 'ผู้สมัครรวม', value: totalApps, color: '#dbeafe', iconColor: '#1d4ed8' },
                { icon: '👁️', label: 'เข้าดูทั้งหมด', value: totalViews, color: '#ede9fe', iconColor: '#7c3aed' },
              ].map(({ icon, label, value, color, iconColor }) => (
                <div key={label} className="stat-card">
                  <div className="stat-card-icon" style={{ background: color }}>
                    <span style={{ fontSize: '20px' }}>{icon}</span>
                  </div>
                  <div className="stat-card-value" style={{ color: iconColor }}>{value}</div>
                  <div className="stat-card-label">{label}</div>
                </div>
              ))}
            </div>

            {/* Recent Applicants */}
            <div className="table-wrapper" style={{ marginBottom: '24px' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontWeight: 700, fontSize: '16px' }}>👥 ผู้สมัครล่าสุด (ตารางแบบ List View)</h2>
                <Link href={`/${locale}/employer/jobs`} className="btn btn-secondary btn-sm">ดูงานทั้งหมด</Link>
              </div>
              {recentApplicants.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>ชื่อผู้สมัคร</th>
                      <th>ตำแหน่งงาน</th>
                      <th>ประเภทโปรไฟล์</th>
                      <th>วันที่สมัคร</th>
                      <th>สถานะ</th>
                      <th>การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplicants.map((app) => (
                      <tr key={app.id}>
                        <td style={{ fontWeight: 600 }}>{app.profiles?.full_name || 'ผู้สมัคร'}</td>
                        <td style={{ color: 'var(--color-gray-600)' }}>{app.job_posts?.title}</td>
                        <td>
                          <span className={`badge ${app.job_seeker_profiles?.seeker_type === 'daily' ? 'badge-daily' : 'badge-fulltime'}`}>
                            {app.job_seeker_profiles?.seeker_type === 'daily' ? '🌾 รายวัน' : '💼 ทั่วไป'}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>
                          {new Date(app.applied_at).toLocaleDateString('th-TH')}
                        </td>
                        <td>
                          <span className={`badge status-${app.status}`}>
                            {app.status === 'applied' ? 'รอพิจารณา' : app.status === 'reviewing' ? 'กำลังตรวจ' : app.status === 'interview' ? 'นัดสัมภาษณ์' : app.status === 'hired' ? 'รับทำงาน' : 'ไม่ผ่าน'}
                          </span>
                        </td>
                        <td>
                          <Link href={`/${locale}/employer/jobs/${app.job_id}/applicants`} className="btn btn-secondary btn-sm">
                            ดูข้อมูล
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state" style={{ padding: '32px' }}>
                  <p style={{ color: 'var(--color-gray-400)' }}>ยังไม่มีผู้สมัครงานเข้ามา</p>
                </div>
              )}
            </div>

            {/* My Active Jobs Quick Table */}
            <div className="table-wrapper">
              <div className="card-header">
                <h2 style={{ fontWeight: 700, fontSize: '16px' }}>💼 รายการประกาศงานของคุณ</h2>
              </div>
              {myJobs && myJobs.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>หัวข้อ</th>
                      <th>ประเภท</th>
                      <th>ยอดดู</th>
                      <th>ผู้สมัคร</th>
                      <th>สถานะ</th>
                      <th>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myJobs.slice(0, 5).map((job) => (
                      <tr key={job.id}>
                        <td style={{ fontWeight: 600 }}>{job.title}</td>
                        <td>
                          <span className={`badge ${job.job_type === 'daily' ? 'badge-daily' : job.job_type === 'fulltime' ? 'badge-fulltime' : 'badge-parttime'}`}>
                            {job.job_type === 'daily' ? 'รายวัน' : job.job_type === 'fulltime' ? 'ประจำ' : 'พาร์ทไทม์'}
                          </span>
                        </td>
                        <td>{job.views_count} ครั้ง</td>
                        <td>{job.application_count} คน</td>
                        <td>
                          <span className={`badge ${job.status === 'active' ? 'badge-success' : job.status === 'pending' ? 'badge-pending' : 'badge-gray'}`}>
                            {job.status === 'active' ? 'ใช้งาน' : job.status === 'pending' ? 'รออนุมัติ' : 'ปิดแล้ว'}
                          </span>
                        </td>
                        <td>
                          <Link href={`/${locale}/employer/jobs/${job.id}/applicants`} className="btn btn-primary btn-sm">
                            ดูผู้สมัคร ({job.application_count})
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state" style={{ padding: '32px' }}>
                  <p className="empty-state-desc">คุณยังไม่ได้ลงประกาศงาน</p>
                  <Link href={`/${locale}/employer/jobs/new`} className="btn btn-primary">ลงประกาศงานแรกฟรี</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
