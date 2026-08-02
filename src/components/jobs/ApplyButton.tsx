'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Send, BookmarkCheck, Bookmark, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  jobId: string;
  locale: string;
  employerId: string;
}

export default function ApplyButton({ jobId, locale, employerId }: Props) {
  const [status, setStatus] = useState<'idle' | 'applied' | 'own' | 'loading' | 'not_seeker'>('loading');
  const [bookmarked, setBookmarked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStatus('idle'); return; }
      if (user.id === employerId) { setStatus('own'); return; }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role === 'employer') { setStatus('not_seeker'); return; }

      const { data: app } = await supabase.from('applications')
        .select('id').eq('job_id', jobId).eq('seeker_id', user.id).single();
      setStatus(app ? 'applied' : 'idle');

      const { data: bm } = await supabase.from('bookmarks')
        .select('id').eq('job_id', jobId).eq('user_id', user.id).single();
      setBookmarked(!!bm);
    };
    check();
  }, []);

  const handleApply = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = `/${locale}/auth/login`; return; }
    setShowModal(true);
  };

  const submitApplication = async () => {
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('applications').insert({
      job_id: jobId, seeker_id: user.id,
      status: 'applied', cover_letter: coverLetter || null,
    });
    await supabase.from('job_posts').update({ application_count: supabase.rpc('increment', { x: 1 }) }).eq('id', jobId);
    setStatus('applied');
    setShowModal(false);
    setSubmitting(false);
  };

  const toggleBookmark = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = `/${locale}/auth/login`; return; }
    if (bookmarked) {
      await supabase.from('bookmarks').delete().match({ user_id: user.id, job_id: jobId });
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, job_id: jobId });
    }
    setBookmarked(!bookmarked);
  };

  if (status === 'loading') return <div style={{ height: '48px' }}></div>;
  if (status === 'own') return (
    <div className="alert alert-info">คุณเป็นเจ้าของประกาศงานนี้</div>
  );
  if (status === 'not_seeker') return (
    <div className="alert alert-warning">บัญชีนายจ้างไม่สามารถสมัครงานได้</div>
  );

  return (
    <>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {status === 'applied' ? (
          <div className="btn btn-primary btn-lg" style={{ cursor: 'default', opacity: 0.8 }}>
            <CheckCircle size={18} /> ส่งใบสมัครแล้ว
          </div>
        ) : (
          <button onClick={handleApply} className="btn btn-primary btn-lg" id="apply-job-btn">
            <Send size={18} /> สมัครงานนี้ (Quick Apply)
          </button>
        )}
        <button onClick={toggleBookmark} className="btn btn-secondary btn-lg" id="bookmark-job-btn">
          {bookmarked ? <BookmarkCheck size={18} color="var(--color-primary-500)" /> : <Bookmark size={18} />}
          {bookmarked ? 'บันทึกแล้ว' : 'บันทึก'}
        </button>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">📝 สมัครงานด่วน</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon">✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--color-gray-600)', marginBottom: '16px', fontSize: '14px' }}>
                ระบบจะส่งโปรไฟล์ของคุณไปยังนายจ้างทันที คุณสามารถเพิ่มข้อความแนะนำตัวได้ (ไม่บังคับ)
              </p>
              <div className="form-group">
                <label className="form-label">ข้อความถึงนายจ้าง <span style={{ color: 'var(--color-gray-400)', fontWeight: 400 }}>(ไม่บังคับ)</span></label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="แนะนำตัวเองสั้นๆ หรือเหตุผลที่อยากได้งานนี้..."
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  id="cover-letter-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn btn-ghost">ยกเลิก</button>
              <button onClick={submitApplication} className="btn btn-primary" disabled={submitting} id="submit-application-btn">
                {submitting ? '⏳ กำลังส่ง...' : '✅ ยืนยันสมัครงาน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
