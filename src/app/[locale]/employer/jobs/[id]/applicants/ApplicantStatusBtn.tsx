'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  appId: string;
  initialStatus: string;
}

export default function ApplicantStatusBtn({ appId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [updating, setUpdating] = useState(false);
  const supabase = createClient();

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', appId);

    if (!error) {
      setStatus(newStatus);
    }
    setUpdating(false);
  };

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      <select
        className="filter-select"
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={updating}
        style={{ fontWeight: 600 }}
      >
        <option value="applied">📬 รอพิจารณา</option>
        <option value="reviewing">⏳ กำลังตรวจประวัติ</option>
        <option value="interview">📅 นัดสัมภาษณ์</option>
        <option value="hired">✅ รับเข้าทำงาน</option>
        <option value="rejected">❌ ไม่รับเลือก</option>
      </select>
    </div>
  );
}
