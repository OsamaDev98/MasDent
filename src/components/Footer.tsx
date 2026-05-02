"use client";

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useSettings } from '@/providers/SettingsProvider';

const SOCIAL_ICONS = [
  { icon: 'social_leaderboard', label: 'Facebook' },
  { icon: 'public', label: 'Twitter' },
  { icon: 'camera_alt', label: 'Instagram' },
];

export default function Footer() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const isAr = locale === 'ar';
  const { settings } = useSettings();

  return (
    <footer className="relative z-10 overflow-hidden" id="contact">
      {/* Main Footer */}
      <div className="bg-[#071f1d] text-slate-400 pt-16 pb-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

            {/* Brand Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="md:col-span-1"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-900/30">
                  <span className="material-symbols-outlined text-white text-xl">dentistry</span>
                </div>
                <div className="leading-none">
                  <p className="text-white font-black text-base tracking-tight">
                    {isAr ? settings?.clinicNameAr || 'ماس دينت' : settings?.clinicName || 'Mas Dent'}
                  </p>
                  <p className="text-teal-400/60 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                    {isAr ? 'عيادة متخصصة' : 'Dental Clinic'}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-500 mb-6">{t('footer.desc')}</p>
              <div className="flex gap-2.5">
                {SOCIAL_ICONS.map(({ icon, label }) => (
                  <motion.div key={label} whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}>
                    <Link
                      href="#"
                      aria-label={label}
                      className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-teal-500 hover:border-teal-500 transition-all group"
                    >
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-white text-[18px] transition-colors">{icon}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">{t('footer.quick_links')}</h4>
              <ul className="space-y-3 text-sm">
                {[
                  { label: t('footer.about'), href: '#' },
                  { label: t('nav.services'), href: '#services' },
                  { label: t('footer.links.patient_portal'), href: '#' },
                  { label: t('footer.links.privacy'), href: '#' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="group flex items-center gap-2 hover:text-teal-400 transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-teal-500/40 group-hover:bg-teal-400 transition-colors shrink-0" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.16 }}
            >
              <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">{t('contact.hours.title')}</h4>
              <ul className="space-y-3 text-sm">
                {settings?.workDays && settings.workDays.length > 0 && (
                  <li className="flex justify-between gap-4">
                    <span className="text-slate-400">{isAr ? 'أيام العمل' : 'Work Days'}</span>
                    <span className="font-semibold text-white">
                      {isAr
                        ? `${settings.workDays[0]} - ${settings.workDays[settings.workDays.length - 1]}`
                        : `${settings.workDays[0].slice(0, 3)} - ${settings.workDays[settings.workDays.length - 1].slice(0, 3)}`}
                    </span>
                  </li>
                )}
                {settings?.workStart && settings?.workEnd && (
                  <li className="flex justify-between gap-4">
                    <span className="text-slate-400">{isAr ? 'ساعات العمل' : 'Hours'}</span>
                    <span className="font-semibold text-white">
                      {settings.workStart} - {settings.workEnd}
                    </span>
                  </li>
                )}
              </ul>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.24 }}
            >
              <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">{t('contact.contact.title')}</h4>
              <ul className="space-y-4">
                {[
                  { icon: 'call', key: 'phone', href: `tel:${settings?.phone || '+15559990000'}`, value: settings?.phone || '+1 (555) 999-0000', label: isAr ? 'هاتف' : 'Phone' },
                  { icon: 'mail', key: 'email', href: `mailto:${settings?.email || 'billing@masdent.com'}`, value: settings?.email || 'billing@masdent.com', label: isAr ? 'البريد' : 'Email' },
                  { icon: 'location_on', key: 'address', href: '#', value: (isAr ? settings?.addressAr : settings?.address) || 'Egypt, SA', label: isAr ? 'العنوان' : 'Address' },
                ].map(({ icon, key, href, value, label }) => (
                  <li key={key} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-900/60 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-teal-400 text-[16px]">{icon}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">{label}</span>
                      <a href={href} className="text-sm text-slate-300 hover:text-teal-400 transition-colors font-medium break-all">{value}</a>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-600">{t('footer.copyright')}</p>
            <p className="text-xs text-slate-700">
              {isAr ? 'صُنع بـ ❤️ لمرضانا' : 'Crafted with ❤️ for our patients'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
