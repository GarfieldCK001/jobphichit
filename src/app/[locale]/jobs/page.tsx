import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/layout/CookieBanner';
import AdSlot from '@/components/ads/AdSlot';
import JobCard from '@/components/jobs/JobCard';
import JobsFilter from '@/components/jobs/JobsFilter';
import type { JobPost, AdSlot as AdSlotType, Category } from '@/types';

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function JobsPage({ searchParams }: Props) {
  const t = await getTranslations();
  const locale = await getLocale();
  const supabase = await createClient();
  const params = await searchParams;

  const keyword = params.keyword || '';
  const jobType = params.type || '';
  const districtName = params.district || '';
  const page = parseInt(params.page || '1');
  const limit = 10;

  // Build query
  let query = supabase
    .from('job_posts')
    .select(`*, employer_profiles(*), job_category:categories!job_category_id(*), district:categories!district_id(*)`, { count: 'exact' })
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (keyword) query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
  if (jobType && jobType !== 'all') query = query.eq('job_type', jobType);

  const { data: jobs, count } = await query;

  // Get categories for filter
  const { data: districts } = await supabase
    .from('categories')
    .select('*')
    .eq('type', 'district')
    .order('sort_order');

  const { data: jobCategories } = await supabase
    .from('categories')
    .select('*')
    .eq('type', 'job_category')
    .order('sort_order');

  // Ad slots
  const { data: adSlots } = await supabase.from('ad_slots').select('*').order('slot_number');
  const slots: AdSlotType[] = adSlots || [];
  const getSlot = (n: number) => slots.find(s => s.slot_number === n) || { id: n, slot_number: n, slot_name: `Slot ${n}`, slot_position: 'misc', slot_size: '300x250', image_url: null, target_url: null, advertiser_name: null, start_date: null, end_date: null, is_active: false, contact_line: 'chanatipfew', created_at: '' };

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        {/* Page Header */}
        <div style={{ background: 'linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))', padding: '40px 0 32px', color: 'white' }}>
          <div className="container">
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>🔍 {t('jobs.title')}</h1>
            <p style={{ opacity: 0.85 }}>
              {keyword && `"${keyword}" — `}
              {t('jobs.found', { count: count || 0 })}
            </p>
          </div>
        </div>

        <div className="section" style={{ paddingTop: '32px' }}>
          <div className="container">
            <div className="layout-with-sidebar">
              {/* Main */}
              <div>
                {/* Filter Bar */}
                <JobsFilter
                  districts={districts as Category[] || []}
                  jobCategories={jobCategories as Category[] || []}
                  locale={locale}
                  currentParams={params}
                />

                <div style={{ height: '16px' }} />

                {/* Job List */}
                {jobs && jobs.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(jobs as JobPost[]).map((job, idx) => (
                      <>
                        <JobCard key={job.id} job={job} locale={locale} />
                        {(idx + 1) % 5 === 0 && idx < jobs.length - 1 && (
                          <AdSlot key={`ad-${idx}`} slot={getSlot(7 + Math.floor(idx / 5))} />
                        )}
                      </>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <h3 className="empty-state-title">{t('jobs.noJobs')}</h3>
                    <p className="empty-state-desc">{t('jobs.noJobsDesc')}</p>
                    <Link href={`/${locale}/jobs`} className="btn btn-primary">
                      {t('common.clearFilter')}
                    </Link>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={`/${locale}/jobs?${new URLSearchParams({ ...params, page: String(p) })}`}
                        className={`page-btn ${page === p ? 'active' : ''}`}
                      >
                        {p}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="sidebar">
                <AdSlot slot={getSlot(3)} />
                <AdSlot slot={getSlot(4)} />
                {/* Job Type Quick Filter */}
                <div className="card">
                  <div className="card-header">
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-gray-700)' }}>ประเภทงาน</h3>
                  </div>
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { value: '', label: 'ทุกประเภท', emoji: '📋' },
                      { value: 'fulltime', label: 'งานประจำ', emoji: '💼' },
                      { value: 'parttime', label: 'พาร์ทไทม์', emoji: '⏰' },
                      { value: 'daily', label: 'รับจ้างรายวัน', emoji: '🌾' },
                    ].map(({ value, label, emoji }) => (
                      <Link
                        key={value}
                        href={`/${locale}/jobs?${value ? `type=${value}` : ''}`}
                        className={`btn btn-sm ${jobType === value ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        {emoji} {label}
                      </Link>
                    ))}
                  </div>
                </div>
                <AdSlot slot={getSlot(5)} />
              </aside>
            </div>
          </div>
        </div>

        {/* Footer Ads */}
        <div style={{ background: 'var(--color-primary-50)', padding: '24px 0' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            <AdSlot slot={getSlot(13)} />
            <AdSlot slot={getSlot(14)} />
            <AdSlot slot={getSlot(15)} />
          </div>
        </div>
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
