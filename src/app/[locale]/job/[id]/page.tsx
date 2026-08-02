import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { MapPin, Clock, Banknote, Building2, Phone, Users, Eye, Calendar, ChevronLeft, Share2, Flag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/layout/CookieBanner';
import AdSlot from '@/components/ads/AdSlot';
import JobCard from '@/components/jobs/JobCard';
import ApplyButton from '@/components/jobs/ApplyButton';
import type { JobPost, AdSlot as AdSlotType } from '@/types';

const jobTypeLabel: Record<string, string> = {
  fulltime: 'งานประจำ',
  parttime: 'พาร์ทไทม์',
  daily: 'รับจ้างรายวัน',
};
const jobTypeBadge: Record<string, string> = {
  fulltime: 'badge-fulltime',
  parttime: 'badge-parttime',
  daily: 'badge-daily',
};

function formatSalary(job: JobPost): string {
  if (job.salary_display) return job.salary_display;
  const unit = job.salary_type === 'daily' ? '/วัน' : job.salary_type === 'per_piece' ? '/ชิ้น' : '/เดือน';
  if (job.salary_min && job.salary_max)
    return `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} บาท${unit}`;
  if (job.salary_min) return `${job.salary_min.toLocaleString()}+ บาท${unit}`;
  return 'ตกลงกันได้';
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const supabase = await createClient();

  // Increment view count
  await supabase.rpc('increment_job_views', { job_id: id });

  const { data: job } = await supabase
    .from('job_posts')
    .select(`*, employer_profiles(*), job_category:categories!job_category_id(*), district:categories!district_id(*)`)
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (!job) notFound();

  const j = job as JobPost & { employer_profiles: any; job_category: any; district: any };

  // Similar jobs
  const { data: similarJobs } = await supabase
    .from('job_posts')
    .select(`*, employer_profiles(*), job_category:categories!job_category_id(*), district:categories!district_id(*)`)
    .eq('status', 'active')
    .eq('job_type', job.job_type)
    .neq('id', id)
    .limit(4);

  // Ad slots
  const { data: adSlots } = await supabase.from('ad_slots').select('*').order('slot_number');
  const slots: AdSlotType[] = adSlots || [];
  const getSlot = (n: number): AdSlotType => slots.find(s => s.slot_number === n) || {
    id: n, slot_number: n, slot_name: `Slot ${n}`, slot_position: 'misc',
    slot_size: '300x250', image_url: null, target_url: null, advertiser_name: null,
    start_date: null, end_date: null, is_active: false, contact_line: 'chanatipfew', created_at: ''
  };

  const companyName = j.employer_profiles?.company_name || 'บริษัท';
  const logoUrl = j.employer_profiles?.logo_url;
  const districtName = j.district?.name_th || '';
  const categoryName = j.job_category?.name_th || '';
  const expires = job.expires_at ? new Date(job.expires_at).toLocaleDateString('th-TH') : '-';
  const posted = new Date(job.created_at).toLocaleDateString('th-TH');

  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        {/* Breadcrumb */}
        <div style={{ background: 'var(--color-gray-50)', padding: '12px 0', borderBottom: '1px solid var(--color-gray-200)' }}>
          <div className="container">
            <div className="breadcrumb">
              <Link href={`/${locale}`} style={{ color: 'var(--color-primary-600)' }}>หน้าหลัก</Link>
              <span className="breadcrumb-sep">/</span>
              <Link href={`/${locale}/jobs`} style={{ color: 'var(--color-primary-600)' }}>หางาน</Link>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">{job.title}</span>
            </div>
          </div>
        </div>

        <div className="section" style={{ paddingTop: '24px' }}>
          <div className="container">
            <div className="layout-with-sidebar">

              {/* Main Content */}
              <div>
                {/* Job Header Card */}
                <div className="card" style={{ marginBottom: '16px' }}>
                  <div className="card-body">
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div className="job-card-logo" style={{ width: '72px', height: '72px', fontSize: '28px' }}>
                        {logoUrl ? <img src={logoUrl} alt={companyName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : companyName[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: '6px' }}>{job.title}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <Building2 size={14} color="var(--color-gray-400)" />
                          <span style={{ fontSize: '15px', color: 'var(--color-gray-600)', fontWeight: 600 }}>{companyName}</span>
                          {districtName && <>
                            <MapPin size={14} color="var(--color-gray-400)" />
                            <span style={{ fontSize: '14px', color: 'var(--color-gray-500)' }}>{districtName}</span>
                          </>}
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                      <span className={`badge ${jobTypeBadge[job.job_type] || 'badge-gray'}`} style={{ fontSize: '13px', padding: '5px 14px' }}>
                        {jobTypeLabel[job.job_type]}
                      </span>
                      {categoryName && <span className="badge badge-green" style={{ fontSize: '13px', padding: '5px 14px' }}>{categoryName}</span>}
                      <span className="badge badge-gray" style={{ fontSize: '13px', padding: '5px 14px' }}>
                        <Eye size={12} /> {job.views_count} ครั้งที่ดู
                      </span>
                      <span className="badge badge-gray" style={{ fontSize: '13px', padding: '5px 14px' }}>
                        <Users size={12} /> {job.application_count} คนสมัคร
                      </span>
                    </div>

                    {/* Key Info Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '12px', marginBottom: '24px' }}>
                      {[
                        { icon: <Banknote size={16} />, label: 'ค่าตอบแทน', value: formatSalary(j), highlight: true },
                        { icon: <Calendar size={16} />, label: 'ลงประกาศ', value: posted },
                        { icon: <Clock size={16} />, label: 'รับสมัครถึง', value: expires },
                      ].map(({ icon, label, value, highlight }) => (
                        <div key={label} style={{ background: highlight ? 'var(--color-primary-50)' : 'var(--color-gray-50)', padding: '12px', borderRadius: '10px', border: `1px solid ${highlight ? 'var(--color-primary-200)' : 'var(--color-gray-200)'}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: highlight ? 'var(--color-primary-600)' : 'var(--color-gray-400)', marginBottom: '4px' }}>
                            {icon}
                            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
                          </div>
                          <div style={{ fontWeight: 700, color: highlight ? 'var(--color-primary-700)' : 'var(--color-gray-800)', fontSize: '14px' }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Apply Button */}
                    <ApplyButton jobId={job.id} locale={locale} employerId={job.employer_id} />
                  </div>
                </div>

                {/* Job Description */}
                <div className="card" style={{ marginBottom: '16px' }}>
                  <div className="card-header"><h2 style={{ fontWeight: 700, fontSize: '16px' }}>📋 รายละเอียดงาน</h2></div>
                  <div className="card-body">
                    <div style={{ lineHeight: 1.8, color: 'var(--color-gray-700)', whiteSpace: 'pre-wrap' }}>
                      {job.description}
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                {job.requirements && (
                  <div className="card" style={{ marginBottom: '16px' }}>
                    <div className="card-header"><h2 style={{ fontWeight: 700, fontSize: '16px' }}>✅ คุณสมบัติที่ต้องการ</h2></div>
                    <div className="card-body">
                      <div style={{ lineHeight: 1.8, color: 'var(--color-gray-700)', whiteSpace: 'pre-wrap' }}>
                        {job.requirements}
                      </div>
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div style={{ background: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--color-gray-400)', lineHeight: 1.6 }}>
                    ⚠️ <strong>ข้อจำกัดความรับผิดชอบ:</strong> JobPhichit เป็นเพียงตัวกลางระหว่างผู้หางานและนายจ้าง ไม่มีส่วนรับผิดชอบต่อข้อตกลงหรือข้อพิพาทใดๆ ที่เกิดขึ้นระหว่างคู่สัญญา กรุณาตรวจสอบความน่าเชื่อถือของนายจ้างก่อนสมัครงาน
                  </p>
                </div>

                {/* In-feed Ad */}
                <div style={{ marginBottom: '24px' }}>
                  <AdSlot slot={getSlot(10)} />
                </div>

                {/* Similar Jobs */}
                {similarJobs && similarJobs.length > 0 && (
                  <div>
                    <h2 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '16px' }}>💼 งานที่คล้ายกัน</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(similarJobs as JobPost[]).map(sj => <JobCard key={sj.id} job={sj} locale={locale} />)}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="sidebar">
                <AdSlot slot={getSlot(3)} />

                {/* Company Info */}
                <div className="card">
                  <div className="card-header"><h3 style={{ fontWeight: 700, fontSize: '14px' }}>🏢 ข้อมูลบริษัท</h3></div>
                  <div className="card-body">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                      <div className="job-card-logo" style={{ width: '48px', height: '48px' }}>
                        {logoUrl ? <img src={logoUrl} alt={companyName} /> : companyName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--color-gray-800)' }}>{companyName}</div>
                        {districtName && <div style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>{districtName}</div>}
                      </div>
                    </div>
                    {j.employer_profiles?.company_phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-gray-600)' }}>
                        <Phone size={14} /> {j.employer_profiles.company_phone}
                      </div>
                    )}
                    {j.employer_profiles?.company_description && (
                      <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginTop: '8px', lineHeight: 1.6 }}>
                        {j.employer_profiles.company_description}
                      </p>
                    )}
                  </div>
                </div>

                <AdSlot slot={getSlot(4)} />
                <AdSlot slot={getSlot(5)} />

                {/* Share */}
                <div className="card">
                  <div className="card-body">
                    <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-gray-700)' }}>📤 แชร์ประกาศงาน</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a href={`https://www.facebook.com/share/link/?u=${encodeURIComponent(`https://jobphichit.com/${locale}/job/${id}`)}`}
                        target="_blank" rel="noopener" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                        Facebook
                      </a>
                      <a href={`https://line.me/R/msg/text/?${encodeURIComponent(`${job.title} - JobPhichit\nhttps://jobphichit.com/${locale}/job/${id}`)}`}
                        target="_blank" rel="noopener" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                        Line
                      </a>
                    </div>
                  </div>
                </div>
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
