'use client';

import Link from 'next/link';
import { MapPin, Clock, Banknote, Bookmark, BookmarkCheck } from 'lucide-react';
import { useState } from 'react';
import type { JobPost } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface Props {
  job: JobPost;
  locale: string;
}

const jobTypeBadge: Record<string, string> = {
  fulltime: 'badge-fulltime',
  parttime: 'badge-parttime',
  daily: 'badge-daily',
};

const jobTypeLabel: Record<string, string> = {
  fulltime: 'งานประจำ',
  parttime: 'พาร์ทไทม์',
  daily: 'รับจ้างรายวัน',
};

function formatSalary(job: JobPost): string {
  if (job.salary_display) return job.salary_display;
  if (job.salary_min && job.salary_max) {
    const unit = job.salary_type === 'daily' ? '/วัน' : job.salary_type === 'per_piece' ? '/ชิ้น' : '/เดือน';
    return `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} บาท${unit}`;
  }
  if (job.salary_min) return `${job.salary_min.toLocaleString()}+ บาท`;
  return 'ตกลงกันได้';
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} วันที่แล้ว`;
  return date.toLocaleDateString('th-TH');
}

export default function JobCard({ job, locale }: Props) {
  const [bookmarked, setBookmarked] = useState(false);
  const supabase = createClient();

  const companyName = (job as any).employer_profiles?.company_name || 'นายจ้าง';
  const logoUrl = (job as any).employer_profiles?.logo_url;
  const districtName = (job as any).district?.name_th || '';
  const categoryName = (job as any).job_category?.name_th || '';
  const initial = companyName[0]?.toUpperCase() || 'J';

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = `/${locale}/auth/login`; return; }

    if (bookmarked) {
      await supabase.from('bookmarks').delete().match({ user_id: user.id, job_id: job.id });
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, job_id: job.id });
    }
    setBookmarked(!bookmarked);
  };

  return (
    <Link href={`/${locale}/job/${job.id}`} className="job-card" style={{ textDecoration: 'none' }}>
      {/* Company Logo */}
      <div className="job-card-logo">
        {logoUrl ? (
          <img src={logoUrl} alt={companyName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          initial
        )}
      </div>

      {/* Content */}
      <div className="job-card-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 className="job-card-title">{job.title}</h3>
          <button
            onClick={handleBookmark}
            className="btn btn-ghost btn-icon"
            title="บันทึกงาน"
            style={{ flexShrink: 0, marginLeft: '8px' }}
          >
            {bookmarked
              ? <BookmarkCheck size={18} color="var(--color-primary-500)" />
              : <Bookmark size={18} color="var(--color-gray-400)" />
            }
          </button>
        </div>

        <p className="job-card-company">{companyName}</p>

        <div className="job-card-meta">
          <span className={`badge ${jobTypeBadge[job.job_type] || 'badge-gray'}`}>
            {jobTypeLabel[job.job_type] || job.job_type}
          </span>
          {districtName && (
            <span className="badge badge-gray">
              <MapPin size={10} /> {districtName}
            </span>
          )}
          {categoryName && (
            <span className="badge badge-green">
              {categoryName}
            </span>
          )}
        </div>

        <div className="job-card-actions">
          <span className="job-card-salary">
            <Banknote size={14} style={{ display: 'inline', marginRight: '4px' }} />
            {formatSalary(job)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-gray-400)' }}>
            <Clock size={12} />
            {timeAgo(job.created_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}
