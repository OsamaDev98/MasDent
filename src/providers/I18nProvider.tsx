"use client";
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
  locale: string;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  const { i18n } = useTranslation();

  // activeLang drives the dir/font rendering.
  // Initialized from the server locale prop, but updated by client-side switches.
  const [activeLang, setActiveLang] = useState(i18n.language || locale);

  // ── Sync from server locale prop (real Next.js page navigation) ──────────────
  // Only triggers when the `locale` prop actually changes (i.e. the user navigated
  // to a different URL via router.push / link click, not history.pushState).
  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
    setActiveLang(locale);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // ── Listen to client-side language changes (instant switch via Navbar) ────────
  // When Navbar calls i18n.changeLanguage() directly, i18next fires this event.
  // We sync our local state so the dir/font wrapper re-renders immediately.
  useEffect(() => {
    const handler = (lang: string) => setActiveLang(lang);
    i18n.on('languageChanged', handler);
    return () => { i18n.off('languageChanged', handler); };
  }, [i18n]);

  const isAr = activeLang === 'ar';

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
