import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import JobCard from '@/components/jobs/JobCard';
import type { JobPost } from '@/types';

export default async function BookmarksPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select(`*, job_posts(*, employer_profiles(*), district:categories!district_id(*), job_category:categories!job_category_id(*))`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const navLinks = [
    { href: `/${locale}/seeker/dashboard`, label: '📊 ภาพรวม' },
    { href: `/${locale}/seeker/profile`, label: '👤 โปรไฟล์' },
    { href: `/${locale}/seeker/applications`, label: '📋 ประวัติการสมัคร' },
    { href: `/${locale}/seeker/bookmarks`, label: '🔖 งานที่บันทึก', active: true },
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
              <h1 className="dashboard-title">🔖 งานที่บันทึกไว้</h1>
              <p className="dashboard-subtitle">ทั้งหมด {bookmarks?.length || 0} รายการ</p>
            </div>

            {bookmarks && bookmarks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bookmarks.map((bm: any) => (
                  <JobCard key={bm.id} job={bm.job_posts as JobPost} locale={locale} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🔖</div>
                <h3 className="empty-state-title">ยังไม่มีงานที่บันทึกไว้</h3>
                <p className="empty-state-desc">กดปุ่มไอคอนบุ๊กมาร์กที่การ์ดงานเพื่อบันทึกไว้ดูภายหลัง</p>
                <Link href={`/${locale}/jobs`} className="btn btn-primary">🔍 ค้นหางาน</Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
