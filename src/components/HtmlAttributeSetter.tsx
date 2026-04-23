"use client";
import { useEffect } from 'react';

/**
 * Sets <html> lang/dir/class attributes on the client.
 * Used by nested layouts that need locale-aware HTML attributes
 * without re-rendering the <html> tag itself.
 */
export function HtmlAttributeSetter({
  lang,
  dir,
  className,
}: {
  lang: string;
  dir: 'ltr' | 'rtl';
  className?: string;
}) {
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    if (className) document.documentElement.className = className;
  }, [lang, dir, className]);

  return null;
}
