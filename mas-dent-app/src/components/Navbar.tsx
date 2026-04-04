"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || 'en';

  const handleLangSwitch = () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    router.push(`/${newLang}`);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-4 left-4 right-4 z-50 rounded-2xl glass shadow-2xl border border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href={`/${lang}`} className="flex items-center gap-3 text-primary cursor-pointer">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-[0_0_20px_rgba(20,184,166,0.3)]"
            >
              <span className="material-symbols-outlined text-3xl font-bold text-white">
                dentistry
              </span>
            </motion.div>
            <h2 className="text-xl font-black uppercase tracking-widest text-gradient">
              {lang === 'ar' ? 'ماس دينت' : 'Mas Dent'}
            </h2>
          </Link>
          <nav className="hidden md:flex items-center gap-10">
            {['home', 'services', 'team', 'contact'].map((item) => (
              <Link 
                key={item}
                className="text-sm font-semibold uppercase tracking-wider text-slate-300 hover:text-white transition-all hover:scale-105" 
                href={item === 'home' ? `/${lang}` : `#${item}`}
              >
                {t(`nav.${item}`)}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLangSwitch}
              className="text-xs font-bold uppercase tracking-widest w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
            >
              {lang === 'en' ? 'AR' : 'EN'}
            </motion.button>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex bg-gradient-to-r from-accent to-yellow-600 text-white rounded-full h-12 px-8 items-center justify-center text-sm font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all cursor-pointer uppercase tracking-widest"
            >
              {t('nav.book')}
            </motion.a>
            <button
              className="md:hidden p-2 text-slate-400 cursor-pointer hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="material-symbols-outlined text-3xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden flex flex-col bg-surface p-6 gap-6 overflow-hidden rounded-b-2xl border-t border-white/5"
          >
            {['home', 'services', 'team', 'contact'].map((item) => (
              <Link 
                key={item}
                className="text-sm font-semibold uppercase tracking-wider text-slate-300 hover:text-white transition-colors" 
                href={item === 'home' ? `/${lang}` : `#${item}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t(`nav.${item}`)}
              </Link>
            ))}
            <motion.a
              href="#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex bg-gradient-to-r from-accent to-yellow-600 text-white rounded-full h-14 px-6 items-center justify-center text-sm font-bold mt-4 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.3)] uppercase tracking-widest"
            >
              {t('nav.book')}
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
