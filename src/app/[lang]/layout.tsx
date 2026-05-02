import type { Metadata } from 'next';
import { I18nProvider } from '@/providers/I18nProvider';
import { SettingsProvider } from '@/providers/SettingsProvider';
import { HtmlAttributeSetter } from '@/components/HtmlAttributeSetter';
import { getSettings } from '@/lib/settings';

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ar' }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === 'ar';
  const baseUrl = 'https://masdent.com';

  const settings = await getSettings();

  const defaultTitleAr = 'ماس دينت | عيادة طب أسنان احترافية في الرياض';
  const defaultTitleEn = 'Mas Dent | Professional Dental Clinic & Orthodontics';
  const clinicName = isAr ? settings?.clinicNameAr || 'ماس دينت' : settings?.clinicName || 'Mas Dent';

  const title = isAr
    ? (settings?.clinicNameAr ? `${settings.clinicNameAr} | عيادة طب أسنان` : defaultTitleAr)
    : (settings?.clinicName ? `${settings.clinicName} | Dental Clinic` : defaultTitleEn);

  const description = isAr
    ? 'احصل على أفضل خدمات طب الأسنان في الرياض. زراعة الأسنان، التقويم، التبييض، والفينير مع نخبة من الأطباء في بيئة مريحة وحديثة.'
    : 'Premium dental services in Egypt. Dental implants, orthodontics, teeth whitening, and veneers with top specialists in a modern, comfortable setting.';

  return {
    title,
    description,
    keywords: ['dental clinic', 'dentist', 'orthodontics', 'implants', 'Egypt', 'Mas Dent'],
    metadataBase: new URL(baseUrl),
    alternates: { canonical: `/${lang}`, languages: { en: '/en', ar: '/ar' } },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${lang}`,
      siteName: 'Mas Dent Clinic',
      locale: isAr ? 'ar_SA' : 'en_US',
      type: 'website',
      images: ['/favicon.png?v=1'],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/favicon.png?v=1'] },
    icons: { icon: [{ url: '/favicon.png?v=1' }], apple: [{ url: '/favicon.png?v=1' }] },
  };
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  const locale = lang === 'ar' ? 'ar' : 'en';
  const settings = await getSettings();

  return (
    <>
      <HtmlAttributeSetter
        lang={locale}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      />
      {/*
        Material Symbols is loaded via <head> link in the root layout.tsx
        This keeps it in <head> for faster LCP and avoids FOUT.
      */}
      <SettingsProvider settings={settings || {}}>
        <I18nProvider locale={locale}>
          <div className={`min-h-full flex flex-col ${locale === 'ar' ? 'font-arabic' : 'font-display'}`}>
            {children}
          </div>
        </I18nProvider>
      </SettingsProvider>
    </>
  );
}
