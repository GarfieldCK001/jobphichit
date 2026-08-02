'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/${locale}/auth/update-password`,
    });
    if (error) setError('ไม่พบอีเมลนี้ในระบบ');
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🌿 JobPhichit</div>
          <p className="auth-subtitle">รีเซ็ตรหัสผ่าน</p>
        </div>
        <div className="auth-body">
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>✉️</div>
              <h2 style={{ fontWeight: 800, marginBottom: '8px' }}>ส่งลิงก์แล้ว!</h2>
              <p style={{ color: 'var(--color-gray-500)', marginBottom: '24px' }}>
                กรุณาตรวจสอบอีเมล <strong>{email}</strong> และคลิกลิงก์รีเซ็ตรหัสผ่าน
              </p>
              <Link href={`/${locale}/auth/login`} className="btn btn-primary btn-block">
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', textAlign: 'center' }}>ลืมรหัสผ่าน?</h1>
              <p style={{ color: 'var(--color-gray-500)', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
                ใส่อีเมลของคุณ เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้
              </p>
              {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
              <form onSubmit={handleReset}>
                <div className="form-group">
                  <label className="form-label required">อีเมล</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
                    <input type="email" className="form-control" style={{ paddingLeft: '40px' }}
                      placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required id="forgot-email" />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={loading} id="forgot-submit-btn">
                  {loading ? '⏳ กำลังส่ง...' : '📨 ส่งลิงก์รีเซ็ต'}
                </button>
              </form>
              <p style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link href={`/${locale}/auth/login`} style={{ color: 'var(--color-primary-600)', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowLeft size={14} /> กลับไปหน้าเข้าสู่ระบบ
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
