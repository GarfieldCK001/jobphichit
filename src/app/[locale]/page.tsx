import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import { Search, MapPin, Briefcase, Users, Building2, ChevronRight, TrendingUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/layout/CookieBanner';
import AdSlot from '@/components/ads/AdSlot';
import JobCard from '@/components/jobs/JobCard';
import HomeSearchBar from '@/components/jobs/HomeSearchBar';
import { createClient } from '@/lib/supabase/server';
import type { AdSlot as AdSlotType, JobPost } from '@/types';

export default async function HomePage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const supabase = await createClient();

  // Fetch ad slots
  const { data: adSlots } = await supabase
    .from('ad_slots')
    .select('*')
    .order('slot_number');

  const slots: AdSlotType[] = adSlots || Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    slot_number: i + 1,
    slot_name: `Slot ${i + 1}`,
    slot_position: 'header',
    slot_size: '300x250',
    image_url: null,
    target_url: null,
    advertiser_name: null,
    start_date: null,
    end_date: null,
    is_active: false,
    contact_line: 'chanatipfew',
    created_at: new Date().toISOString(),
  }));

  const getSlot = (num: number) => slots.find(s => s.slot_number === num) || slots[num - 1];

  // Fetch featured jobs
  const { data: featuredJobs } = await supabase
    .from('job_posts')
    .select(`*, employer_profiles(*), job_category:categories!job_category_id(*), district:categories!district_id(*)`)
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6);

  // Fetch latest jobs
  const { data: latestJobs } = await supabase
    .from('job_posts')
    .select(`*, employer_profiles(*), job_category:categories!job_category_id(*), district:categories!district_id(*)`)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(8);

  // Stats
  const { count: jobCount } = await supabase
    .from('job_posts').select('*', { count: 'exact', head: true }).eq('status', 'active');
  const { count: employerCount } = await supabase
    .from('employer_profiles').select('*', { count: 'exact', head: true });
  const { count: seekerCount } = await supabase
    .from('job_seeker_profiles').select('*', { count: 'exact', head: true });

  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">

        {/* ===== HEADER AD SLOTS (1-2) ===== */}
        <div style={{ background: 'var(--color-gray-50)', borderBottom: '1px solid var(--color-gray-200)', padding: '8px 0' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <AdSlot slot={getSlot(1)} />
              <AdSlot slot={getSlot(2)} />
            </div>
          </div>
        </div>

        {/* ===== HERO ===== */}
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-headline">{t('home.headline')}</h1>
              <p className="hero-subheadline">{t('home.subheadline')}</p>

              {/* Search Box */}
              <div className="hero-search">
                <HomeSearchBar locale={locale} t_search={t('home.searchBtn')} t_placeholder={t('home.searchPlaceholder')} t_allDistricts={t('home.allDistricts')} t_allTypes={t('home.allJobTypes')} />
              </div>

              {/* Stats */}
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-number">{jobCount || 0}+</span>
                  <span className="hero-stat-label">{t('home.stats.jobs')}</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-number">{employerCount || 0}+</span>
                  <span className="hero-stat-label">{t('home.stats.employers')}</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-number">{seekerCount || 0}+</span>
                  <span className="hero-stat-label">{t('home.stats.seekers')}</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-number">13</span>
                  <span className="hero-stat-label">{t('home.stats.districts')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== MAIN CONTENT + SIDEBAR ===== */}
        <div className="section">
          <div className="container">
            <div className="layout-with-sidebar">

              {/* ===== LEFT: JOB LISTINGS ===== */}
              <div>
                {/* Featured Jobs */}
                {featuredJobs && featuredJobs.length > 0 && (
                  <div style={{ marginBottom: '40px' }}>
                    <div className="section-header">
                      <div>
                        <h2 className="section-title">⭐ {t('home.featuredJobs')}</h2>
                      </div>
                      <Link href={`/${locale}/jobs`} className="btn btn-secondary btn-sm">
                        {t('home.viewAll')} <ChevronRight size={14} />
                      </Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(featuredJobs as JobPost[]).map((job) => (
                        <JobCard key={job.id} job={job} locale={locale} />
                      ))}
                    </div>
                  </div>
                )}

                {/* In-feed Ad 1 */}
                <div style={{ marginBottom: '24px' }}>
                  <AdSlot slot={getSlot(7)} />
                </div>

                {/* Latest Jobs */}
                <div>
                  <div className="section-header">
                    <div>
                      <h2 className="section-title">🕐 {t('home.latestJobs')}</h2>
                    </div>
                    <Link href={`/${locale}/jobs`} className="btn btn-secondary btn-sm">
                      {t('home.viewAll')} <ChevronRight size={14} />
                    </Link>
                  </div>

                  {latestJobs && latestJobs.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(latestJobs as JobPost[]).slice(0, 4).map((job) => (
                        <JobCard key={job.id} job={job} locale={locale} />
                      ))}

                      {/* In-feed Ad 2 */}
                      <AdSlot slot={getSlot(8)} />

                      {(latestJobs as JobPost[]).slice(4).map((job) => (
                        <JobCard key={job.id} job={job} locale={locale} />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">💼</div>
                      <h3 className="empty-state-title">ยังไม่มีประกาศงาน</h3>
                      <p className="empty-state-desc">เป็นนายจ้างคนแรกที่ลงประกาศงานในพิจิตร!</p>
                      <Link href={`/${locale}/employer/jobs/new`} className="btn btn-primary">
                        ลงประกาศงานฟรี
                      </Link>
                    </div>
                  )}
                </div>

                {/* In-feed Ad 3 */}
                <div style={{ marginTop: '24px' }}>
                  <AdSlot slot={getSlot(9)} />
                </div>
              </div>

              {/* ===== RIGHT: SIDEBAR ===== */}
              <aside className="sidebar">
                <AdSlot slot={getSlot(3)} />
                <AdSlot slot={getSlot(4)} />

                {/* Quick Links */}
                <div className="card">
                  <div className="card-header">
                    <h3 style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-gray-700)' }}>
                      🔗 ลิงก์ด่วน
                    </h3>
                  </div>
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Link href={`/${locale}/jobs?type=daily`} className="btn btn-secondary btn-sm">
                      🌾 งานรับจ้างรายวัน
                    </Link>
                    <Link href={`/${locale}/jobs?type=fulltime`} className="btn btn-secondary btn-sm">
                      💼 งานประจำ
                    </Link>
                    <Link href={`/${locale}/jobs?type=parttime`} className="btn btn-secondary btn-sm">
                      ⏰ พาร์ทไทม์
                    </Link>
                    <Link href={`/${locale}/employer/jobs/new`} className="btn btn-primary btn-sm">
                      ➕ ลงประกาศงานฟรี
                    </Link>
                  </div>
                </div>

                <AdSlot slot={getSlot(5)} />
                <AdSlot slot={getSlot(6)} />
              </aside>
            </div>
          </div>
        </div>

        {/* ===== BETWEEN SECTION ADS (11-12) ===== */}
        <div style={{ background: 'var(--color-gray-50)', padding: '24px 0', borderTop: '1px solid var(--color-gray-100)' }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <AdSlot slot={getSlot(11)} />
            <AdSlot slot={getSlot(12)} />
          </div>
        </div>

        {/* ===== HOW IT WORKS ===== */}
        <section className="how-it-works">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 className="section-title">{t('home.howItWorks')}</h2>
            </div>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3 className="step-title">{t('home.step1Title')}</h3>
                <p className="step-desc">{t('home.step1Desc')}</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h3 className="step-title">{t('home.step2Title')}</h3>
                <p className="step-desc">{t('home.step2Desc')}</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h3 className="step-title">{t('home.step3Title')}</h3>
                <p className="step-desc">{t('home.step3Desc')}</p>
              </div>
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', marginTop: '40px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href={`/${locale}/auth/register`} className="btn btn-primary btn-lg">
                🌿 สมัครสมาชิกฟรี
              </Link>
              <Link href={`/${locale}/jobs`} className="btn btn-secondary btn-lg">
                🔍 ดูงานทั้งหมด
              </Link>
            </div>
          </div>
        </section>

        {/* ===== IN-FEED AD 4 ===== */}
        <div style={{ padding: '24px 0' }}>
          <div className="container">
            <AdSlot slot={getSlot(10)} />
          </div>
        </div>

        {/* ===== DISCLAIMER ===== */}
        <div style={{ background: 'var(--color-gray-50)', padding: '16px 0', borderTop: '1px solid var(--color-gray-200)' }}>
          <div className="container">
            <p style={{ fontSize: '12px', color: 'var(--color-gray-400)', textAlign: 'center', lineHeight: 1.6 }}>
              ⚠️ {t('home.disclaimer')}
            </p>
          </div>
        </div>

        {/* ===== FOOTER ADS (13-14-15) ===== */}
        <div style={{ background: 'var(--color-primary-50)', padding: '24px 0' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <AdSlot slot={getSlot(13)} />
              <AdSlot slot={getSlot(14)} />
              <AdSlot slot={getSlot(15)} />
            </div>
          </div>
        </div>

      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
