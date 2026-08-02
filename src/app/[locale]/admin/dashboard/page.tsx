import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import Header from '@/components/layout/Header';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const locale = await getLocale();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect(`/${locale}`);

  // Stats
  const [
    { count: totalUsers },
    { count: totalJobs },
    { count: pendingJobs },
    { count: totalApps },
    { count: totalEmployers },
    { count: totalSeekers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('job_posts').select('*', { count: 'exact', head: true }),
    supabase.from('job_posts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employer'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'job_seeker'),
  ]);

  const { data: pendingJobsList } = await supabase
    .from('job_posts')
    .select('*, employer_profiles(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: adSlots } = await supabase.from('ad_slots').select('*').order('slot_number');
  const activeAds = adSlots?.filter(s => s.is_active && s.image_url).length || 0;

  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <div className="dashboard-layout">
          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            <ul className="dashboard-nav">
              {[
                { href: `/${locale}/admin/dashboard`, label: '📊 ภาพรวม', active: true },
                { href: `/${locale}/admin/jobs`, label: '💼 จัดการประกาศงาน' },
                { href: `/${locale}/admin/users`, label: '👥 จัดการผู้ใช้' },
                { href: `/${locale}/admin/ads`, label: '📣 จัดการโฆษณา 15 ช่อง' },
                { href: `/${locale}/admin/categories`, label: '🏷️ จัดการหมวดหมู่' },
              ].map(({ href, label, active }) => (
                <li key={href} className="dashboard-nav-item">
                  <Link href={href} className={`dashboard-nav-link ${active ? 'active' : ''}`}>{label}</Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Content */}
          <div className="dashboard-main">
            <div className="dashboard-header">
              <h1 className="dashboard-title">📊 แผงควบคุมแอดมิน</h1>
              <p className="dashboard-subtitle">ยินดีต้อนรับ, {profile?.full_name || user.email}</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              {[
                { icon: '👥', label: 'ผู้ใช้ทั้งหมด', value: totalUsers || 0, color: '#dbeafe', iconColor: '#1d4ed8' },
                { icon: '💼', label: 'ประกาศงาน', value: totalJobs || 0, color: '#d1fae5', iconColor: '#065f46' },
                { icon: '⏳', label: 'รอการอนุมัติ', value: pendingJobs || 0, color: '#fef3c7', iconColor: '#d97706' },
                { icon: '📋', label: 'การสมัครงาน', value: totalApps || 0, color: '#ede9fe', iconColor: '#7c3aed' },
                { icon: '🏢', label: 'นายจ้าง', value: totalEmployers || 0, color: '#d1fae5', iconColor: '#065f46' },
                { icon: '🔍', label: 'ผู้หางาน', value: totalSeekers || 0, color: '#dbeafe', iconColor: '#1d4ed8' },
                { icon: '📣', label: 'โฆษณาที่ใช้งาน', value: activeAds, color: '#fef3c7', iconColor: '#d97706' },
                { icon: '🔲', label: 'ช่องโฆษณาว่าง', value: 15 - activeAds, color: '#fee2e2', iconColor: '#991b1b' },
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

            {/* Pending Jobs */}
            {pendingJobs && pendingJobs > 0 && (
              <div className="table-wrapper">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontWeight: 700, fontSize: '16px' }}>⏳ ประกาศงานรอการอนุมัติ ({pendingJobs})</h2>
                  <Link href={`/${locale}/admin/jobs`} className="btn btn-primary btn-sm">ดูทั้งหมด</Link>
                </div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>ชื่อตำแหน่ง</th>
                      <th>บริษัท</th>
                      <th>ประเภท</th>
                      <th>วันที่</th>
                      <th>การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingJobsList?.map((job) => (
                      <PendingJobRow key={job.id} job={job} locale={locale} supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Ad Slots Overview */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontWeight: 700, fontSize: '18px' }}>📣 สถานะโฆษณา 15 ช่อง</h2>
                <Link href={`/${locale}/admin/ads`} className="btn btn-primary btn-sm">จัดการโฆษณา</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {adSlots?.map((slot) => (
                  <div key={slot.id} style={{
                    padding: '12px', borderRadius: '8px', textAlign: 'center',
                    background: slot.is_active && slot.image_url ? 'var(--color-primary-50)' : 'var(--color-gray-50)',
                    border: `1px solid ${slot.is_active && slot.image_url ? 'var(--color-primary-300)' : 'var(--color-gray-200)'}`,
                  }}>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                      {slot.is_active && slot.image_url ? '✅' : '⬜'}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-700)' }}>ช่อง {slot.slot_number}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-gray-400)' }}>{slot.slot_size}</div>
                    {slot.is_active && slot.advertiser_name && (
                      <div style={{ fontSize: '10px', color: 'var(--color-primary-600)', fontWeight: 600, marginTop: '2px' }}>
                        {slot.advertiser_name.substring(0, 12)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Server component for pending job actions
function PendingJobRow({ job, locale, supabaseUrl }: { job: any; locale: string; supabaseUrl: string }) {
  const typeMap: Record<string, string> = { fulltime: 'งานประจำ', parttime: 'พาร์ทไทม์', daily: 'รายวัน' };
  return (
    <tr>
      <td style={{ fontWeight: 600 }}>{job.title}</td>
      <td>{job.employer_profiles?.company_name || '-'}</td>
      <td><span className={`badge badge-${job.job_type === 'daily' ? 'daily' : job.job_type === 'fulltime' ? 'fulltime' : 'parttime'}`}>{typeMap[job.job_type]}</span></td>
      <td style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>
        {new Date(job.created_at).toLocaleDateString('th-TH')}
      </td>
      <td>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Link href={`/${locale}/admin/jobs?approve=${job.id}`} className="btn btn-primary btn-sm">✅ อนุมัติ</Link>
          <Link href={`/${locale}/admin/jobs?reject=${job.id}`} className="btn btn-danger btn-sm">❌ ปฏิเสธ</Link>
        </div>
      </td>
    </tr>
  );
}
