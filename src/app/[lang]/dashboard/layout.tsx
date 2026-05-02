import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';

import { getSettings } from '@/lib/settings';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === 'ar';
  const settings = await getSettings();
  
  const clinicName = isAr 
    ? settings?.clinicNameAr || 'ماس دينت' 
    : settings?.clinicName || 'Mas Dent';

  return {
    title: `${clinicName} — ${isAr ? 'لوحة التحكم' : 'Dashboard'}`,
    robots: { index: false, follow: false },
  };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
      <Toaster />
    </div>
  );
}
