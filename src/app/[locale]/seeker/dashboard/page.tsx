import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { Briefcase, User, Bookmark, FileText, Clock, CheckCircle, XCircle, Calendar, TrendingUp } from 'lucide-react';
import Header from '@/components/layout/Header';

export default async function SeekerDashboard() {
  const supabase = await createClient();
  const locale = await getLocale();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (profile?.role === 'employer') redirect(`/${locale}/employer/dashboard`);
  if (profile?.role === 'admin') redirect(`/${locale}/admin/dashboard`);

  const { data: seekerProfile } = await supabase.from('job_seeker_profiles').select('*').eq('user_id', user.id).single();

  const { data: applications, count: appCount } = await supabase
    .from('applications')
    .select(`*, job_posts(*, employer_profiles(*), district:categories!district_id(*))`, { count: 'exact' })
    .eq('seeker_id', user.id)
    .order('applied_at', { ascending: false })
    .limit(5);

  const { count: bookmarkCount } = await supabase
    .from('bookmarks').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

  const statusCounts = {
    applied: applications?.filter(a => a.status === 'applied').length || 0,
    reviewing: applications?.filter(a => a.status === 'reviewing').length || 0,
    interview: applications?.filter(a => a.status === 'interview').length || 0,
    hired: applications?.filter(a => a.status === 'hired').length || 0,
  };

  const statusMap: Record<string, { label: string; class: string; icon: any }> = {
    applied: { label: 'ส่งใบสมัครแล้ว', class: 'status-applied', icon: Clock },
    reviewing: { label: 'กำลังพิจารณา', class: 'status-reviewing', icon: TrendingUp },
    interview: { label: 'นัดสัมภาษณ์', class: 'status-interview', icon: Calendar },
    hired: { label: 'รับเข้าทำงาน', class: 'status-hired', icon: CheckCircle },
    rejected: { label: 'ไม่ผ่านการคัดเลือก', class: 'status-rejected', icon: XCircle },
  };

  const navLinks = [
    { href: `/${locale}/seeker/dashboard`, label: '📊 ภาพรวม', icon: TrendingUp },
    { href: `/${locale}/seeker/profile`, label: '👤 โปรไฟล์ของฉัน', icon: User },
    { href: `/${locale}/seeker/applications`, label: '📋 ประวัติการสมัคร', icon: FileText },
    { href: `/${locale}/seeker/bookmarks`, label: '🔖 งานที่บันทึก', icon: Bookmark },
    { href: `/${locale}/jobs`, label: '🔍 หางานเพิ่มเติม', icon: Briefcase },
  ];

  const profileComplete = !!(seekerProfile?.skills?.length || seekerProfile?.bio || seekerProfile?.resume_url);

  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <div className="dashboard-layout">
          <aside className="dashboard-sidebar">
            <div style={{ padding: '16px', borderBottom: '1px solid var(--color-gray-100)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="avatar avatar-md" style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-600)', fontSize: '18px', fontWeight: 800 }}>
                  {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-gray-800)' }}>{profile?.full_name || 'ผู้หางาน'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>{user.email}</div>
                </div>
              </div>
            </div>
            <ul className="dashboard-nav" style={{ paddingTop: '8px' }}>
              {navLinks.map(({ href, label }) => (
                <li key={href} className="dashboard-nav-item">
                  <Link href={href} className={`dashboard-nav-link ${href.endsWith('/dashboard') ? 'active' : ''}`}>{label}</Link>
                </li>
              ))}
            </ul>
          </aside>

          <div className="dashboard-main">
            <div className="dashboard-header">
              <h1 className="dashboard-title">สวัสดี, {profile?.full_name?.split(' ')[0] || 'คุณ'} 👋</h1>
              <p className="dashboard-subtitle">แดชบอร์ดผู้หางาน — ติดตามสถานะการสมัครงาน</p>
            </div>

            {/* Profile Completion Alert */}
            {!profileComplete && (
              <div className="alert alert-warning" style={{ marginBottom: '24px' }}>
                ⚡ <strong>โปรไฟล์ยังไม่สมบูรณ์</strong> — กรอกข้อมูลให้ครบเพื่อเพิ่มโอกาสได้รับการพิจารณา
                <Link href={`/${locale}/seeker/profile`} className="btn btn-primary btn-sm" style={{ marginLeft: '12px' }}>
                  อัปเดตโปรไฟล์
                </Link>
              </div>
            )}

            {/* Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: '24px' }}>
              {[
                { label: 'สมัครทั้งหมด', value: appCount || 0, color: '#dbeafe', iconColor: '#1d4ed8', emoji: '📋' },
                { label: 'กำลังพิจารณา', value: statusCounts.reviewing, color: '#fef3c7', iconColor: '#d97706', emoji: '⏳' },
                { label: 'นัดสัมภาษณ์', value: statusCounts.interview, color: '#ede9fe', iconColor: '#7c3aed', emoji: '📅' },
                { label: 'งานที่บันทึก', value: bookmarkCount || 0, color: '#d1fae5', iconColor: '#065f46', emoji: '🔖' },
              ].map(({ label, value, color, iconColor, emoji }) => (
                <div key={label} className="stat-card">
                  <div className="stat-card-icon" style={{ background: color }}>
                    <span style={{ fontSize: '20px' }}>{emoji}</span>
                  </div>
                  <div className="stat-card-value" style={{ color: iconColor }}>{value}</div>
                  <div className="stat-card-label">{label}</div>
                </div>
              ))}
            </div>

            {/* Recent Applications */}
            <div className="table-wrapper">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontWeight: 700, fontSize: '16px' }}>📋 การสมัครงานล่าสุด</h2>
                <Link href={`/${locale}/seeker/applications`} className="btn btn-secondary btn-sm">ดูทั้งหมด</Link>
              </div>
              {applications && applications.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>ตำแหน่งงาน</th>
                      <th>บริษัท</th>
                      <th>อำเภอ</th>
                      <th>วันที่สมัคร</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => {
                      const st = statusMap[app.status] || statusMap.applied;
                      return (
                        <tr key={app.id}>
                          <td>
                            <Link href={`/${locale}/job/${app.job_id}`} style={{ fontWeight: 600, color: 'var(--color-primary-600)' }}>
                              {(app.job_posts as any)?.title || '-'}
                            </Link>
                          </td>
                          <td>{(app.job_posts as any)?.employer_profiles?.company_name || '-'}</td>
                          <td>{(app.job_posts as any)?.district?.name_th || '-'}</td>
                          <td style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>
                            {new Date(app.applied_at).toLocaleDateString('th-TH')}
                          </td>
                          <td>
                            <span className={`badge ${st.class}`}>{st.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state" style={{ padding: '40px' }}>
                  <div className="empty-state-icon">📋</div>
                  <h3 className="empty-state-title">ยังไม่มีประวัติการสมัครงาน</h3>
                  <Link href={`/${locale}/jobs`} className="btn btn-primary">🔍 หางานเลย</Link>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Link href={`/${locale}/seeker/profile`} className="card" style={{ textDecoration: 'none', padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '32px' }}>👤</span>
                <div>
                  <div style={{ fontWeight: 700 }}>อัปเดตโปรไฟล์</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-gray-400)' }}>เพิ่มทักษะ, เรซูเม่, ประวัติ</div>
                </div>
              </Link>
              <Link href={`/${locale}/jobs`} className="card" style={{ textDecoration: 'none', padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '32px' }}>🔍</span>
                <div>
                  <div style={{ fontWeight: 700 }}>ค้นหางาน</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-gray-400)' }}>ดูประกาศงานใหม่ล่าสุด</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
