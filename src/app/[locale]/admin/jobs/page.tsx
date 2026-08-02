import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import AdminJobActions from './AdminJobActions';

export default async function AdminJobsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const supabase = await createClient();
  const locale = await getLocale();
  const params = await searchParams;
  const filterStatus = params.status || '';

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect(`/${locale}`);

  let query = supabase
    .from('job_posts')
    .select(`*, employer_profiles(*), district:categories!district_id(*)`)
    .order('created_at', { ascending: false });

  if (filterStatus) query = query.eq('status', filterStatus);

  const { data: jobs } = await query;

  const navLinks = [
    { href: `/${locale}/admin/dashboard`, label: '📊 ภาพรวม' },
    { href: `/${locale}/admin/jobs`, label: '💼 จัดการประกาศงาน', active: true },
    { href: `/${locale}/admin/users`, label: '👥 จัดการผู้ใช้' },
    { href: `/${locale}/admin/ads`, label: '📣 จัดการโฆษณา 15 ช่อง' },
    { href: `/${locale}/admin/categories`, label: '🏷️ จัดการหมวดหมู่' },
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
              <h1 className="dashboard-title">💼 จัดการประกาศงานทั้งหมด</h1>
              <p className="dashboard-subtitle">อนุมัติ / ปฏิเสธ / เปิด-ปิด ประกาศงานในระบบ</p>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[
                { value: '', label: 'ทั้งหมด' },
                { value: 'pending', label: '⏳ รออนุมัติ' },
                { value: 'active', label: '✅ อนุมัติแล้ว (แสดงผล)' },
                { value: 'rejected', label: '❌ ปฏิเสธ' },
                { value: 'closed', label: '🔒 ปิดรับสมัคร' },
              ].map(({ value, label }) => (
                <Link
                  key={value}
                  href={`/${locale}/admin/jobs${value ? `?status=${value}` : ''}`}
                  className={`badge ${filterStatus === value ? 'badge-green' : 'badge-gray'}`}
                  style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '13px' }}
                >
                  {label}
                </Link>
              ))}
            </div>

            {jobs && jobs.length > 0 ? (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ตำแหน่งงาน</th>
                      <th>บริษัท / นายจ้าง</th>
                      <th>ประเภท</th>
                      <th>อำเภอ</th>
                      <th>วันที่ลง</th>
                      <th>สถานะ</th>
                      <th>การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id}>
                        <td>
                          <Link href={`/${locale}/job/${job.id}`} target="_blank" style={{ fontWeight: 700, color: 'var(--color-primary-600)' }}>
                            {job.title}
                          </Link>
                        </td>
                        <td>{job.employer_profiles?.company_name || 'นายจ้าง'}</td>
                        <td>
                          <span className={`badge ${job.job_type === 'fulltime' ? 'badge-fulltime' : job.job_type === 'daily' ? 'badge-daily' : 'badge-parttime'}`}>
                            {job.job_type === 'fulltime' ? 'ประจำ' : job.job_type === 'daily' ? 'รายวัน' : 'พาร์ทไทม์'}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px' }}>{job.district?.name_th || '-'}</td>
                        <td style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>
                          {new Date(job.created_at).toLocaleDateString('th-TH')}
                        </td>
                        <td>
                          <span className={`badge ${job.status === 'active' ? 'badge-success' : job.status === 'pending' ? 'badge-pending' : 'badge-danger'}`}>
                            {job.status === 'active' ? 'เปิดใช้งาน' : job.status === 'pending' ? 'รอตรวจ' : job.status === 'rejected' ? 'ปฏิเสธ' : 'ปิดแล้ว'}
                          </span>
                        </td>
                        <td>
                          <AdminJobActions jobId={job.id} initialStatus={job.status} isFeatured={job.is_featured} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-state-desc">ไม่พบประกาศงานในหมวดหมู่นี้</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
