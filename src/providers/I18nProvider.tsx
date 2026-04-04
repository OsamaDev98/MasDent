"use client";
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
  locale: string;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const applyLocale = async () => {
      if (i18n.language !== locale) {
        await i18n.changeLanguage(locale);
      }
      // Apply dir and lang to <html>
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = locale;
      setMounted(true);
    };
    applyLocale();
  }, [locale, i18n]);

  const isAr = locale === 'ar';

  // Render immediately with correct dir/font class (avoids flash)
  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={isAr ? 'font-arabic' : 'font-display'}
      style={{ fontFamily: isAr ? 'var(--font-cairo), sans-serif' : undefined }}
    >
      {children}
    </div>
  );
}
