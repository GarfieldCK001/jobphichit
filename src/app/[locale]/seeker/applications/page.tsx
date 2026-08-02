import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { Clock, CheckCircle, XCircle, Calendar, TrendingUp } from 'lucide-react';
import Header from '@/components/layout/Header';

const statusMap: Record<string, { label: string; badgeClass: string }> = {
  applied: { label: 'ส่งใบสมัครแล้ว', badgeClass: 'status-applied' },
  reviewing: { label: 'กำลังพิจารณา', badgeClass: 'status-reviewing' },
  interview: { label: 'นัดสัมภาษณ์', badgeClass: 'status-interview' },
  hired: { label: 'รับเข้าทำงาน', badgeClass: 'status-hired' },
  rejected: { label: 'ไม่ผ่านการคัดเลือก', badgeClass: 'status-rejected' },
};

const jobTypeLabel: Record<string, string> = { fulltime: 'งานประจำ', parttime: 'พาร์ทไทม์', daily: 'รายวัน' };

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const supabase = await createClient();
  const locale = await getLocale();
  const params = await searchParams;
  const filterStatus = params.status || '';
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  let query = supabase
    .from('applications')
    .select(`*, job_posts(*, employer_profiles(*), district:categories!district_id(*))`)
    .eq('seeker_id', user.id)
    .order('applied_at', { ascending: false });

  if (filterStatus) query = query.eq('status', filterStatus);

  const { data: applications } = await query;

  const navLinks = [
    { href: `/${locale}/seeker/dashboard`, label: '📊 ภาพรวม' },
    { href: `/${locale}/seeker/profile`, label: '👤 โปรไฟล์' },
    { href: `/${locale}/seeker/applications`, label: '📋 ประวัติการสมัคร', active: true },
    { href: `/${locale}/seeker/bookmarks`, label: '🔖 งานที่บันทึก' },
    { href: `/${locale}/jobs`, label: '🔍 หางาน' },
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
            <div className="dashboard-header">
              <h1 className="dashboard-title">📋 ประวัติการสมัครงาน</h1>
              <p className="dashboard-subtitle">ทั้งหมด {applications?.length || 0} รายการ</p>
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {[
                { value: '', label: 'ทั้งหมด' },
                { value: 'applied', label: '📬 รอพิจารณา' },
                { value: 'reviewing', label: '⏳ กำลังพิจารณา' },
                { value: 'interview', label: '📅 นัดสัมภาษณ์' },
                { value: 'hired', label: '✅ รับงาน' },
                { value: 'rejected', label: '❌ ไม่ผ่าน' },
              ].map(({ value, label }) => (
                <Link
                  key={value}
                  href={`/${locale}/seeker/applications${value ? `?status=${value}` : ''}`}
                  className={`badge ${filterStatus === value ? 'badge-green' : 'badge-gray'}`}
                  style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '13px' }}
                >
                  {label}
                </Link>
              ))}
            </div>

            {applications && applications.length > 0 ? (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ตำแหน่งงาน</th>
                      <th>บริษัท</th>
                      <th>ประเภท</th>
                      <th>อำเภอ</th>
                      <th>วันที่สมัคร</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => {
                      const st = statusMap[app.status] || statusMap.applied;
                      const job = app.job_posts as any;
                      return (
                        <tr key={app.id}>
                          <td>
                            <Link href={`/${locale}/job/${app.job_id}`} style={{ fontWeight: 700, color: 'var(--color-primary-600)' }}>
                              {job?.title || '-'}
                            </Link>
                          </td>
                          <td style={{ color: 'var(--color-gray-600)' }}>{job?.employer_profiles?.company_name || '-'}</td>
                          <td>
                            <span className={`badge ${job?.job_type === 'fulltime' ? 'badge-fulltime' : job?.job_type === 'daily' ? 'badge-daily' : 'badge-parttime'}`}>
                              {jobTypeLabel[job?.job_type] || '-'}
                            </span>
                          </td>
                          <td style={{ fontSize: '13px', color: 'var(--color-gray-500)' }}>{job?.district?.name_th || '-'}</td>
                          <td style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>
                            {new Date(app.applied_at).toLocaleDateString('th-TH')}
                          </td>
                          <td>
                            <span className={`badge ${st.badgeClass}`}>{st.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h3 className="empty-state-title">
                  {filterStatus ? `ไม่มีการสมัครในสถานะ "${statusMap[filterStatus]?.label}"` : 'ยังไม่มีประวัติการสมัครงาน'}
                </h3>
                <p className="empty-state-desc">สมัครงานด่วนได้เลย ไม่ต้องแนบเรซูเม่ก็สมัครได้</p>
                <Link href={`/${locale}/jobs`} className="btn btn-primary">🔍 หางานเลย</Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
