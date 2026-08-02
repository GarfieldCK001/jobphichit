import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { Plus, Eye, Users, Calendar } from 'lucide-react';
import Header from '@/components/layout/Header';

export default async function EmployerJobsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const supabase = await createClient();
  const locale = await getLocale();
  const params = await searchParams;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const { data: jobs } = await supabase
    .from('job_posts')
    .select(`*, district:categories!district_id(*)`)
    .eq('employer_id', user.id)
    .order('created_at', { ascending: false });

  const navLinks = [
    { href: `/${locale}/employer/dashboard`, label: '📊 ภาพรวม' },
    { href: `/${locale}/employer/jobs`, label: '💼 จัดการประกาศงาน', active: true },
    { href: `/${locale}/employer/jobs/new`, label: '➕ ลงประกาศงานใหม่' },
  ];

  return (
    <div className="page-wrapper">
      <Header />
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
            {params.success && (
              <div className="alert alert-success" style={{ marginBottom: '16px' }}>
                🎉 ลงประกาศงานเรียบร้อยแล้ว! ประกาศงานของคุณกำลังรอการอนุมัติจากผู้ดูแลระบบ
              </div>
            )}

            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 className="dashboard-title">💼 ประกาศงานทั้งหมดของคุณ</h1>
                <p className="dashboard-subtitle">ทั้งหมด {jobs?.length || 0} รายการ</p>
              </div>
              <Link href={`/${locale}/employer/jobs/new`} className="btn btn-primary">
                <Plus size={16} /> ลงประกาศใหม่
              </Link>
            </div>

            {jobs && jobs.length > 0 ? (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ชื่อตำแหน่ง</th>
                      <th>ประเภทงาน</th>
                      <th>อำเภอ</th>
                      <th>ผู้เข้าชม</th>
                      <th>ผู้สมัคร</th>
                      <th>สถานะ</th>
                      <th>การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id}>
                        <td>
                          <Link href={`/${locale}/job/${job.id}`} style={{ fontWeight: 700, color: 'var(--color-primary-600)' }}>
                            {job.title}
                          </Link>
                        </td>
                        <td>
                          <span className={`badge ${job.job_type === 'fulltime' ? 'badge-fulltime' : job.job_type === 'daily' ? 'badge-daily' : 'badge-parttime'}`}>
                            {job.job_type === 'fulltime' ? 'ประจำ' : job.job_type === 'daily' ? 'รายวัน' : 'พาร์ทไทม์'}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--color-gray-600)' }}>{job.district?.name_th || '-'}</td>
                        <td><Eye size={12} style={{ display: 'inline', marginRight: '4px' }} />{job.views_count}</td>
                        <td><Users size={12} style={{ display: 'inline', marginRight: '4px' }} />{job.application_count}</td>
                        <td>
                          <span className={`badge ${job.status === 'active' ? 'badge-success' : job.status === 'pending' ? 'badge-pending' : 'badge-gray'}`}>
                            {job.status === 'active' ? 'เปิดรับ' : job.status === 'pending' ? 'รอตรวจ' : 'ปิดแล้ว'}
                          </span>
                        </td>
                        <td>
                          <Link href={`/${locale}/employer/jobs/${job.id}/applicants`} className="btn btn-primary btn-sm">
                            รายชื่อผู้สมัคร ({job.application_count})
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">💼</div>
                <h3 className="empty-state-title">ยังไม่มีประกาศงาน</h3>
                <p className="empty-state-desc">ลงประกาศรับสมัครงานได้ฟรี ไม่มีค่าใช้จ่าย</p>
                <Link href={`/${locale}/employer/jobs/new`} className="btn btn-primary">ลงประกาศงานฟรี</Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
