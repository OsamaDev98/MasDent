import type { Metadata } from 'next';
import { I18nProvider } from '@/providers/I18nProvider';
import { inter, cairo } from '@/app/layout';

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
  const baseUrl = "https://masdent.com"; // Replace with actual production domain
  const title = isAr ? "ماس دينت | عيادة طب أسنان احترافية في الرياض" : "Mas Dent | Professional Dental Clinic & Orthodontics";
  const description = isAr
    ? "احصل على أفضل خدمات طب الأسنان في الرياض. زراعة الأسنان، التقويم، التبييض، والفينير مع نخبة من الأطباء في بيئة مريحة وحديثة."
    : "Premium dental services in Riyadh. Dental implants, orthodontics, teeth whitening, and veneers with top specialists in a modern, comfortable setting.";

  return {
    title,
    description,
    keywords: ["dental clinic", "dentist", "orthodontics", "implants", "Riyadh", "Mas Dent", "teeth whitening", "veneer", "عيادة أسنان", "طبيب أسنان", "زراعة أسنان", "تقويم"],
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${lang}`,
      languages: {
        'en': '/en',
        'ar': '/ar',
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${lang}`,
      siteName: 'Mas Dent Clinic',
      locale: isAr ? 'ar_SA' : 'en_US',
      type: 'website',
      images: ['/favicon.png?v=1'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/favicon.png?v=1'],
    },
    icons: {
      icon: [
        { url: '/favicon.png?v=1' },
      ],
      apple: [
        { url: '/favicon.png?v=1' },
      ],
    },
  };
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  const locale = lang === 'ar' ? 'ar' : 'en';

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={`${locale === 'ar' ? cairo.variable : inter.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`min-h-full flex flex-col ${locale === 'ar' ? 'font-arabic' : 'font-display'}`}>
        <I18nProvider locale={locale}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
