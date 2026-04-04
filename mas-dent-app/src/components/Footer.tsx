"use client";

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <footer className="bg-[#050505] text-slate-400 py-16 px-4 border-t border-white/5 relative z-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 text-white mb-6">
              <span className="material-symbols-outlined text-primary text-3xl font-bold">dentistry</span>
              <h2 className="text-xl font-bold tracking-tight">{locale === 'ar' ? 'ماس دينت' : 'Mas Dent'}</h2>
            </div>
            <p className="text-sm leading-relaxed mb-6">{t('footer.desc')}</p>
            <div className="flex gap-4">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-primary hover:text-black hover:border-transparent transition-all cursor-pointer" href="#">
                  <span className="material-symbols-outlined text-white text-xl">social_leaderboard</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-primary hover:text-black hover:border-transparent transition-all cursor-pointer" href="#">
                  <span className="material-symbols-outlined text-white text-xl">public</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-primary hover:text-black hover:border-transparent transition-all cursor-pointer" href="#">
                  <span className="material-symbols-outlined text-white text-xl">camera_alt</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-bold mb-6">{t('footer.quick_links')}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link className="hover:text-primary transition-colors cursor-pointer" href="#">{t('footer.about')}</Link></li>
              <li><Link className="hover:text-primary transition-colors cursor-pointer" href="#">{t('nav.services')}</Link></li>
              <li><Link className="hover:text-primary transition-colors cursor-pointer" href="#">{t('footer.links.patient_portal')}</Link></li>
              <li><Link className="hover:text-primary transition-colors cursor-pointer" href="#">{t('footer.links.privacy')}</Link></li>
            </ul>
          </motion.div>
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-bold mb-6">{t('contact.hours.title')}</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between border-b border-slate-800 pb-2">
                <span>{t('contact.hours.d1').split(': ')[0]}</span>
                <span className="text-white">{t('contact.hours.d1').split(': ').slice(1).join(': ')}</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-2">
                <span>{t('contact.hours.d2').split(': ')[0]}</span>
                <span className="text-white">{t('contact.hours.d2').split(': ').slice(1).join(': ')}</span>
              </li>
              <li className="flex justify-between pb-2">
                <span>{t('contact.hours.d3').split(': ')[0]}</span>
                <span className="text-white text-primary">{t('contact.hours.d3').split(': ').slice(1).join(': ')}</span>
              </li>
            </ul>
          </motion.div>
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-bold mb-6">{t('contact.contact.title')}</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">emergency</span>
                <div>
                  <span className="block text-xs text-slate-500">{t('contact.contact.d1').split(': ')[0]}</span>
                  <a href="tel:+15559990000" className="text-white hover:text-primary transition-colors cursor-pointer">{t('contact.contact.d1').split(': ').slice(1).join(': ')}</a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">payments</span>
                <div>
                  <span className="block text-xs text-slate-500">{t('contact.contact.d2').split(': ')[0]}</span>
                  <a href="mailto:billing@masdent.com" className="text-white hover:text-primary transition-colors cursor-pointer">{t('contact.contact.d2').split(': ').slice(1).join(': ')}</a>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
        <motion.div
          variants={itemVariants}
          className="pt-8 border-t border-white/10 text-center text-xs"
        >
          <p>{t('footer.copyright')}</p>
        </motion.div>
      </motion.div>
    </footer>
  );
}
