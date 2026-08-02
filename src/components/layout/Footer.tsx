import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

export default async function Footer() {
  const t = await getTranslations();
  const locale = await getLocale();

  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div className="footer-brand-logo">
              <div className="footer-logo-icon">J</div>
              <span className="footer-logo-text">JobPhichit</span>
            </div>
            <p className="footer-tagline">
              {t('footer.tagline')}
            </p>
            <div className="footer-ad-contact">
              <div className="footer-ad-contact-title">📢 {t('footer.contactAd')}</div>
              <div className="footer-ad-contact-line">
                {t('footer.lineId')} <strong>chanatipfew</strong>
              </div>
            </div>
          </div>

          {/* Job Seeker Links */}
          <div>
            <div className="footer-col-title">{t('footer.forJobSeeker')}</div>
            <ul className="footer-links">
              <li><Link href={`/${locale}/jobs`} className="footer-link">🔍 {t('nav.findJob')}</Link></li>
              <li><Link href={`/${locale}/auth/register`} className="footer-link">📝 {t('nav.register')}</Link></li>
              <li><Link href={`/${locale}/seeker/profile`} className="footer-link">👤 {t('nav.profile')}</Link></li>
              <li><Link href={`/${locale}/seeker/applications`} className="footer-link">📋 {t('nav.applications')}</Link></li>
              <li><Link href={`/${locale}/seeker/bookmarks`} className="footer-link">🔖 {t('nav.bookmarks')}</Link></li>
            </ul>
          </div>

          {/* Employer Links */}
          <div>
            <div className="footer-col-title">{t('footer.forEmployer')}</div>
            <ul className="footer-links">
              <li><Link href={`/${locale}/employer/jobs/new`} className="footer-link">➕ {t('nav.postJob')}</Link></li>
              <li><Link href={`/${locale}/employer/dashboard`} className="footer-link">📊 {t('nav.dashboard')}</Link></li>
              <li><Link href={`/${locale}/employer/jobs`} className="footer-link">💼 {t('nav.myJobs')}</Link></li>
              <li><Link href={`/${locale}/auth/register`} className="footer-link">🏢 สมัครนายจ้าง</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="footer-col-title">{t('footer.legal')}</div>
            <ul className="footer-links">
              <li><Link href={`/${locale}/privacy`} className="footer-link">🔒 {t('footer.privacy')}</Link></li>
              <li><Link href={`/${locale}/terms`} className="footer-link">📄 {t('footer.terms')}</Link></li>
              <li>
                <a
                  href="https://line.me/ti/p/~chanatipfew"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  📢 ลงโฆษณา (Line: chanatipfew)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-disclaimer">
            ⚠️ {t('footer.disclaimer')}
          </p>
          <p className="footer-copyright">
            © {year} JobPhichit. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
