"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = ['home', 'services', 'team', 'contact'] as const;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || 'en';
  const isAr = lang === 'ar';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const switchLang = () => router.push(`/${lang === 'en' ? 'ar' : 'en'}`);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled
        ? 'top-0 mx-0 rounded-none bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-900/6 border-b border-slate-200/60'
        : 'top-3 mx-3 sm:mx-6 rounded-2xl glass shadow-xl shadow-slate-900/8'
        }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-7">
        <div className="flex items-center justify-between h-[68px]">

          {/* Logo */}
          <Link href={`/${lang}`} className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#0a4f49] to-[#14b8a6] flex items-center justify-center shadow-lg shadow-teal-900/20"
            >
              <span className="material-symbols-outlined text-[22px] text-white font-bold">dentistry</span>
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
            <div className="leading-none">
              <p className="text-base font-black tracking-tight text-gradient">
                {isAr ? 'ماس دينت' : 'Mas Dent'}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 mt-0.5">
                {isAr ? 'عيادة متخصصة' : 'Dental Clinic'}
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item}
                href={item === 'home' ? `/${lang}` : `#${item}`}
                className="relative px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#0a4f49] transition-colors rounded-xl hover:bg-teal-50/80 group"
              >
                {t(`nav.${item}`)}
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-[#0a4f49] rounded-full transition-all duration-300 group-hover:w-4" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            {/* Lang Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={switchLang}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-black tracking-widest text-slate-700 transition-all border border-slate-200/60"
            >
              {isAr ? 'EN' : 'AR'}
            </motion.button>

            {/* CTA Book */}
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="hidden sm:flex btn-gold h-10 px-5 text-xs tracking-widest uppercase font-black gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              {t('nav.book')}
            </motion.a>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-all"
            >
              <span className="material-symbols-outlined text-xl">{mobileOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-t border-slate-100/80 bg-white/95 backdrop-blur-xl"
          >
            <div className="px-5 py-5 flex flex-col gap-1">
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={item === 'home' ? `/${lang}` : `#${item}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-[#0a4f49] hover:bg-teal-50 rounded-xl transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                      {item === 'home' ? 'home' : item === 'services' ? 'medical_services' : item === 'team' ? 'groups' : 'call'}
                    </span>
                    {t(`nav.${item}`)}
                  </Link>
                </motion.div>
              ))}
              <motion.a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-3 btn-gold h-12 px-5 text-xs tracking-widest uppercase font-black gap-2"
              >
                <span className="material-symbols-outlined text-sm">calendar_month</span>
                {t('nav.book')}
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
