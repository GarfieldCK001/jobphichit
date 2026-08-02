'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  userId: string;
  currentRole: string;
}

export default function UserRoleChanger({ userId, currentRole }: Props) {
  const [role, setRole] = useState(currentRole);
  const [updating, setUpdating] = useState(false);
  const supabase = createClient();

  const handleChange = async (newRole: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (!error) setRole(newRole);
    setUpdating(false);
  };

  return (
    <select
      className="filter-select"
      value={role}
      onChange={(e) => handleChange(e.target.value)}
      disabled={updating}
      style={{ padding: '4px 8px', fontSize: '12px' }}
    >
      <option value="job_seeker">👤 ผู้หางาน</option>
      <option value="employer">🏢 นายจ้าง</option>
      <option value="admin">👑 แอดมิน</option>
    </select>
  );
}
