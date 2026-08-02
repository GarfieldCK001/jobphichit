import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://jobphichit.com'),
  title: {
    default: 'หางานพิจิตร | JobPhichit - ตลาดงานออนไลน์จังหวัดพิจิตร',
    template: '%s | JobPhichit',
  },
  description:
    'หางานในจังหวัดพิจิตร ทั้งงานประจำ พาร์ทไทม์ และรับจ้างรายวัน ครบทุกอำเภอ สมัครงานฟรี ลงประกาศงานฟรี',
  keywords: ['หางานพิจิตร', 'งานพิจิตร', 'สมัครงานพิจิตร', 'รับจ้างรายวันพิจิตร', 'jobphichit'],
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: 'https://jobphichit.com',
    siteName: 'JobPhichit',
    title: 'หางานพิจิตร | JobPhichit',
    description: 'ตลาดงานออนไลน์สำหรับจังหวัดพิจิตร',
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  const langMap: Record<string, string> = {
    th: 'th',
    en: 'en',
    zh: 'zh-CN',
  };

  return (
    <html lang={langMap[locale] || 'th'}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
