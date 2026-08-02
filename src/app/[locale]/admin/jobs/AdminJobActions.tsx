'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Check, X, Star } from 'lucide-react';

interface Props {
  jobId: string;
  initialStatus: string;
  isFeatured: boolean;
}

export default function AdminJobActions({ jobId, initialStatus, isFeatured }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [featured, setFeatured] = useState(isFeatured);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('job_posts')
      .update({ status: newStatus })
      .eq('id', jobId);

    if (!error) setStatus(newStatus);
    setLoading(false);
  };

  const toggleFeatured = async () => {
    setLoading(true);
    const newFeatured = !featured;
    const { error } = await supabase
      .from('job_posts')
      .update({ is_featured: newFeatured })
      .eq('id', jobId);

    if (!error) setFeatured(newFeatured);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {status === 'pending' && (
        <>
          <button onClick={() => updateStatus('active')} className="btn btn-primary btn-sm" disabled={loading} title="อนุมัติ">
            <Check size={14} /> อนุมัติ
          </button>
          <button onClick={() => updateStatus('rejected')} className="btn btn-danger btn-sm" disabled={loading} title="ปฏิเสธ">
            <X size={14} /> ปฏิเสธ
          </button>
        </>
      )}

      {status === 'active' && (
        <>
          <button onClick={() => updateStatus('closed')} className="btn btn-secondary btn-sm" disabled={loading}>
            ปิดรับ
          </button>
          <button
            onClick={toggleFeatured}
            className={`btn btn-sm ${featured ? 'btn-primary' : 'btn-ghost'}`}
            title="งานเด่น (แนะนำ)"
          >
            <Star size={14} fill={featured ? 'white' : 'none'} />
          </button>
        </>
      )}

      {status === 'rejected' && (
        <button onClick={() => updateStatus('active')} className="btn btn-secondary btn-sm" disabled={loading}>
          เปลี่ยนเป็นอนุมัติ
        </button>
      )}
    </div>
  );
}
