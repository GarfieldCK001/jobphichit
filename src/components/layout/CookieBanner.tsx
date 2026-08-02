'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

export default function CookieBanner() {
  const t = useTranslations('cookie');
  const locale = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setTimeout(() => setVisible(true), 1500);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie Consent">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Cookie size={20} color="var(--color-primary-400)" style={{ flexShrink: 0 }} />
        <p className="cookie-text">
          {t('message')}{' '}
          <Link href={`/${locale}/privacy`} style={{ color: 'var(--color-primary-400)', fontWeight: 600 }}>
            {t('learnMore')}
          </Link>
        </p>
      </div>
      <div className="cookie-actions">
        <button onClick={decline} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-gray-300)' }}>
          {t('decline')}
        </button>
        <button onClick={accept} className="btn btn-primary btn-sm">
          {t('accept')}
        </button>
      </div>
    </div>
  );
}
