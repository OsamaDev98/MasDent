"use client";
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
  locale: string;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  const { i18n } = useTranslation();

  if (i18n.language !== locale) {
    i18n.changeLanguage(locale);
  }

  useEffect(() => {
    // Apply dir and lang to <html> on mount
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

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
