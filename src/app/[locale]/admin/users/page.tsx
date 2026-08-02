import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import UserRoleChanger from './UserRoleChanger';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect(`/${locale}`);

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const navLinks = [
    { href: `/${locale}/admin/dashboard`, label: '📊 ภาพรวม' },
    { href: `/${locale}/admin/jobs`, label: '💼 จัดการประกาศงาน' },
    { href: `/${locale}/admin/users`, label: '👥 จัดการผู้ใช้', active: true },
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
              <h1 className="dashboard-title">👥 จัดการสมาชิกและสิทธิ์ (Roles)</h1>
              <p className="dashboard-subtitle">สมาชิกทั้งหมดในระบบ {users?.length || 0} คน</p>
            </div>

            {users && users.length > 0 ? (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ชื่อ-นามสกุล</th>
                      <th>เบอร์โทรศัพท์</th>
                      <th>สิทธิ์การใช้งาน (Role)</th>
                      <th>วันที่สมัคร</th>
                      <th>เปลี่ยนสิทธิ์</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600 }}>{u.full_name || 'ผู้ใช้'}</td>
                        <td style={{ fontSize: '13px', color: 'var(--color-gray-600)' }}>{u.phone || '-'}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'employer' ? 'badge-info' : 'badge-green'}`}>
                            {u.role === 'admin' ? '👑 แอดมิน' : u.role === 'employer' ? '🏢 นายจ้าง' : '👤 ผู้หางาน'}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>
                          {new Date(u.created_at).toLocaleDateString('th-TH')}
                        </td>
                        <td>
                          <UserRoleChanger userId={u.id} currentRole={u.role} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-state-desc">ยังไม่มีผู้ใช้งานในระบบ</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
