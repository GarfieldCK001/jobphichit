'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { Menu, X, Briefcase, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data }) => setProfile(data));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const switchLocale = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(/^\/(th|en|zh)/, '');
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    setUser(null);
    setProfile(null);
  };

  const getDashboardPath = () => {
    if (!profile) return `/${locale}`;
    if (profile.role === 'admin') return `/${locale}/admin/dashboard`;
    if (profile.role === 'employer') return `/${locale}/employer/dashboard`;
    return `/${locale}/seeker/dashboard`;
  };

  const navLinks = [
    { href: `/${locale}/jobs`, label: t('nav.findJob') },
    { href: `/${locale}/employer/jobs/new`, label: t('nav.postJob') },
  ];

  return (
    <header className="header">
      <div className="container">
        <div className="header-inner">
          {/* Logo */}
          <Link href={`/${locale}`} className="header-logo">
            <div className="header-logo-icon">J</div>
            <div className="header-logo-text">
              <span className="header-logo-main">JobPhichit</span>
              <span className="header-logo-sub">หางานพิจิตร</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="header-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname.startsWith(link.href) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="header-actions">
            {/* Language Switcher */}
            <div className="lang-switcher">
              {['th', 'en', 'zh'].map((l) => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  className={`lang-btn ${locale === l ? 'active' : ''}`}
                >
                  {l === 'th' ? 'ไทย' : l === 'en' ? 'EN' : '中文'}
                </button>
              ))}
            </div>

            {/* User Menu */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 12px 6px 6px', borderRadius: '9999px',
                    border: '2px solid var(--color-gray-200)', background: 'white',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <div className="avatar avatar-sm">
                    {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-gray-700)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={14} color="var(--color-gray-400)" />
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: '48px', right: 0, background: 'white',
                    border: '1px solid var(--color-gray-200)', borderRadius: '12px',
                    boxShadow: 'var(--shadow-lg)', minWidth: '180px', zIndex: 200,
                    overflow: 'hidden',
                  }}>
                    <Link href={getDashboardPath()} className="mobile-nav-link" onClick={() => setUserMenuOpen(false)}>
                      <User size={16} /> {t('nav.dashboard')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '14px 16px', width: '100%', border: 'none',
                        background: 'none', cursor: 'pointer', fontSize: '14px',
                        color: 'var(--color-danger)', fontFamily: 'inherit',
                        fontWeight: 500,
                      }}
                    >
                      <LogOut size={16} /> {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href={`/${locale}/auth/login`} className="btn btn-ghost btn-sm">
                  {t('nav.login')}
                </Link>
                <Link href={`/${locale}/auth/register`} className="btn btn-primary btn-sm">
                  {t('nav.register')}
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="เปิดเมนู"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--color-primary-600)' }}>JobPhichit</span>
          <button onClick={() => setMobileOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            <X size={22} color="var(--color-gray-600)" />
          </button>
        </div>

        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
            <Briefcase size={16} /> {link.label}
          </Link>
        ))}

        {user ? (
          <>
            <Link href={getDashboardPath()} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
              <User size={16} /> {t('nav.dashboard')}
            </Link>
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 16px', width: '100%', border: 'none',
              background: 'none', cursor: 'pointer', fontSize: '14px',
              color: 'var(--color-danger)', fontFamily: 'inherit',
              borderRadius: '8px', fontWeight: 500,
            }}>
              <LogOut size={16} /> {t('nav.logout')}
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            <Link href={`/${locale}/auth/login`} className="btn btn-secondary btn-block" onClick={() => setMobileOpen(false)}>
              {t('nav.login')}
            </Link>
            <Link href={`/${locale}/auth/register`} className="btn btn-primary btn-block" onClick={() => setMobileOpen(false)}>
              {t('nav.register')}
            </Link>
          </div>
        )}

        {/* Mobile Lang Switcher */}
        <div style={{ marginTop: '24px', borderTop: '1px solid var(--color-gray-100)', paddingTop: '24px' }}>
          <div className="lang-switcher" style={{ justifyContent: 'center' }}>
            {['th', 'en', 'zh'].map((l) => (
              <button
                key={l}
                onClick={() => { switchLocale(l); setMobileOpen(false); }}
                className={`lang-btn ${locale === l ? 'active' : ''}`}
              >
                {l === 'th' ? '🇹🇭 ไทย' : l === 'en' ? '🇬🇧 EN' : '🇨🇳 中文'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
