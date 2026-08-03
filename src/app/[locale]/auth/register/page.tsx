'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { User, Mail, Lock, Phone, Building2, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();

  const [role, setRole] = useState<'job_seeker' | 'employer'>('job_seeker');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/${locale}/auth/callback?role=${role}` },
    });
  };

  const handleFacebookLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${location.origin}/${locale}/auth/callback?role=${role}` },
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPwd) { setError('รหัสผ่านไม่ตรงกัน'); return; }
    if (password.length < 8) { setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); return; }
    if (!agreed) { setError('กรุณายอมรับข้อกำหนดการใช้งาน'); return; }

    setLoading(true);
    setError('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role, phone, company_name: companyName },
          emailRedirectTo: `${location.origin}/${locale}/auth/callback?role=${role}`,
        },
      });

      if (signUpError) {
        const errorMsg = signUpError.message || JSON.stringify(signUpError);
        console.error('Supabase SignUp Error:', signUpError);
        if (errorMsg.toLowerCase().includes('already registered') || errorMsg.toLowerCase().includes('already exists')) {
          setError('อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบ');
        } else if (errorMsg.toLowerCase().includes('invalid email')) {
          setError('รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
        } else if (errorMsg.toLowerCase().includes('password')) {
          setError('รหัสผ่านไม่ผ่านเงื่อนไข กรุณาใช้รหัสผ่านที่มีความยาวอย่างน้อย 8 ตัวอักษร');
        } else {
          setError(`เกิดข้อผิดพลาด: ${errorMsg}`);
        }
      } else if (data.user) {
        // If session exists (email confirmation disabled), save profile immediately
        if (data.session) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            role,
            full_name: fullName,
            phone,
          }, { onConflict: 'id' });

          if (role === 'employer' && companyName) {
            await supabase.from('employer_profiles').upsert({
              user_id: data.user.id,
              company_name: companyName,
            }, { onConflict: 'user_id' });
          }
        }
        // Show success — profile will be created by DB trigger or on first login
        setSuccess(
          data.session
            ? `สมัครสมาชิกสำเร็จ! ยินดีต้อนรับสู่ JobPhichit`
            : `ส่งอีเมลยืนยันตัวตนไปที่ ${email} แล้ว กรุณาเช็คอีเมลและคลิกลิงก์เพื่อเปิดใช้งานบัญชี`
        );
      } else {
        setError('ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">🌿 JobPhichit</div>
          </div>
          <div className="auth-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✉️</div>
            <h2 style={{ fontWeight: 800, marginBottom: '8px' }}>สมัครสมาชิกสำเร็จ!</h2>
            <p style={{ color: 'var(--color-gray-500)', marginBottom: '24px' }}>{success}</p>
            <Link href={`/${locale}/auth/login`} className="btn btn-primary btn-block">
              ไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <div className="auth-logo">🌿 JobPhichit</div>
          <p className="auth-subtitle">สมัครสมาชิกฟรี — ใช้งานได้ทันที</p>
        </div>

        <div className="auth-body">
          <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', textAlign: 'center' }}>
            {t('auth.register')}
          </h1>

          {/* Role Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">{t('auth.registerAs')}</label>
            <div className="role-selector">
              <div
                className={`role-option ${role === 'job_seeker' ? 'selected' : ''}`}
                onClick={() => setRole('job_seeker')}
                id="role-job-seeker"
              >
                <div className="role-icon">👤</div>
                <div className="role-label">{t('auth.jobSeeker')}</div>
              </div>
              <div
                className={`role-option ${role === 'employer' ? 'selected' : ''}`}
                onClick={() => setRole('employer')}
                id="role-employer"
              >
                <div className="role-icon">🏢</div>
                <div className="role-label">{t('auth.employer')}</div>
              </div>
            </div>
          </div>

          {/* Social Login */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button onClick={handleGoogleLogin} className="social-login-btn" style={{ flex: 1 }} id="google-register-btn">
              <svg width="16" height="16" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              Google
            </button>
            <button onClick={handleFacebookLogin} className="social-login-btn" style={{ flex: 1 }} id="facebook-register-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">หรือกรอกข้อมูล</span>
            <div className="divider-line"></div>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label required">{t('auth.fullName')}</label>
              <input type="text" className="form-control" value={fullName}
                onChange={(e) => setFullName(e.target.value)} required placeholder="ชื่อ นามสกุล" id="register-name" />
            </div>

            {role === 'employer' && (
              <div className="form-group">
                <label className="form-label required">{t('auth.companyName')}</label>
                <input type="text" className="form-control" value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)} required placeholder="ชื่อบริษัท / ร้านค้า" id="register-company" />
              </div>
            )}

            <div className="form-group">
              <label className="form-label required">{t('auth.email')}</label>
              <input type="email" className="form-control" value={email}
                onChange={(e) => setEmail(e.target.value)} required placeholder="email@example.com" id="register-email" />
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.phone')}</label>
              <input type="tel" className="form-control" value={phone}
                onChange={(e) => setPhone(e.target.value)} placeholder="0812345678" id="register-phone" />
            </div>

            <div className="form-group">
              <label className="form-label required">{t('auth.password')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingRight: '40px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  id="register-password"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-gray-400)' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">{t('auth.confirmPassword')}</label>
              <input type="password" className="form-control" value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)} required placeholder="••••••••" id="register-confirm-password" />
            </div>

            {/* Agreement */}
            <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', marginBottom: '20px', fontSize: '13px', color: 'var(--color-gray-600)' }}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: '2px', accentColor: 'var(--color-primary-500)' }} id="register-agree" />
              <span>
                {t('auth.agreeTerms')}{' '}
                <Link href={`/${locale}/terms`} style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>{t('auth.termsLink')}</Link>
                {' '}{t('auth.and')}{' '}
                <Link href={`/${locale}/privacy`} style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>{t('auth.privacyLink')}</Link>
              </span>
            </label>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading} id="register-submit-btn">
              {loading ? <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span> : `🌿 ${t('auth.register')}ฟรี`}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--color-gray-500)', marginTop: '20px' }}>
            {t('auth.haveAccount')}{' '}
            <Link href={`/${locale}/auth/login`} style={{ color: 'var(--color-primary-600)', fontWeight: 700 }}>
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
